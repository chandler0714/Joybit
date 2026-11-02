import SwiftUI

/// Account-bound transaction journal. A pending settlement blocks another round until acknowledged.
@MainActor final class LifeStore: ObservableObject {
    @Published private(set) var snapshot: LifeSnapshot?
    @Published private(set) var busy = false
    @Published var errorKey: String?
    @Published var needsLife = false
    @Published private(set) var rewardEvent = 0
    @Published private(set) var earnedLife = false
    @Published private(set) var previousPoints = 0
    private weak var auth: AuthModel?
    private let userID: String
    private let defaults: UserDefaults
    private let service: LivesService?
    private struct Journal: Codable { let id: UUID; var outcome: String? }
    private var journal: Journal? { didSet { defaults.set(try? JSONEncoder().encode(journal),forKey:"life-journal") } }
    private var ticket: UUID? { didSet { defaults.set(ticket?.uuidString,forKey:"life-ad-ticket") } }
    init(userID: String, service suppliedService: LivesService? = nil) {
        self.userID = userID
        defaults = UserDefaults(suiteName:"com.xuanniaozhixu.steadydrop.progress." + userID)!
        journal = defaults.data(forKey:"life-journal").flatMap { try? JSONDecoder().decode(Journal.self,from:$0) }
        ticket = defaults.string(forKey:"life-ad-ticket").flatMap(UUID.init(uuidString:))
        let config = AuthConfiguration(url:Bundle.main.object(forInfoDictionaryKey:"SupabaseURL") as? String ?? "",key:Bundle.main.object(forInfoDictionaryKey:"SupabasePublishableKey") as? String ?? "")
        service = suppliedService ?? config.map { LivesService(configuration:$0) }
    }
    func connect(_ auth: AuthModel) { self.auth = auth }
    private func call(_ action: String, id: UUID? = nil, level: Int = 1) async throws -> LifeSnapshot {
        guard let service, let session = auth?.session, session.user.id == userID else { throw LifeError.auth }
        do { return try await service.action(action,token:session.access_token,id:id,level:level) }
        catch LifeError.auth {
            await auth?.restore()
            guard let current = auth?.session, current.user.id == userID else { throw LifeError.auth }
            return try await service.action(action,token:current.access_token,id:id,level:level)
        }
    }
    private func report(_ error: Error) { errorKey = (error as? LifeError)?.key ?? "lifeError"; if error as? LifeError == .empty { needsLife = true; errorKey = nil } }
    private func reconcile() async throws {
        guard let pending = journal, let outcome = pending.outcome else { return }
        do {
            let value = try await call(outcome,id:pending.id)
            snapshot = value; journal = nil
        } catch LifeError.roundExpired {
            journal = nil
            throw LifeError.roundExpired
        }
    }
    func refresh(showErrors: Bool = true) async {
        guard !busy else { return }; busy = true; defer { busy = false }
        if showErrors { errorKey = nil }
        do {
            try await reconcile()
            snapshot = try await call("status")
            if let ticket {
                let status = try await call("ad_status",id:ticket)
                snapshot = status
                if status.rewarded == true { self.ticket = nil }
            }
        } catch { if showErrors { report(error) } }
    }
    func begin(level: Int, retry: Bool) async -> Bool {
        guard !busy else { return false }; busy = true; errorKey = nil; defer { busy = false }
        do {
            try await reconcile()
            if var current = journal {
                current.outcome = retry ? "loss" : "abandon"; journal = current
                try await reconcile()
            }
            let next = Journal(id:UUID(),outcome:nil)
            // Persist ID before request, so an uncertain response can be reconciled after interruption.
            journal = next
            do { snapshot = try await call("begin",id:next.id,level:level) }
            catch { journal = nil; throw error }
            needsLife = false; return true
        } catch { report(error); return false }
    }
    func settle(won: Bool) async {
        guard var current = journal, current.outcome == nil else { return }
        current.outcome = won ? "win" : "loss"; journal = current
        while busy { try? await Task.sleep(for:.milliseconds(20)) }
        busy = true; defer { busy = false }
        let oldPoints = snapshot?.points ?? 0
        do {
            let value = try await call(current.outcome!,id:current.id)
            snapshot = value; journal = nil
            if won { previousPoints = oldPoints; earnedLife = value.rewarded == true; rewardEvent += 1 }
        } catch {
            if error as? LifeError == .roundExpired { journal = nil }
            report(error)
        }
    }
    func abandon() {
        // No reward or loss; next begin closes this account's previous server round.
        if journal?.outcome == nil { journal = nil }
    }
    func watchAd(_ ads: RewardedAds) async {
        guard !busy else { return }; busy = true; errorKey = nil; defer { busy = false }
        do {
            // Recover any earlier callback before issuing another ticket.
            if let ticket {
                let value = try await call("ad_status",id:ticket); snapshot = value
                if value.rewarded == true { self.ticket = nil; needsLife = false; return }
            }
            let prepared = try await call("ad_ticket")
            guard let id = prepared.ticket_id else { throw LifeError.server }
            ticket = id
            try await ads.present(ticket:id)
            #if DEBUG
            if ads.usesTestAds { snapshot = try await call("test_reward",id:id) }
            #endif
            for _ in 0..<12 {
                let value = try await call("ad_status",id:id); snapshot = value
                if value.rewarded == true { ticket = nil; needsLife = false; return }
                try await Task.sleep(for:.seconds(2))
            }
            throw LifeError.rewardPending
        } catch { report(error) }
    }
}
