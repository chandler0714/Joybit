import Foundation

struct LockedVault: SessionStoring {
    func load() throws -> AuthSession? { throw AuthFailure.storage }
    func save(_ session: AuthSession) throws { throw AuthFailure.storage }
    func clear() throws { throw AuthFailure.storage }
}
final class OTPVault: SessionStoring {
    var saved: AuthSession?
    func load() throws -> AuthSession? { saved }
    func save(_ session: AuthSession) throws { saved = session }
    func clear() throws { saved = nil }
}
final class OTPTransport: URLProtocol {
    static var requests = 0
    static var code = 200
    static var json = "{}"
    static var path = ""
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        Self.requests += 1; Self.path = request.url!.path
        client?.urlProtocol(self, didReceive: HTTPURLResponse(url:request.url!,statusCode:Self.code,httpVersion:nil,headerFields:nil)!,cacheStoragePolicy:.notAllowed)
        client?.urlProtocol(self, didLoad:Data(Self.json.utf8)); client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}
@main struct AuthModelTests {
    @MainActor static func main() async {
        let model = AuthModel(sessionStore: LockedVault())
        await model.restore()
        precondition(!model.checking && !model.entered && model.session == nil, "unconfigured app stays behind authentication gate")
        await model.email(email: "player@example.com", password: "abcdefgh", confirmation: "", registering: false)
        precondition(!model.entered && model.session == nil, "missing backend cannot authenticate")
        precondition(model.errorKey == "authConfig")
        await model.signOut()
        precondition(!model.entered && model.errorKey == nil, "signed out remains locked without accessing Keychain")
        let cfg = URLSessionConfiguration.ephemeral; cfg.protocolClasses = [OTPTransport.self]
        let service = AuthService(configuration:AuthConfiguration(url:"https://unit.invalid",key:"sb_publishable_test")!,urlSession:URLSession(configuration:cfg))
        let vault = OTPVault(); var clock = Date(timeIntervalSince1970:1000)
        let signup = AuthModel(sessionStore:vault, service:service, now:{ clock })
        OTPTransport.json = #"{"user":{"id":"test"},"session":null}"#
        await signup.email(email:"player@EXAMPLE.COM",password:"abcdefgh",confirmation:"abcdefgh",registering:true)
        precondition(signup.pendingSignupEmail == "player@example.com" && !signup.entered && vault.saved == nil)
        let initialRequests = OTPTransport.requests
        await signup.resendSignup(); precondition(OTPTransport.requests == initialRequests, "cooldown must block resend")
        await signup.verifySignup(code:"１２３４５６"); precondition(OTPTransport.requests == initialRequests, "non-ASCII code must not request")
        OTPTransport.code = 403; OTPTransport.json = #"{"error_code":"otp_expired"}"#
        await signup.verifySignup(code:"00123456")
        precondition(!signup.entered && signup.pendingSignupEmail != nil && signup.errorKey == "authCodeError")
        clock = clock.addingTimeInterval(61); OTPTransport.code = 200; OTPTransport.json = "{}"
        await signup.resendSignup(); precondition(OTPTransport.path == "/auth/v1/resend")
        precondition(signup.resendSecondsRemaining(at:clock) == 60)
        OTPTransport.json = #"{"access_token":"test-access","refresh_token":"test-refresh","user":{"id":"test"}}"#
        await signup.verifySignup(code:" 00123456 ")
        precondition(signup.entered && signup.pendingSignupEmail == nil && vault.saved?.user.id == "test")
        await signup.signOut()
        OTPTransport.code = 400; OTPTransport.json = #"{"error_code":"email_not_confirmed"}"#
        await signup.email(email:"player@example.com",password:"abcdefgh",confirmation:"",registering:false)
        precondition(signup.pendingSignupEmail == "player@example.com" && !signup.entered)
        signup.cancelSignup(); precondition(signup.pendingSignupEmail == nil)
        precondition(AuthInput.isEmailCode("001234") && AuthInput.isEmailCode("00123456") && !AuthInput.isEmailCode("12345"))
        let deleteVault = OTPVault()
        let deletion = AuthModel(sessionStore:deleteVault,service:service)
        OTPTransport.code = 200
        OTPTransport.json = #"{"access_token":"test-access","refresh_token":"test-refresh","user":{"id":"delete-test","email":"player@example.com"}}"#
        await deletion.email(email:"player@example.com",password:"abcdefgh",confirmation:"",registering:false)
        let progress = UserDefaults(suiteName:"com.xuanniaozhixu.steadydrop.progress.delete-test")!
        progress.set(8,forKey:"unlocked")
        OTPTransport.code = 503; OTPTransport.json = "{}"
        await deletion.deleteAccount(password:"abcdefgh")
        precondition(deletion.entered && deleteVault.saved != nil && progress.integer(forKey:"unlocked") == 8, "failed deletion preserves account and progress")
        OTPTransport.code = 200; OTPTransport.json = #"{"deleted":true}"#
        await deletion.deleteAccount(password:"abcdefgh")
        precondition(!deletion.entered && deleteVault.saved == nil && progress.object(forKey:"unlocked") == nil, "successful deletion clears only this account")
        print("Signup code: pending state, cooldown, ASCII validation, expiry, resend, session storage and existing-unconfirmed recovery passed")
        print("Auth model: mandatory login gate and missing-backend handling passed")
    }
}
