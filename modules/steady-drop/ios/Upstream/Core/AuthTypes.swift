import Foundation

enum AppLinks {
    static let privacy = URL(string: "https://epanda.com.cn/steady-drop/privacy.html")!
    static let support = URL(string: "mailto:chandler@epanda.com.cn")!
}

enum AuthInput {
    static func normalizedEmail(_ input: String) -> String {
        let clean = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let at = clean.lastIndex(of: "@") else { return clean }
        return String(clean[...at]) + clean[clean.index(after: at)...].lowercased()
    }
    static func isEmail(_ input: String) -> Bool {
        input.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil && input.count <= 254
    }
    static func isEmailCode(_ input: String) -> Bool {
        (6...10).contains(input.utf8.count) && input.utf8.allSatisfy { (48...57).contains($0) }
    }
    static func isPassword(_ input: String) -> Bool { input.count >= 8 && input.utf8.count <= 128 }
}

struct AuthConfiguration: Equatable {
    let url: URL
    let key: String
    init?(url: String, key: String) {
        guard let parsed = URL(string: url), parsed.scheme == "https", parsed.host != nil,
              parsed.user == nil, parsed.password == nil, parsed.query == nil, parsed.fragment == nil,
              parsed.path.isEmpty || parsed.path == "/" else { return nil }
        let publicKey: Bool
        if key.hasPrefix("sb_publishable_") { publicKey = key.count > 15 }
        else {
            let parts = key.split(separator: ".")
            if parts.count == 3 {
                var b64 = String(parts[1]).replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
                b64 += String(repeating: "=", count: (4 - b64.count % 4) % 4)
                let json = Data(base64Encoded: b64).flatMap { try? JSONSerialization.jsonObject(with: $0) } as? [String: Any]
                publicKey = json?["role"] as? String == "anon"
            } else { publicKey = false }
        }
        guard publicKey else { return nil }
        self.url = parsed; self.key = key
    }
}

struct AuthMetadata: Codable, Equatable { var providers: [String]? }
struct AuthUser: Codable, Equatable {
    let id: String
    let email: String?
    var app_metadata: AuthMetadata? = nil
}
struct AuthSession: Codable {
    let access_token: String
    let refresh_token: String
    let expires_in: Double?
    let user: AuthUser
    var appleUserID: String?
}

enum AuthFailure: Error {
    case configuration, invalidEmail, weakPassword, mismatch, credentials, unconfirmed, rateLimit, network, server, apple, storage, expiredCode, deletionSetup
    var key: String {
        switch self {
        case .deletionSetup: return "authDeleteSetup"
        case .configuration: return "authConfig"
        case .invalidEmail: return "authEmailError"
        case .weakPassword: return "authPasswordError"
        case .mismatch: return "authMismatch"
        case .credentials: return "authCredentials"
        case .unconfirmed: return "authUnconfirmed"
        case .rateLimit: return "authRateLimit"
        case .network: return "authNetwork"
        case .apple: return "authAppleError"
        case .storage: return "authStorage"
        case .expiredCode: return "authCodeError"
        case .server: return "authServer"
        }
    }
}
