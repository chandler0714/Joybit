import SwiftUI
import SpriteKit
import Combine

@MainActor final class GameModel: ObservableObject {
    enum Screen { case home, playing, won, lost }
    @Published var screen: Screen = .home
    @Published var level = 1
    @Published var progress: CGFloat = 0
    @Published var paused = false
    @Published var scene: GameScene?
    @Published var language: Language { didSet { UserDefaults.standard.set(language.rawValue, forKey: "language") } }
    @Published var haptics: Bool { didSet { UserDefaults.standard.set(haptics, forKey: "haptics") } }
    @Published private(set) var unlocked: Int
    @Published private(set) var stars: Int
    let life: LifeStore
    let ads = RewardedAds()
    @Published private(set) var transitioning = false
    private var subscriptions = Set<AnyCancellable>()
    private let defaults: UserDefaults
    init(progressNamespace: String) {
        life = LifeStore(userID: progressNamespace)
        defaults = UserDefaults(suiteName: "com.xuanniaozhixu.steadydrop.progress." + progressNamespace)!
        language = Language(rawValue: UserDefaults.standard.string(forKey: "language") ?? "") ?? .device
        haptics = UserDefaults.standard.object(forKey: "haptics") as? Bool ?? true
        unlocked = min(20, max(1, defaults.integer(forKey: "unlocked")))
        stars = defaults.integer(forKey: "stars")
        life.objectWillChange.sink { [weak self] _ in self?.objectWillChange.send() }.store(in: &subscriptions)
        ads.objectWillChange.sink { [weak self] _ in self?.objectWillChange.send() }.store(in: &subscriptions)
    }
    func t(_ key: String) -> String { Copy.text(key, language) }
    func start(_ requested: Int? = nil) {
        guard !transitioning, !life.busy else { return }
        let target = requested ?? level
        guard target >= 1 && target <= unlocked else { return }
        let retry = screen == .playing
        transitioning = true
        if retry { setPaused(true) }
        Task {
            defer { transitioning = false }
            guard await life.begin(level: target, retry: retry) else { if retry { screen = .lost; paused = false }; return }
            launch(target)
        }
    }
    private func launch(_ requested: Int? = nil) {
        let target = requested ?? level
        guard target >= 1 && target <= unlocked else { return }
        scene?.onProgress = nil; scene?.onFinish = nil; scene?.isPaused = true
        level = target; progress = 0; paused = false; screen = .playing
        let next = GameScene(level: .make(number: level), landingText: t("land"))
        next.haptics = haptics
        next.onProgress = { [weak self] value in self?.progress = value }
        next.onFinish = { [weak self] won in self?.finish(won) }
        scene = next
    }
    func finish(_ won: Bool) {
        guard screen == .playing else { return }
        screen = won ? .won : .lost
        scene?.isPaused = true
        transitioning = true
        Task { await life.settle(won: won); transitioning = false }
        if won {
            let key = "completed-\(level)"
            if !defaults.bool(forKey: key) { stars += 1; defaults.set(stars, forKey: "stars"); defaults.set(true, forKey: key) }
            unlocked = max(unlocked, min(20, level + 1)); defaults.set(unlocked, forKey: "unlocked")
        }
    }
    func setPaused(_ value: Bool) { paused = value; scene?.isPaused = value; scene?.resetClock() }
    func home() { guard !transitioning, !life.busy else { return }; life.abandon(); scene?.isPaused = true; scene?.onFinish = nil; scene?.onProgress = nil; scene = nil; paused = false; screen = .home }
}
