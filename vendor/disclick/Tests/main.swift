import Foundation
var checks = 0
func expect(_ value: @autoclosure () -> Bool, _ message: String) {
    checks += 1
    if !value() { fatalError(message) }
}
let levels = (1...20).map { LevelDefinition.make(number: $0) }
expect(levels[0].rows < levels[9].rows, "intro height grows")
expect(levels[9].padWidth >= levels[10].padWidth, "level 11 transition")
expect(levels[10].rows <= levels[11].rows, "gradual later height")
expect(levels.allSatisfy { $0.padWidth >= 140 }, "landings remain possible")
expect(LevelDefinition.make(number: -1).number == 1, "clamp lower level")
expect(LevelDefinition.make(number: 100).number == 20, "clamp upper level")
var judge = LandingJudge()
expect(!judge.step(supported: true, speed: 0, dt: 0.5), "no instant win")
expect(!judge.step(supported: false, speed: 0, dt: 0.5), "airborne resets")
expect(!judge.step(supported: true, speed: 0, dt: 0.6), "must settle continuously")
expect(judge.step(supported: true, speed: 0, dt: 0.4), "stable landing wins")
judge = LandingJudge()
expect(!judge.step(supported: true, speed: 100, dt: 2), "fast collision not a win")
expect(!UnavailableAds().isRewardedAvailable, "no fake rewarded ads")
print("Passed \(checks) core checks")
expect(Set(levels.map { "\($0.rows)-\($0.padWidth)-\($0.offset)" }).count == 20, "all 20 layouts distinct")
for fps in [30, 60, 120] {
    var clock = SimulationClock()
    var landing = LandingJudge()
    _ = clock.step(time: 0)
    var won = false
    for frame in 1...fps { won = landing.step(supported: true, speed: 0, dt: clock.step(time: Double(frame) / Double(fps))) }
    expect(won, "one second at \(fps) fps")
    clock.reset()
    expect(clock.step(time: 500) == 0, "resume ignores paused wall time")
}
print("All \(checks) checks passed")
var reaction = HeroReaction(startY: 400)
expect(reaction.step(y: 380, verticalSpeed: -60, dt: 0.1) == .neutral, "small drops stay neutral")
expect(reaction.step(y: 290, verticalSpeed: -180, dt: 0.1) == .hurt, "large drop shows pain")
reaction.land(y: 290)
expect(reaction.step(y: 290, verticalSpeed: 0, dt: 0.3) == .hurt, "pain lingers after landing")
expect(reaction.step(y: 290, verticalSpeed: 0, dt: 0.6) == .neutral, "pain recovers")
reaction.celebrate()
expect(reaction.step(y: 0, verticalSpeed: -500, dt: 3) == .happy, "victory overrides pain")
var gate = ImpactGate()
expect(!gate.accept(impulse: 0.1, time: 0), "resting contacts stay quiet")
expect(gate.accept(impulse: 2, time: 1), "real hit gives feedback")
expect(!gate.accept(impulse: 3, time: 1.03), "contact cascade is throttled")
expect(gate.accept(impulse: 3, time: 1.2), "later impact gives feedback")
print("Feedback suite: \(checks) checks")
expect(HeroMetrics.radius == 43.5, "hero grows exactly fifty percent")
expect(levels[0].blocks.allSatisfy { $0.kind != .elbow }, "level one is simple")
expect(levels[1].blocks.allSatisfy { $0.kind != .elbow }, "level two remains tutorial")
for level in levels.dropFirst(2) {
    expect(Set([BlockKind.rectangle, .square, .elbow]).isSubset(of:Set(level.blocks.map(\.kind))), "original mixed shapes remain from level three")
    var occupied = Set<GridCell>()
    for block in level.blocks {
        for cell in block.cells {
            expect(occupied.insert(GridCell(x: block.x + cell.x, y: block.y + cell.y)).inserted, "no overlapping starting blocks")
        }
        if block.kind == .elbow {
            expect(block.cells.count == 3, "L shape leaves an empty corner")
            expect(block.outline.count == 8, "L has a concave outline with collinear cell edges")
        }
    }
    expect(occupied.count == 5 * level.rows, "all five columns have complete support")
}
for (index, level) in levels.enumerated() where index >= 2 {
    expect(level.rows == level.number + 3, "every challenge level adds one row")
    if level.number >= 4 { expect(level.blocks.contains { $0.kind == .cup }, "U introduced from level four") }
    if level.number >= 5 { expect(level.blocks.contains { $0.kind == .tee }, "T introduced from level five") }
}
for (kind,count) in [(BlockKind.cup,5),(.tee,4)] {
    for turn in [0,2] {
        let piece = BlockPlacement(kind:kind,x:0,y:0,width:3,height:2,turn:turn)
        expect(piece.cells.count == count, "irregular piece keeps its cutout")
        expect(Set(piece.cells).count == count, "rotated cells stay unique")
        expect(piece.cells.allSatisfy { $0.x >= 0 && $0.x < 3 && $0.y >= 0 && $0.y < 2 }, "rotated piece stays inside bounds")
        let outline = piece.outline
        let twiceArea = zip(outline,Array(outline.dropFirst()) + [outline[0]]).reduce(0) { $0 + $1.0.x * $1.1.y - $1.1.x * $1.0.y }
        expect(abs(twiceArea) == count * 2, "render outline preserves exact concave area")
    }
}
print("Geometry suite: \(checks) checks")
expect(abs(TowerMetrics.width - 234.0) < 0.0001, "five cells make the tower exactly 30 percent wider")
expect(abs(TowerMetrics.cellHeight - 46.8) < 0.0001, "uniform scaling preserves brick proportions")
expect(abs(TowerMetrics.leftEdge + TowerMetrics.width / 2 - 195) < 0.0001, "widened tower stays centered")
expect(TowerMetrics.centerPassageWidth > HeroMetrics.radius * 2, "tutorial opening still fits enlarged hero")
print("Width suite: \(checks) checks")

expect(TowerMetrics.cellWidth == TowerMetrics.cellHeight, "square bricks keep their original aspect ratio after scaling")

expect(abs(TowerMetrics.columnX(4) + TowerMetrics.cellWidth - TowerMetrics.columnX(0) - 234.0) < 0.0001, "enlarged bricks span the widened base")
for level in levels {
    for block in level.blocks {
        expect(block.x >= 0 && block.x + block.width <= TowerMetrics.columns, "blocks stay within compact tower")
        if block.kind == .square { expect(block.width == block.height, "square stays square") }
    }
}
print("Fixed-size layout suite: \(checks) checks")

for column in 0..<(TowerMetrics.columns - 1) {
    expect(abs(TowerMetrics.columnX(column + 1) - TowerMetrics.columnX(column) - TowerMetrics.cellWidth) < 0.0001, "adjacent columns touch before removal")
}
expect(TowerMetrics.groupGap == 0, "no initial group gaps")
print("Touching layout suite: \(checks) checks")
expect(AuthInput.normalizedEmail(" User@Example.com \n") == "User@example.com", "email whitespace/domain normalized without changing local part")
expect(AuthInput.isEmail("player@example.com"), "valid email")
expect(!AuthInput.isEmail("not-an-email"), "invalid email")
expect(!AuthInput.isEmail("a@b.com\nInjected"), "reject whitespace")
expect(AuthInput.isPassword("abcdefgh"), "minimum password")
expect(!AuthInput.isPassword("short"), "reject short password")
expect(AuthConfiguration(url: "", key: "") == nil, "missing backend does not fabricate login")
expect(AuthConfiguration(url: "http://example.com", key: "sb_publishable_test") == nil, "authentication uses TLS")
expect(AuthConfiguration(url: "https://example.supabase.co", key: "sb_secret_test") == nil, "server secret never accepted in app config")
expect(AuthConfiguration(url: "https://example.supabase.co", key: "sb_publishable_test") != nil, "public client config accepted")
print("Auth validation suite: \(checks) checks")

expect(levels[1].padWidth < levels[0].padWidth, "level two landing tightens slightly")
expect(levels[1].blocks.contains { $0.width == 2 }, "level two introduces staggered two-cell beams")

var secondCells = Set<GridCell>()
for block in levels[1].blocks { for cell in block.cells {
    expect(secondCells.insert(GridCell(x:block.x+cell.x,y:block.y+cell.y)).inserted, "second level has no overlaps")
} }
expect(secondCells.count == 20, "second level starts fully supported without gaps")
print("Release geometry suite: \(checks) checks")
