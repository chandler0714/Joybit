import Foundation

enum LifeError: Error, Equatable {
    case empty, setup, network, server, auth, adUnavailable, adCancelled, rewardPending, roundExpired, testRewardDisabled
    var key: String {
        switch self {
        case .testRewardDisabled: return "lifeTestRewardDisabled"
        case .roundExpired: return "lifeRoundExpired"
        case .empty: return "lifeEmpty"
        case .setup: return "lifeSetup"
        case .network: return "authNetwork"
        case .auth: return "authCredentials"
        case .server: return "lifeError"
        case .adUnavailable: return "lifeAdUnavailable"
        case .adCancelled: return "lifeAdCancelled"
        case .rewardPending: return "lifeRewardPending"
        }
    }
}
struct LivesService {
    let configuration: AuthConfiguration
    var urlSession: URLSession = .shared
    func action(_ action: String, token: String, id: UUID? = nil, level: Int = 1) async throws -> LifeSnapshot {
        var r = URLRequest(url: configuration.url.appendingPathComponent("rest/v1/rpc/life_action"))
        r.httpMethod = "POST"; r.timeoutInterval = 20
        r.setValue(configuration.key, forHTTPHeaderField: "apikey")
        r.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
        r.setValue("application/json", forHTTPHeaderField: "Content-Type")
        var body: [String: Any] = ["p_action":action, "p_timezone":TimeZone.current.identifier, "p_level":level]
        if let id { body["p_id"] = id.uuidString }
        r.httpBody = try JSONSerialization.data(withJSONObject: body)
        let data: Data, response: URLResponse
        do { (data,response) = try await urlSession.data(for: r) } catch { throw LifeError.network }
        guard let http = response as? HTTPURLResponse else { throw LifeError.server }
        guard (200..<300).contains(http.statusCode) else {
            let json = (try? JSONSerialization.jsonObject(with:data)) as? [String:Any]
            if json?["message"] as? String == "TEST_REWARDS_DISABLED" { throw LifeError.testRewardDisabled }
            if json?["message"] as? String == "NO_LIVES" { throw LifeError.empty }
            if ["ROUND_CLOSED", "ROUND_NOT_FOUND"].contains(json?["message"] as? String ?? "") { throw LifeError.roundExpired }
            if http.statusCode == 404 { throw LifeError.setup }
            if http.statusCode == 401 { throw LifeError.auth }
            throw LifeError.server
        }
        guard let result = try? JSONDecoder().decode(LifeSnapshot.self,from:data),
              (0...99).contains(result.lives), (0...90).contains(result.points), result.points % 10 == 0 else { throw LifeError.server }
        return result
    }
}
