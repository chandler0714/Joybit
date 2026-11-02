import ExpoModulesCore

public class SteadyDropModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SteadyDrop")

    View(SteadyDropHostView.self) {
      Events("onExit", "onSessionRotated")
      Prop("sessionJson") { (view: SteadyDropHostView, value: String) in view.applySessionJson(value) }
    }
  }
}
