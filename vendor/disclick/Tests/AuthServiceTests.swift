import Foundation

final class AuthStub: URLProtocol {
    static var responder: ((URLRequest) throws -> (Int, Data))!
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        do {
            let (status, data) = try Self.responder(request)
            let response = HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: "HTTP/1.1", headerFields: ["Content-Type":"application/json"])!
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data); client?.urlProtocolDidFinishLoading(self)
        } catch { client?.urlProtocol(self, didFailWithError: error) }
    }
    override func stopLoading() {}
    static func body(_ request: URLRequest) -> [String:String] {
        var data = request.httpBody ?? Data()
        if data.isEmpty, let stream = request.httpBodyStream {
            stream.open(); defer { stream.close() }
            var bytes = [UInt8](repeating:0,count:4096)
            while stream.hasBytesAvailable {
                let count = stream.read(&bytes,maxLength:bytes.count)
                if count <= 0 { break }; data.append(contentsOf:bytes.prefix(count))
            }
        }
        return (try? JSONDecoder().decode([String:String].self,from:data)) ?? [:]
    }
}

@main struct AuthServiceTests {
    static func main() async throws {
        let config = URLSessionConfiguration.ephemeral; config.protocolClasses = [AuthStub.self]
        let session = URLSession(configuration: config)
        let service = AuthService(configuration: AuthConfiguration(url: "https://unit.invalid", key: "sb_publishable_test")!, urlSession: session)
        let tokenResponse = Data(#"{"access_token":"unit-access","refresh_token":"unit-refresh","expires_in":3600,"user":{"id":"unit-user","email":"player@example.com"}}"#.utf8)
        AuthStub.responder = { request in
            precondition(request.httpMethod == "POST")
            precondition(request.url?.path == "/auth/v1/token")
            precondition(request.url?.query == "grant_type=password")
            precondition(request.value(forHTTPHeaderField: "apikey") == "sb_publishable_test")
            return (200, tokenResponse)
        }
        let value = try await service.signIn(email: "player@example.com", password: "abcdefgh")
        precondition(value.user.id == "unit-user")
        AuthStub.responder = { request in
            precondition(request.url?.path == "/auth/v1/signup")
            return (200, Data(#"{"user":{"id":"unit-user"},"session":null}"#.utf8))
        }
        let signup = try await service.signUp(email: "player@example.com", password: "abcdefgh")
        precondition(signup == nil, "unconfirmed signup is not a signed-in session")
        AuthStub.responder = { request in
            precondition(request.url?.query == "grant_type=id_token")
            return (200, tokenResponse)
        }
        _ = try await service.apple(idToken: "unit-id-token", nonce: "unit-nonce")
        AuthStub.responder = { _ in (400, Data(#"{"error_code":"email_not_confirmed"}"#.utf8)) }
        do { _ = try await service.signIn(email: "player@example.com", password: "abcdefgh"); fatalError("must reject unconfirmed email") }
        catch { precondition((error as? AuthFailure)?.key == "authUnconfirmed") }
        AuthStub.responder = { _ in (429, Data()) }
        do { _ = try await service.refresh("unit-refresh"); fatalError("must report rate limit") }
        catch { precondition((error as? AuthFailure)?.key == "authRateLimit") }
        AuthStub.responder = { _ in throw URLError(.notConnectedToInternet) }
        do { _ = try await service.refresh("unit-refresh"); fatalError("must report network error") }
        catch { precondition((error as? AuthFailure)?.key == "authNetwork") }
        AuthStub.responder = { _ in (200, Data("{}".utf8)) }
        do { _ = try await service.refresh("unit-refresh"); fatalError("must reject malformed sessions") }
        catch { precondition((error as? AuthFailure)?.key == "authServer") }
        AuthStub.responder = { request in
            precondition(request.httpMethod == "GET" && request.url?.path == "/auth/v1/settings")
            return (200, Data(#"{"external":{"apple":false,"email":true}}"#.utf8))
        }
        let appleEnabled = try await service.appleProviderEnabled()
        precondition(!appleEnabled, "disabled provider must not be advertised as available")
        AuthStub.responder = { request in
            precondition(request.url?.path == "/auth/v1/verify")
            precondition(AuthStub.body(request) == ["type":"email","email":"player@example.com","token":"00123456"])
            return (200, tokenResponse)
        }
        let confirmed = try await service.verifySignup(email: "player@example.com", code: "00123456")
        precondition(confirmed.user.id == "unit-user")
        AuthStub.responder = { request in
            precondition(request.url?.path == "/auth/v1/resend")
            precondition(AuthStub.body(request) == ["type":"signup","email":"player@example.com"])
            return (200, Data("{}".utf8))
        }
        try await service.resendSignup(email: "player@example.com")
        AuthStub.responder = { _ in (403, Data(#"{"error_code":"otp_expired"}"#.utf8)) }
        do { _ = try await service.verifySignup(email: "player@example.com", code: "00123456"); fatalError("expired code must fail") }
        catch { precondition((error as? AuthFailure)?.key == "authCodeError") }
        AuthStub.responder = { request in
            precondition(request.httpMethod == "POST" && request.url?.path == "/functions/v1/delete-account")
            precondition(request.value(forHTTPHeaderField:"Authorization") == "Bearer unit-access")
            precondition(AuthStub.body(request) == ["password":"abcdefgh"])
            return (200, Data(#"{"deleted":true}"#.utf8))
        }
        try await service.deleteAccount(token:"unit-access", password:"abcdefgh")
        AuthStub.responder = { _ in (503, Data(#"{"error":"APPLE_SETUP_REQUIRED"}"#.utf8)) }
        do { try await service.deleteAccount(token:"unit-access", appleAuthorizationCode:"fresh-code"); fatalError() }
        catch { precondition((error as? AuthFailure)?.key == "authDeleteSetup") }
        AuthStub.responder = { _ in (200, Data("{}".utf8)) }
        do { try await service.deleteAccount(token:"unit-access", password:"abcdefgh"); fatalError() }
        catch { precondition((error as? AuthFailure)?.key == "authServer") }
        session.invalidateAndCancel()
        print("Auth transport: 14 scenarios passed (stubbed transport, no external accounts)")
    }
}
