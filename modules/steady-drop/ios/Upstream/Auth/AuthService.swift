import Foundation

struct AuthService {
    let configuration: AuthConfiguration
    var urlSession: URLSession = .shared
    private func request(_ path: String, query: [URLQueryItem] = [], body: [String: String] = [:], token: String? = nil) async throws -> Data {
        var components = URLComponents(url: configuration.url.appendingPathComponent("auth/v1/" + path), resolvingAgainstBaseURL: false)!
        if !query.isEmpty { components.queryItems = query }
        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"; request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(configuration.key, forHTTPHeaderField: "apikey")
        if let token { request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization") }
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let data: Data, response: URLResponse
        do { (data, response) = try await urlSession.data(for: request) }
        catch { throw AuthFailure.network }
        guard let http = response as? HTTPURLResponse else { throw AuthFailure.server }
        guard (200..<300).contains(http.statusCode) else {
            let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
            let code = json?["error_code"] as? String ?? json?["code"] as? String ?? ""
            if http.statusCode == 429 { throw AuthFailure.rateLimit }
            if code == "email_not_confirmed" { throw AuthFailure.unconfirmed }
            if code == "otp_expired" || code == "otp_disabled" { throw AuthFailure.expiredCode }
            if code == "weak_password" { throw AuthFailure.weakPassword }
            if http.statusCode == 400 || http.statusCode == 401 || http.statusCode == 403 { throw AuthFailure.credentials }
            throw AuthFailure.server
        }
        return data
    }
    func appleProviderEnabled() async throws -> Bool {
        var request = URLRequest(url: configuration.url.appendingPathComponent("auth/v1/settings"))
        request.timeoutInterval = 15
        request.setValue(configuration.key, forHTTPHeaderField: "apikey")
        let data: Data, response: URLResponse
        do { (data, response) = try await urlSession.data(for: request) } catch { throw AuthFailure.network }
        guard let http = response as? HTTPURLResponse, http.statusCode == 200,
              let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
              let external = json["external"] as? [String: Any], let enabled = external["apple"] as? Bool else { throw AuthFailure.server }
        return enabled
    }
    private func session(_ data: Data) throws -> AuthSession {
        guard let value = try? JSONDecoder().decode(AuthSession.self, from: data),
              !value.access_token.isEmpty, !value.refresh_token.isEmpty, !value.user.id.isEmpty else { throw AuthFailure.server }
        return value
    }
    func signIn(email: String, password: String) async throws -> AuthSession {
        try await session(request("token", query: [.init(name: "grant_type", value: "password")], body: ["email": email, "password": password]))
    }
    func signUp(email: String, password: String) async throws -> AuthSession? {
        let data = try await request("signup", body: ["email": email, "password": password])
        return try? session(data)
    }
    func verifySignup(email: String, code: String) async throws -> AuthSession {
        do {
            return try await session(request("verify", body: ["email": email, "token": code, "type": "email"]))
        } catch AuthFailure.credentials { throw AuthFailure.expiredCode }
    }
    func resendSignup(email: String) async throws {
        _ = try await request("resend", body: ["type": "signup", "email": email])
    }
    func apple(idToken: String, nonce: String) async throws -> AuthSession {
        try await session(request("token", query: [.init(name: "grant_type", value: "id_token")], body: ["provider": "apple", "id_token": idToken, "nonce": nonce]))
    }
    func refresh(_ token: String) async throws -> AuthSession {
        try await session(request("token", query: [.init(name: "grant_type", value: "refresh_token")], body: ["refresh_token": token]))
    }
    func recover(email: String) async throws { _ = try await request("recover", body: ["email": email]) }
    func resetPassword(email: String, code: String, newPassword: String) async throws -> AuthSession {
        let recovery = try await session(request("verify", body: ["email": email, "token": code, "type": "recovery"]))
        var request = URLRequest(url: configuration.url.appendingPathComponent("auth/v1/user"))
        request.httpMethod = "PUT"; request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(configuration.key, forHTTPHeaderField: "apikey")
        request.setValue("Bearer " + recovery.access_token, forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["password": newPassword])
        let response: URLResponse
        do { (_, response) = try await urlSession.data(for: request) } catch { throw AuthFailure.network }
        guard let response = response as? HTTPURLResponse, (200..<300).contains(response.statusCode) else { throw AuthFailure.server }
        return recovery
    }
    func deleteAccount(token: String, password: String? = nil, appleAuthorizationCode: String? = nil) async throws {
        var request = URLRequest(url: configuration.url.appendingPathComponent("functions/v1/delete-account"))
        request.httpMethod = "POST"; request.timeoutInterval = 55
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(configuration.key, forHTTPHeaderField: "apikey")
        request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
        var body: [String:String] = [:]
        if let password { body["password"] = password }
        if let appleAuthorizationCode { body["appleAuthorizationCode"] = appleAuthorizationCode }
        request.httpBody = try JSONSerialization.data(withJSONObject:body)
        let data: Data, response: URLResponse
        do { (data,response) = try await urlSession.data(for:request) } catch { throw AuthFailure.network }
        guard let http = response as? HTTPURLResponse else { throw AuthFailure.server }
        let result = (try? JSONSerialization.jsonObject(with:data)) as? [String:Any]
        if result?["error"] as? String == "APPLE_SETUP_REQUIRED" { throw AuthFailure.deletionSetup }
        if http.statusCode == 401 || http.statusCode == 403 { throw AuthFailure.credentials }
        guard http.statusCode == 200, result?["deleted"] as? Bool == true else { throw AuthFailure.server }
    }
    func logout(token: String) async throws { _ = try await request("logout", query: [.init(name: "scope", value: "local")], token: token) }
}
