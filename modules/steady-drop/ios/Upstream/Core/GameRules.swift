import Foundation

enum HeroMetrics {
    static let scale = 1.5
    static let radius = 29.0 * scale
}

enum TowerMetrics {
    // Uniform scale keeps squares square and preserves rectangle/L proportions.
    static let scale = 1.3
    static let cellWidth = 36.0 * scale
    static let cellHeight = 36.0 * scale
    static let columns = 5
    static let width = Double(columns) * cellWidth
    static let leftEdge = 195 - width / 2
    static let groupGap = 0.0
    static func columnX(_ column: Int) -> Double {
        leftEdge + Double(column) * cellWidth
    }
    static let centerPassageWidth = cellWidth * 3
}

enum BlockKind: Hashable {
    case rectangle, square, elbow, cup, tee
    var isIrregular: Bool { self == .elbow || self == .cup || self == .tee }
}
struct GridCell: Hashable { let x: Int; let y: Int }
struct BlockPlacement {
    let kind: BlockKind
    let x: Int
    let y: Int
    let width: Int
    let height: Int
    var turn = 0
    var cells: [GridCell] {
        let base: [GridCell]
        switch kind {
        case .rectangle, .square:
            return (0..<height).flatMap { y in (0..<width).map { GridCell(x: $0, y: y) } }
        case .elbow:
            base = [GridCell(x:0,y:0),GridCell(x:1,y:0),GridCell(x:0,y:1)]
        case .cup:
            base = [GridCell(x:0,y:0),GridCell(x:1,y:0),GridCell(x:2,y:0),GridCell(x:0,y:1),GridCell(x:2,y:1)]
        case .tee:
            base = [GridCell(x:0,y:0),GridCell(x:1,y:0),GridCell(x:2,y:0),GridCell(x:1,y:1)]
        }
        return base.map { cell in
            var p = cell
            var w = width, h = height
            for _ in 0..<((turn % 4 + 4) % 4) {
                p = GridCell(x:h - 1 - p.y,y:p.x)
                swap(&w,&h)
            }
            return p
        }
    }
    // Trace exposed edges so L/U/T cutouts remain real in the rendered outline.
    var outline: [GridCell] {
        let occupied = Set(cells)
        var edges: [GridCell: GridCell] = [:]
        for c in cells {
            if !occupied.contains(GridCell(x: c.x, y: c.y - 1)) { edges[GridCell(x: c.x, y: c.y)] = GridCell(x: c.x + 1, y: c.y) }
            if !occupied.contains(GridCell(x: c.x + 1, y: c.y)) { edges[GridCell(x: c.x + 1, y: c.y)] = GridCell(x: c.x + 1, y: c.y + 1) }
            if !occupied.contains(GridCell(x: c.x, y: c.y + 1)) { edges[GridCell(x: c.x + 1, y: c.y + 1)] = GridCell(x: c.x, y: c.y + 1) }
            if !occupied.contains(GridCell(x: c.x - 1, y: c.y)) { edges[GridCell(x: c.x, y: c.y + 1)] = GridCell(x: c.x, y: c.y) }
        }
        guard let start = edges.keys.min(by: { $0.y == $1.y ? $0.x < $1.x : $0.y < $1.y }) else { return [] }
        var points = [start], cursor = start
        for _ in 0..<edges.count {
            guard let next = edges[cursor], next != start else { break }
            points.append(next); cursor = next
        }
        return points
    }
}

struct LevelDefinition {
    let number: Int
    let rows: Int
    let padWidth: Double
    let offset: Double
    let blocks: [BlockPlacement]
    static func make(number requested: Int) -> LevelDefinition {
        let n = min(20, max(1, requested))
        var blocks: [BlockPlacement] = []
        if n <= 2 {
            let rows = n + 2
            for row in 0..<rows {
                let spans: [(Int, Int)] = n == 1 || row == 0
                    ? [(0, 1), (1, 3), (4, 1)]
                    : row.isMultiple(of: 2) ? [(0, 1), (1, 2), (3, 2)] : [(0, 2), (2, 2), (4, 1)]
                for (x, width) in spans {
                    blocks.append(BlockPlacement(kind: width == 1 ? .square : .rectangle,
                        x: x, y: row, width: width, height: 1))
                }
            }
            return LevelDefinition(number: n, rows: rows, padWidth: n == 1 ? 310 : 300, offset: 0, blocks: blocks)
        }
        let rows = n + 3
        let bands = (rows - 2) / 2
        func addRail(y: Int) {
            for x in [0, 2, 4] {
                blocks.append(BlockPlacement(kind: x == 4 ? .square : .rectangle,
                    x: x, y: y, width: x == 4 ? 1 : 2, height: 1))
            }
        }
        addRail(y: 0)
        for band in 0..<bands {
            let y = 1 + band * 2
            if (n >= 4 && band % 3 == 1) || (n >= 5 && band % 3 == 2) {
                let x = (n + band).isMultiple(of:2) ? 0 : 2
                let kind: BlockKind = band % 3 == 1 ? .cup : .tee
                let piece = BlockPlacement(kind:kind,x:x,y:y,width:3,height:2,turn:(n + band) % 2 * 2)
                blocks.append(piece)
                let used = Set(piece.cells)
                for cy in 0..<2 { for cx in 0..<3 where !used.contains(GridCell(x:cx,y:cy)) {
                    blocks.append(BlockPlacement(kind:.square,x:x+cx,y:y+cy,width:1,height:1))
                } }
                blocks.append(BlockPlacement(kind:.square,x:x == 0 ? 3 : 0,y:y,width:2,height:2))
            } else {
                let elbowX = (n + band).isMultiple(of: 2) ? 0 : 2
                let squareX = elbowX == 0 ? 2 : 0
                let elbow = BlockPlacement(kind: .elbow, x: elbowX, y: y,
                    width: 2, height: 2, turn: (n + band) % 4)
                blocks.append(elbow)
                let used = Set(elbow.cells)
                for cy in 0..<2 { for cx in 0..<2 where !used.contains(GridCell(x: cx, y: cy)) {
                    blocks.append(BlockPlacement(kind: .square, x: elbowX + cx, y: y + cy, width: 1, height: 1))
                } }
                blocks.append(BlockPlacement(kind: .square, x: squareX, y: y, width: 2, height: 2))
                blocks.append(BlockPlacement(kind: .rectangle, x: 4, y: y, width: 1, height: 2))
            }
        }
        if (rows - 2) % 2 == 1 { addRail(y: rows - 2) }
        addRail(y: rows - 1)
        return LevelDefinition(number: n, rows: rows, padWidth: max(198, 300 - Double(n - 3) * 6), offset: 0, blocks: blocks)
    }
}

struct LandingJudge {
    private var stableTime = 0.0
    mutating func step(supported: Bool, speed: Double, dt: Double) -> Bool {
        if supported && speed < 12 { stableTime += max(0, dt) } else { stableTime = 0 }
        return stableTime >= 1 - 1e-9
    }
}

protocol AdService { var isRewardedAvailable: Bool { get } }
struct UnavailableAds: AdService { let isRewardedAvailable = false }

struct SimulationClock {
    private var previous: Double?
    mutating func step(time: Double) -> Double {
        defer { previous = time }
        guard let previous else { return 0 }
        return min(1.0 / 15, max(0, time - previous))
    }
    mutating func reset() { previous = nil }
}

enum HeroMood { case neutral, hurt, happy }

struct HeroReaction {
    private var fallTop: Double
    private var hurtRemaining = 0.0
    private var celebrating = false
    init(startY: Double) { fallTop = startY }
    mutating func step(y: Double, verticalSpeed: Double, dt: Double) -> HeroMood {
        if celebrating { return .happy }
        hurtRemaining = max(0, hurtRemaining - max(0, dt))
        fallTop = max(fallTop, y)
        if fallTop - y >= 95 && verticalSpeed < -100 { hurtRemaining = 0.8 }
        return hurtRemaining > 0 ? .hurt : .neutral
    }
    mutating func land(y: Double) { fallTop = y }
    mutating func celebrate() { celebrating = true }
}

struct ImpactGate {
    private var lastTime = -Double.infinity
    mutating func accept(impulse: Double, time: Double) -> Bool {
        guard impulse >= 1.5, time - lastTime >= 0.09 else { return false }
        lastTime = time
        return true
    }
}
