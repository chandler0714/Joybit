import Foundation

/// Reference rules shared by tests and UI preview; live balances are owned by PostgreSQL.
struct LifeBalance: Codable, Equatable {
    var lives: Int
    var points: Int
    var day: String
    mutating func refresh(day next: String) {
        guard next > day else { return }
        lives = max(5, lives); day = next
    }
    @discardableResult mutating func win() -> Bool {
        points += 10
        guard points >= 100 else { return false }
        points = 0
        guard lives < 99 else { return false }
        lives += 1; return true
    }
    mutating func lose() { lives = max(0, lives - 1) }
    mutating func reward() { lives = min(99, lives + 1) }
}
struct LifeSnapshot: Codable, Equatable {
    let lives: Int
    let points: Int
    let day: String
    let round_id: UUID?
    let ticket_id: UUID?
    let settled: Bool?
    let rewarded: Bool?
}
