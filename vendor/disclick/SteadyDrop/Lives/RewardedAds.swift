import SwiftUI
import GoogleMobileAds
import UserMessagingPlatform

@MainActor final class RewardedAds: NSObject, ObservableObject, FullScreenContentDelegate {
    @Published private(set) var privacyRequired = false
    private var continuation: CheckedContinuation<Void,Error>?
    private var rewarded = false
    private var ad: RewardedAd?
    override init() {
        super.init()
        // Apply the launch policy before consent, SDK initialization, or ad loading.
        // UMP choices may impose further restrictions, but cannot enable personalization.
        let configuration = MobileAds.shared.requestConfiguration
        configuration.setPublisherFirstPartyIDEnabled(false)
        configuration.publisherPrivacyPersonalizationState = .disabled
    }
    var usesTestAds: Bool { adUnit == "ca-app-pub-3940256099942544/1712485313" }
    private var adUnit: String {
        #if DEBUG
        // Never generate live ad traffic while testing a development build.
        return "ca-app-pub-3940256099942544/1712485313"
        #else
        return Bundle.main.object(forInfoDictionaryKey:"RewardedAdUnitID") as? String ?? ""
        #endif
    }
    private var presenter: UIViewController? {
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first { $0.activationState == .foregroundActive }
        var root = scene?.windows.first { $0.isKeyWindow }?.rootViewController
        while let presented = root?.presentedViewController { root = presented }
        return root
    }
    func present(ticket: UUID) async throws {
        guard continuation == nil, let presenter, !adUnit.isEmpty else { throw LifeError.adUnavailable }
        #if !DEBUG
        guard !usesTestAds else { throw LifeError.adUnavailable }
        #endif
        do {
            try await ConsentInformation.shared.requestConsentInfoUpdate(with: RequestParameters())
            try await ConsentForm.loadAndPresentIfRequired(from:presenter)
        } catch {
            logFailure("consent", error: error)
            throw LifeError.adUnavailable
        }
        privacyRequired = ConsentInformation.shared.privacyOptionsRequirementStatus == .required
        guard ConsentInformation.shared.canRequestAds else { throw LifeError.adUnavailable }
        await MobileAds.shared.start()
        do { ad = try await RewardedAd.load(with:adUnit,request:makeRequest()) }
        catch {
            logFailure("load", error: error)
            throw LifeError.adUnavailable
        }
        guard let ad else { throw LifeError.adUnavailable }
        let options = ServerSideVerificationOptions(); options.customRewardText = ticket.uuidString
        ad.serverSideVerificationOptions = options; ad.fullScreenContentDelegate = self
        rewarded = false
        try await withCheckedThrowingContinuation { (waiting: CheckedContinuation<Void,Error>) in
            continuation = waiting
            ad.present(from:presenter) { [weak self] in self?.rewarded = true }
        }
    }
    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) { complete(rewarded ? nil : LifeError.adCancelled) }
    func makeRequest() -> Request {
        let request = Request()
        let extras = Extras()
        // NPA additionally restricts third-party ad-serving/tracking vendors in Google demand.
        extras.additionalParameters = ["npa": "1"]
        request.register(extras)
        return request
    }
    func ad(_ ad: FullScreenPresentingAd,didFailToPresentFullScreenContentWithError error: Error) {
        logFailure("presentation", error: error)
        complete(LifeError.adUnavailable)
    }
    private func logFailure(_ stage: String, error: Error) {
        // Log SDK errors only; never include session credentials or reward tickets.
        let failure = error as NSError
        NSLog("[SteadyDrop Ads] %@ failed: domain=%@ code=%ld description=%@", stage, failure.domain, failure.code, failure.localizedDescription)
    }
    private func complete(_ error: Error?) {
        let waiting = continuation; continuation = nil; ad = nil
        if let error { waiting?.resume(throwing:error) } else { waiting?.resume() }
    }
    func privacyOptions() async { guard let presenter else { return }; try? await ConsentForm.presentPrivacyOptionsForm(from:presenter) }
}
