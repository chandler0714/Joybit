import ExpoModulesCore
import SwiftUI

@MainActor
final class JoybitSessionStore: SessionStoring {
  var current: AuthSession?
  var onSave: ((AuthSession) -> Void)?
  init(_ session: AuthSession) { current = session }
  func load() throws -> AuthSession? { current }
  func save(_ session: AuthSession) throws { current = session; onSave?(session) }
  func clear() throws { current = nil }
}

@MainActor
final class SteadyDropHostView: ExpoView {
  let onExit = EventDispatcher()
  let onSessionRotated = EventDispatcher()
  var accessToken = ""
  var refreshToken = ""
  var userId = ""
  var email = ""
  private var mountedUserId: String?
  private var store: JoybitSessionStore?
  private var authModel: AuthModel?
  private var hosting: UIHostingController<JoybitGameRoot>?

  func mountIfReady() {
    guard !accessToken.isEmpty, !refreshToken.isEmpty, !userId.isEmpty else { return }
    if mountedUserId == userId {
      if store?.current?.refresh_token != refreshToken {
        let updated = AuthSession(access_token: accessToken, refresh_token: refreshToken, expires_in: nil,
                                  user: AuthUser(id: userId, email: email))
        store?.current = updated
        authModel?.acceptExternalSession(updated)
      }
      return
    }
    guard let config = AuthConfiguration(
      url: Bundle.main.object(forInfoDictionaryKey: "SupabaseURL") as? String ?? "",
      key: Bundle.main.object(forInfoDictionaryKey: "SupabasePublishableKey") as? String ?? ""
    ) else { onExit(["reason": "missing-configuration"]); return }

    hosting?.view.removeFromSuperview()
    let session = AuthSession(access_token: accessToken, refresh_token: refreshToken, expires_in: nil,
                              user: AuthUser(id: userId, email: email))
    let nextStore = JoybitSessionStore(session)
    nextStore.onSave = { [weak self] rotated in
      self?.onSessionRotated(["accessToken": rotated.access_token, "refreshToken": rotated.refresh_token,
                              "userId": rotated.user.id])
    }
    let auth = AuthModel(sessionStore: nextStore, service: AuthService(configuration: config))
    auth.acceptExternalSession(session)
    let root = JoybitGameRoot(auth: auth, userId: userId) { [weak self] in self?.onExit(["reason": "expired-session"]) }
    let controller = UIHostingController(rootView: root)
    controller.view.frame = bounds
    controller.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(controller.view)
    store = nextStore
    authModel = auth
    hosting = controller
    mountedUserId = userId
  }
}

private struct JoybitGameRoot: View {
  @StateObject private var auth: AuthModel
  let userId: String
  let onExpired: () -> Void

  init(auth: AuthModel, userId: String, onExpired: @escaping () -> Void) {
    _auth = StateObject(wrappedValue: auth)
    self.userId = userId
    self.onExpired = onExpired
  }

  var body: some View {
    Group {
      if let session = auth.session, session.user.id == userId {
        ContentView(progressNamespace: userId).environmentObject(auth)
      } else {
        ZStack {
          Color(red: 0.07, green: 0.17, blue: 0.19).ignoresSafeArea()
          ProgressView().tint(.white)
        }
      }
    }
    .onChange(of: auth.session?.user.id) { _, current in if current != userId { onExpired() } }
  }
}
