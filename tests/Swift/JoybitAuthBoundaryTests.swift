import Foundation

final class MemorySessionStore: SessionStoring {
    var current: AuthSession?
    var loads = 0
    func load() throws -> AuthSession? { loads += 1; return current }
    func save(_ session: AuthSession) throws { current = session }
    func clear() throws { current = nil }
}

@main struct JoybitAuthBoundaryTests {
    @MainActor static func main() async {
        let store = MemorySessionStore()
        let config = AuthConfiguration(url: "https://example.supabase.co", key: "sb_publishable_1234567890")!
        let auth = AuthModel(sessionStore: store, service: AuthService(configuration: config))
        let session = AuthSession(access_token: "joybit-access", refresh_token: "joybit-refresh", expires_in: 3600,
                                  user: AuthUser(id: "joybit-user", email: "player@example.com"))
        auth.acceptExternalSession(session)
        precondition(auth.session?.user.id == "joybit-user")
        precondition(auth.session?.access_token == "joybit-access")
        precondition(auth.entered && !auth.checking)
        precondition(store.loads == 0, "embedding must not rotate the refresh token on mount")
        print("Joybit external session boundary passed")
    }
}
