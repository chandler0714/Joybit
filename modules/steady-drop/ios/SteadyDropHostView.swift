import ExpoModulesCore
import SwiftUI
import UIKit

private struct JoybitSessionPayload: Decodable {
  let accessToken: String
  let refreshToken: String
  let userId: String
  let email: String
}

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
  private var accessToken = ""
  private var refreshToken = ""
  private var userId = ""
  private var email = ""
  private var mountedUserId: String?
  private var store: JoybitSessionStore?
  private var authModel: AuthModel?
  private var hosting: UIHostingController<JoybitGameRoot>?

  func applySessionJson(_ value: String) {
    guard let data = value.data(using: .utf8),
          let payload = try? JSONDecoder().decode(JoybitSessionPayload.self, from: data),
          !payload.accessToken.isEmpty, !payload.refreshToken.isEmpty, !payload.userId.isEmpty else {
      onExit(["reason": "invalid-session"])
      return
    }
    accessToken = payload.accessToken
    refreshToken = payload.refreshToken
    userId = payload.userId
    email = payload.email
    mountIfReady()
  }

  private func mountIfReady() {
    guard !accessToken.isEmpty, !refreshToken.isEmpty, !userId.isEmpty else { return }
    if mountedUserId == userId {
      if store?.current?.refresh_token != refreshToken || store?.current?.access_token != accessToken {
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

    detachHosting()
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
    store = nextStore
    authModel = auth
    hosting = controller
    mountedUserId = userId
    attachHosting()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil { detachHosting() } else { attachHosting() }
  }

  private func containingController() -> UIViewController? {
    var responder: UIResponder? = self
    while let current = responder {
      if let controller = current as? UIViewController { return controller }
      responder = current.next
    }
    return window?.rootViewController
  }

  private func attachHosting() {
    guard window != nil, let hosting, hosting.parent == nil,
          let parent = containingController() else { return }
    parent.addChild(hosting)
    hosting.view.frame = bounds
    hosting.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(hosting.view)
    hosting.didMove(toParent: parent)
  }

  private func detachHosting() {
    guard let hosting else { return }
    if hosting.parent != nil { hosting.willMove(toParent: nil) }
    hosting.view.removeFromSuperview()
    if hosting.parent != nil { hosting.removeFromParent() }
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
