import SwiftUI
import GoogleMobileAds
import AppTrackingTransparency
import AdSupport

/// A separate simulator test app. Never include this entry point in the shipping target.
@main
struct AdsPrivacyTests: App {
    init() {
        let configuration = MobileAds.shared.requestConfiguration
        // Simulate a prior/default configuration; constructing the production ad service
        // must enforce the launch policy before consent or an ad request can run.
        for previous: PublisherPrivacyPersonalizationState in [.default, .enabled] {
            configuration.publisherPrivacyPersonalizationState = previous
            let service = RewardedAds()
            guard configuration.publisherPrivacyPersonalizationState == .disabled else {
                print("FAIL: ad service left personalized treatment enabled")
                exit(1)
            }
            let request = service.makeRequest()
            let extras = request.adNetworkExtras(for: Extras.self) as? Extras
            guard extras?.additionalParameters?["npa"] as? String == "1" else {
                print("FAIL: rewarded request does not restrict third-party ad tracking with NPA")
                exit(1)
            }
            withExtendedLifetime(service) {}
        }
        guard Bundle.main.object(forInfoDictionaryKey: "NSUserTrackingUsageDescription") == nil,
              ATTrackingManager.trackingAuthorizationStatus != .authorized,
              ASIdentifierManager.shared().advertisingIdentifier == UUID(uuidString: "00000000-0000-0000-0000-000000000000") else {
            print("FAIL: first-launch privacy checks unexpectedly permit IDFA access")
            exit(1)
        }
        print("PASS: real SDK ad service enforces non-personalized treatment; no ATT/IDFA access")
        exit(0)
    }
    var body: some Scene { WindowGroup { EmptyView() } }
}
