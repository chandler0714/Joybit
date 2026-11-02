import SwiftUI
import AuthenticationServices
import CryptoKit
import Security

@MainActor
final class AuthModel: ObservableObject {
    @Published private(set) var appleAvailable = false
    @Published private(set) var session: AuthSession?
    @Published private(set) var checking = true
    @Published private(set) var busy = false
    @Published private(set) var pendingSignupEmail: String?
    @Published private(set) var resendAvailableAt = Date.distantPast
    private let now: () -> Date
    @Published var errorKey: String?
    @Published var noticeKey: String?
    private let service: AuthService?
    private let vault: any SessionStoring
    private var pendingNonce: String?
    private var generation = 0
    var configured: Bool { service != nil }
    var entered: Bool { session != nil }
    init(sessionStore: (any SessionStoring)? = nil, service suppliedService: AuthService? = nil, now: @escaping () -> Date = Date.init) {
        self.now = now
        let config = AuthConfiguration(url: Bundle.main.object(forInfoDictionaryKey: "SupabaseURL") as? String ?? "", key: Bundle.main.object(forInfoDictionaryKey: "SupabasePublishableKey") as? String ?? "")
        service = suppliedService ?? config.map { AuthService(configuration: $0) }
        vault = sessionStore ?? SessionVault(service: (Bundle.main.bundleIdentifier ?? "SteadyDrop") + ".auth." + (config?.url.host ?? "unconfigured"))
    }
    func refreshProviders() async {
        guard let service else { appleAvailable = false; return }
        do { appleAvailable = try await service.appleProviderEnabled() } catch { appleAvailable = false }
    }
    func restore() async {
        guard !busy else { checking = false; return }
        guard let service else { checking = false; return }
        busy = true
        let operation = generation
        defer { busy = false; checking = false }
        do {
            guard let stored = try vault.load() else { return }
            if let appleID = stored.appleUserID {
                let state: ASAuthorizationAppleIDProvider.CredentialState
                do { state = try await ASAuthorizationAppleIDProvider().credentialState(forUserID: appleID) }
                catch { throw AuthFailure.network }
                guard operation == generation else { return }
                guard state == .authorized else { try vault.clear(); session = nil; return }
            }
            var refreshed = try await service.refresh(stored.refresh_token)
            guard operation == generation else { return }
            refreshed.appleUserID = stored.appleUserID
            try vault.save(refreshed); session = refreshed
        } catch {
            guard operation == generation else { return }
            if let failure = error as? AuthFailure, failure == .credentials {
                try? vault.clear(); session = nil
            }
            errorKey = (error as? AuthFailure)?.key ?? "authServer"
        }
    }
    private func accept(_ session: AuthSession) throws {
        try vault.save(session)
        self.session = session; pendingSignupEmail = nil; errorKey = nil; noticeKey = nil
    }
    func email(email input: String, password: String, confirmation: String, registering: Bool) async {
        guard !busy else { return }
        let email = AuthInput.normalizedEmail(input)
        guard AuthInput.isEmail(email) else { errorKey = "authEmailError"; return }
        guard !password.isEmpty else { errorKey = "authPasswordError"; return }
        if registering {
            guard AuthInput.isPassword(password) else { errorKey = "authPasswordError"; return }
            guard confirmation == password else { errorKey = "authMismatch"; return }
        }
        guard let service else { errorKey = "authConfig"; return }
        busy = true; errorKey = nil; noticeKey = nil
        defer { busy = false }
        do {
            if registering {
                if let value = try await service.signUp(email: email, password: password) { try accept(value) }
                else { pendingSignupEmail = email; resendAvailableAt = now().addingTimeInterval(60); noticeKey = "authSignupCodeSent" }
            } else { try accept(await service.signIn(email: email, password: password)) }
        } catch {
            if !registering, error as? AuthFailure == .unconfirmed {
                pendingSignupEmail = email; noticeKey = "authSignupResendHint"; errorKey = nil
            } else { errorKey = (error as? AuthFailure)?.key ?? "authServer" }
        }
    }
    func resendSecondsRemaining(at date: Date) -> Int {
        max(0, Int(ceil(resendAvailableAt.timeIntervalSince(date))))
    }
    func cancelSignup() {
        guard !busy else { return }
        pendingSignupEmail = nil; errorKey = nil; noticeKey = nil
    }
    func verifySignup(code input: String) async {
        guard !busy, let email = pendingSignupEmail, let service else { return }
        let code = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard AuthInput.isEmailCode(code) else { errorKey = "authCodeFormat"; return }
        busy = true; errorKey = nil; defer { busy = false }
        do { try accept(await service.verifySignup(email: email, code: code)) }
        catch { errorKey = (error as? AuthFailure)?.key ?? "authServer" }
    }
    func resendSignup() async {
        guard !busy, let email = pendingSignupEmail, let service,
              resendSecondsRemaining(at:now()) == 0 else { return }
        busy = true; errorKey = nil; defer { busy = false }
        do {
            try await service.resendSignup(email:email)
            resendAvailableAt = now().addingTimeInterval(60); noticeKey = "authSignupCodeSent"
        } catch {
            if error as? AuthFailure == .rateLimit { resendAvailableAt = now().addingTimeInterval(60) }
            errorKey = (error as? AuthFailure)?.key ?? "authServer"
        }
    }
    func requestReset(email input: String) async -> Bool {
        guard !busy else { return false }
        let email = AuthInput.normalizedEmail(input)
        guard AuthInput.isEmail(email) else { errorKey = "authEmailError"; return false }
        guard let service else { errorKey = "authConfig"; return false }
        busy = true; errorKey = nil; noticeKey = nil; defer { busy = false }
        do { try await service.recover(email: email); noticeKey = "authCodeSent"; return true }
        catch { errorKey = (error as? AuthFailure)?.key ?? "authServer"; return false }
    }
    func reset(email: String, code: String, password: String, confirmation: String) async {
        guard !busy, let service else { return }
        guard AuthInput.isPassword(password) else { errorKey = "authPasswordError"; return }
        guard password == confirmation else { errorKey = "authMismatch"; return }
        guard AuthInput.isEmailCode(code) else { errorKey = "authCodeError"; return }
        busy = true; errorKey = nil; defer { busy = false }
        do { try accept(await service.resetPassword(email: AuthInput.normalizedEmail(email), code: code, newPassword: password)) }
        catch { errorKey = (error as? AuthFailure)?.key ?? "authServer" }
    }
    func prepareApple(_ request: ASAuthorizationAppleIDRequest) {
        guard configured, appleAvailable, !busy else { return }
        var bytes = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else { errorKey = "authAppleError"; return }
        let nonce = bytes.map { String(format: "%02x", $0) }.joined()
        pendingNonce = nonce
        request.requestedScopes = [.email]
        request.nonce = SHA256.hash(data: Data(nonce.utf8)).map { String(format: "%02x", $0) }.joined()
        busy = true; errorKey = nil; noticeKey = nil
    }
    func completeApple(_ result: Result<ASAuthorization, Error>) async {
        defer { pendingNonce = nil; busy = false }
        if case .failure(let error) = result {
            if (error as? ASAuthorizationError)?.code != .canceled { errorKey = "authAppleError" }
            return
        }
        guard case .success(let authorization) = result,
              let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let data = credential.identityToken, let token = String(data: data, encoding: .utf8),
              let nonce = pendingNonce, let service else { errorKey = "authAppleError"; return }
        do {
            var value = try await service.apple(idToken: token, nonce: nonce)
            value.appleUserID = credential.user
            try accept(value)
        } catch { errorKey = (error as? AuthFailure)?.key ?? "authAppleError" }
    }
    var requiresAppleDeletion: Bool {
        session?.appleUserID != nil || session?.user.app_metadata?.providers?.contains("apple") == true
    }
    private func finishDeletion(userID: String) {
        generation += 1
        // Remote deletion is final even if removing an already-invalid local token fails.
        try? vault.clear()
        UserDefaults.standard.removePersistentDomain(forName: "com.xuanniaozhixu.steadydrop.progress." + userID)
        session = nil; pendingSignupEmail = nil; errorKey = nil; noticeKey = "authDeleted"
    }
    func deleteAccount(password: String) async {
        guard !busy, let session, let service else { return }
        guard !requiresAppleDeletion, !password.isEmpty else { errorKey = "authCredentials"; return }
        busy = true; errorKey = nil; defer { busy = false }
        do {
            try await service.deleteAccount(token:session.access_token,password:password)
            finishDeletion(userID:session.user.id)
        } catch { errorKey = (error as? AuthFailure)?.key ?? "authServer" }
    }
    func completeAppleDeletion(_ result: Result<ASAuthorization,Error>) async {
        defer { pendingNonce = nil; busy = false }
        if case .failure(let error) = result {
            if (error as? ASAuthorizationError)?.code != .canceled { errorKey = "authAppleError" }
            return
        }
        guard case .success(let authorization) = result,
              let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken, let token = String(data:tokenData,encoding:.utf8),
              let codeData = credential.authorizationCode, let code = String(data:codeData,encoding:.utf8),
              let nonce = pendingNonce, let service, let current = session else { errorKey = "authAppleError"; return }
        do {
            let verified = try await service.apple(idToken:token,nonce:nonce)
            guard verified.user.id == current.user.id else { errorKey = "authCredentials"; return }
            try await service.deleteAccount(token:verified.access_token,appleAuthorizationCode:code)
            finishDeletion(userID:current.user.id)
        } catch { errorKey = (error as? AuthFailure)?.key ?? "authServer" }
    }
    func signOut() async {
        guard !busy else { return }
        generation += 1; errorKey = nil; noticeKey = nil
        guard let token = session?.access_token else { return }
        do { try vault.clear() } catch { errorKey = "authStorage"; return }
        session = nil
        if let service {
            busy = true; defer { busy = false }
            do { try await service.logout(token: token) }
            catch { noticeKey = "authLocalLogout" }
        }
    }
    func credentialRevoked() {
        guard session?.appleUserID != nil else { return }
        generation += 1
        do { try vault.clear(); session = nil; errorKey = "authAppleError" }
        catch { errorKey = "authStorage" }
    }
}
