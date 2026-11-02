import ExpoModulesCore

public class SteadyDropModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SteadyDrop")

    View(SteadyDropHostView.self) {
      Events("onExit", "onSessionRotated")
      Prop("accessToken") { (view: SteadyDropHostView, value: String) in view.accessToken = value; view.mountIfReady() }
      Prop("refreshToken") { (view: SteadyDropHostView, value: String) in view.refreshToken = value; view.mountIfReady() }
      Prop("userId") { (view: SteadyDropHostView, value: String) in view.userId = value; view.mountIfReady() }
      Prop("email") { (view: SteadyDropHostView, value: String) in view.email = value; view.mountIfReady() }
    }
  }
}
