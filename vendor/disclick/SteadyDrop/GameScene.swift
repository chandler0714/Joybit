import SpriteKit
import UIKit

final class GameScene: SKScene, SKPhysicsContactDelegate {
    let definition: LevelDefinition
    let landingText: String
    var onProgress: ((CGFloat) -> Void)?
    var onFinish: ((Bool) -> Void)?
    var haptics = true
    private let hero = SKShapeNode()
    private let face = HeroFace()
    private var reaction = HeroReaction(startY: 0)
    private var impactGate = ImpactGate()
    private var elapsed: Double = 0
    private var shakeRemaining: Double = 0
    private var shakeStrength: CGFloat = 0
    private let world = SKNode()
    private let followCamera = SKCameraNode()
    private var judge = LandingJudge()
    private var clock = SimulationClock()
    private var frameDelta: Double = 0
    private var finished = false
    private var padContacts = Set<ObjectIdentifier>()
    private var topY: CGFloat = 0
    private let floorY: CGFloat = 110
    private let heroMask: UInt32 = 1
    private let blockMask: UInt32 = 2
    private let padMask: UInt32 = 4
    private var progressClock: Double = 0

    init(level: LevelDefinition, landingText: String) {
        definition = level; self.landingText = landingText
        super.init(size: CGSize(width: 390, height: 720))
        scaleMode = .aspectFill
        backgroundColor = .clear
    }
    required init?(coder: NSCoder) { fatalError("Use init(level:landingText:)") }
    override func didMove(to view: SKView) {
        guard world.parent == nil else { return }
        physicsWorld.gravity = CGVector(dx: 0, dy: -9.8)
        physicsWorld.contactDelegate = self
        addChild(world); addChild(followCamera); camera = followCamera
        buildPad(); buildTower(); buildHero()
        followCamera.position = CGPoint(x: 195, y: max(360, topY - 40))
        makeAtmosphere()
    }
    private func makeAtmosphere() {
        for i in 0..<22 {
            let dot = SKShapeNode(circleOfRadius: CGFloat(i % 3 + 1))
            dot.fillColor = UIColor.white.withAlphaComponent(0.13)
            dot.strokeColor = .clear
            dot.position = CGPoint(x: CGFloat((i * 73) % 390), y: CGFloat((i * 137) % 1400))
            dot.zPosition = -10; world.addChild(dot)
        }
    }
    private func buildPad() {
        let width = CGFloat(definition.padWidth)
        let pad = SKShapeNode(rectOf: CGSize(width: width, height: 20), cornerRadius: 8)
        pad.position = CGPoint(x: 195, y: floorY); pad.fillColor = UIColor(red: 0.34, green: 0.86, blue: 0.72, alpha: 1)
        pad.strokeColor = UIColor.white.withAlphaComponent(0.4); pad.lineWidth = 1
        pad.physicsBody = SKPhysicsBody(rectangleOf: CGSize(width: width, height: 20))
        pad.physicsBody?.isDynamic = false; pad.physicsBody?.categoryBitMask = padMask
        pad.physicsBody?.friction = 0.9; pad.physicsBody?.restitution = 0
        pad.name = "pad"; world.addChild(pad)
        let support = SKShapeNode(rectOf: CGSize(width: width - 20, height: 100), cornerRadius: 10)
        support.position = CGPoint(x: 195, y: floorY - 65)
        support.fillColor = UIColor(red: 0.12, green: 0.28, blue: 0.29, alpha: 1)
        support.strokeColor = .clear; support.zPosition = -1; world.addChild(support)
        let label = SKLabelNode(fontNamed: "AvenirNext-Bold")
        label.text = landingText; label.fontSize = 11; label.fontColor = UIColor.white.withAlphaComponent(0.65)
        label.position = CGPoint(x: 195, y: floorY - 47); world.addChild(label)
        for side in [-1.0, 1.0] {
            let flag = SKShapeNode(rectOf: CGSize(width: 4, height: 30), cornerRadius: 2)
            flag.fillColor = .white; flag.strokeColor = .clear
            flag.position = CGPoint(x: 195 + side * Double(width / 2 - 7), y: Double(floorY + 20))
            world.addChild(flag)
        }
    }
    private func buildTower() {
        let unitX = CGFloat(TowerMetrics.cellWidth)
        let unitY = CGFloat(TowerMetrics.cellHeight)
        let base = floorY + 10
        for (index, placement) in definition.blocks.enumerated() {
            let size = CGSize(width: CGFloat(placement.width) * unitX, height: CGFloat(placement.height) * unitY)
            let path = CGMutablePath()
            for (i, p) in placement.outline.enumerated() {
                let point = CGPoint(x: CGFloat(p.x) * unitX - size.width / 2, y: CGFloat(p.y) * unitY - size.height / 2)
                if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
            }
            path.closeSubpath()
            let block = SKShapeNode(path: path)
            block.name = "wood"
            block.position = CGPoint(x: CGFloat(TowerMetrics.columnX(placement.x)) + size.width / 2,
                                     y: base + CGFloat(placement.y) * unitY + size.height / 2)
            let light = index.isMultiple(of: 2)
            block.fillColor = light ? UIColor(red: 0.84, green: 0.58, blue: 0.33, alpha: 1) : UIColor(red: 0.73, green: 0.46, blue: 0.25, alpha: 1)
            block.strokeColor = UIColor(red: 0.37, green: 0.24, blue: 0.17, alpha: 1)
            block.lineWidth = 1.5; block.lineJoin = .round
            let body: SKPhysicsBody
            if placement.kind.isIrregular {
                // L/U/T use compound cell bodies so their notches stay physically empty.
                body = SKPhysicsBody(bodies: placement.cells.map { cell in
                    SKPhysicsBody(rectangleOf: CGSize(width: unitX - 0.4, height: unitY - 0.4),
                        center: CGPoint(x: (CGFloat(cell.x) + 0.5) * unitX - size.width / 2,
                                        y: (CGFloat(cell.y) + 0.5) * unitY - size.height / 2))
                })
            } else { body = SKPhysicsBody(rectangleOf: CGSize(width: size.width - 0.4, height: size.height - 0.4)) }
            body.contactTestBitMask = heroMask | blockMask | padMask
            body.categoryBitMask = blockMask; body.collisionBitMask = heroMask | blockMask | padMask
            body.friction = 0.75; body.restitution = 0; body.linearDamping = 0.3; body.angularDamping = 0.6
            body.mass = CGFloat(placement.cells.count) * 0.18
            block.physicsBody = body
            // Draw grain inside each occupied cell, leaving the L notch visibly empty.
            for cell in placement.cells {
                for line in 0..<3 {
                    let grainPath = CGMutablePath()
                    let x = CGFloat(cell.x) * unitX - size.width / 2
                    let y = CGFloat(cell.y) * unitY - size.height / 2 + 9 + CGFloat(line) * 7
                    grainPath.move(to: CGPoint(x: x + 5, y: y))
                    grainPath.addLine(to: CGPoint(x: x + unitX - 5, y: y + 1))
                    let grain = SKShapeNode(path: grainPath)
                    grain.strokeColor = UIColor.white.withAlphaComponent(0.12); grain.lineWidth = 1; block.addChild(grain)
                }
            }
            world.addChild(block)
        }
        topY = base + CGFloat(definition.rows) * unitY
    }
    private func buildHero() {
        let path = CGMutablePath()
        for i in 0..<6 {
            let angle = CGFloat(i) * .pi / 3
            let p = CGPoint(x: cos(angle) * CGFloat(HeroMetrics.radius), y: sin(angle) * CGFloat(HeroMetrics.radius))
            if i == 0 { path.move(to: p) } else { path.addLine(to: p) }
        }
        path.closeSubpath(); hero.path = path
        hero.fillColor = UIColor(red: 1, green: 0.77, blue: 0.38, alpha: 1)
        hero.strokeColor = UIColor(red: 1, green: 0.9, blue: 0.66, alpha: 1); hero.lineWidth = 3
        hero.position = CGPoint(x: 195, y: topY + CGFloat(HeroMetrics.radius))
        hero.zPosition = 5
        hero.physicsBody = SKPhysicsBody(polygonFrom: path)
        hero.physicsBody?.mass = 0.6 * CGFloat(HeroMetrics.scale * HeroMetrics.scale); hero.physicsBody?.friction = 0.85; hero.physicsBody?.restitution = 0.03
        hero.physicsBody?.linearDamping = 0.2; hero.physicsBody?.angularDamping = 0.6
        hero.physicsBody?.usesPreciseCollisionDetection = true
        hero.physicsBody?.categoryBitMask = heroMask
        hero.physicsBody?.collisionBitMask = blockMask | padMask
        hero.physicsBody?.contactTestBitMask = blockMask | padMask
        world.addChild(hero)
        let faceScaleNode = SKNode()
        faceScaleNode.setScale(CGFloat(HeroMetrics.scale))
        hero.addChild(faceScaleNode); faceScaleNode.addChild(face)
        reaction = HeroReaction(startY: Double(hero.position.y))
        face.show(.neutral)
    }
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard !finished, !isPaused, let touch = touches.first else { return }
        let point = touch.location(in: self)
        var selected: SKNode?
        for hit in nodes(at: point) {
            var node: SKNode? = hit
            while let current = node {
                if current.name == "wood", let shape = current as? SKShapeNode,
                   shape.path?.contains(shape.convert(point, from:self)) == true {
                    selected = current; break
                }
                node = current.parent
            }
            if selected != nil { break }
        }
        guard let block = selected else { return }
        GameFeedback.remove(block, in: world)
        if haptics { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    }
    func resetClock() { clock.reset(); frameDelta = 0 }
    override func update(_ currentTime: TimeInterval) {
        guard !finished else { return }
        let dt = clock.step(time: currentTime)
        frameDelta = dt
        elapsed += dt
        face.show(reaction.step(y: Double(hero.position.y), verticalSpeed: Double(hero.physicsBody?.velocity.dy ?? 0), dt: dt))
        shakeRemaining = max(0, shakeRemaining - dt)
        let fade = CGFloat(shakeRemaining / 0.18)
        followCamera.position.x = 195 + sin(CGFloat(elapsed) * 95) * shakeStrength * fade
        let target = max(360, hero.position.y - 35) + cos(CGFloat(elapsed) * 80) * shakeStrength * fade * 0.5
        followCamera.position.y += (target - followCamera.position.y) * CGFloat(min(1, dt * 6))
        progressClock += dt
        if progressClock > 0.08 {
            progressClock = 0
            onProgress?(max(0, min(1, (topY + CGFloat(HeroMetrics.radius) - hero.position.y) / max(1, topY - floorY))))
        }
        if hero.position.y < floorY - 100 || hero.position.x < -45 || hero.position.x > 435 { end(won: false) }
        world.children.filter { $0.name == "wood" && $0.position.y < -250 }.forEach { $0.removeFromParent() }
    }
    override func didSimulatePhysics() {
        guard !finished, let body = hero.physicsBody else { return }
        let velocity = hypot(body.velocity.dx, body.velocity.dy) + abs(body.angularVelocity) * CGFloat(HeroMetrics.radius)
        let above = hero.position.y > floorY + 15 && abs(hero.position.x - 195) < CGFloat(definition.padWidth) / 2
        let dt = frameDelta
        if judge.step(supported: !padContacts.isEmpty && above, speed: Double(velocity), dt: dt) { end(won: true) }
    }
    func didBegin(_ contact: SKPhysicsContact) {
        guard !finished else { return }
        let categories = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask
        let heroA = contact.bodyA.categoryBitMask == heroMask
        let heroB = contact.bodyB.categoryBitMask == heroMask
        if (heroA && contact.contactNormal.dy < -0.35) || (heroB && contact.contactNormal.dy > 0.35) {
            reaction.land(y: Double(hero.position.y))
        }
        if categories == heroMask | padMask {
            let pad = contact.bodyA.categoryBitMask == padMask ? contact.bodyA : contact.bodyB
            padContacts.insert(ObjectIdentifier(pad))
        }
        if impactGate.accept(impulse: Double(contact.collisionImpulse), time: elapsed) {
            let strength = min(1, contact.collisionImpulse / 8)
            GameFeedback.impact(at: contact.contactPoint, strength: strength, in: world)
            shakeRemaining = 0.18; shakeStrength = 1 + strength * 3
            if heroA || heroB { face.impact() }
            if haptics { UIImpactFeedbackGenerator(style: strength > 0.6 ? .medium : .soft).impactOccurred(intensity: 0.35 + strength * 0.65) }
        }
    }
    func didEnd(_ contact: SKPhysicsContact) {
        guard contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask == heroMask | padMask else { return }
        let pad = contact.bodyA.categoryBitMask == padMask ? contact.bodyA : contact.bodyB
        padContacts.remove(ObjectIdentifier(pad))
    }
    private func end(won: Bool) {
        guard !finished else { return }; finished = true
        if haptics { UINotificationFeedbackGenerator().notificationOccurred(won ? .success : .warning) }
        physicsWorld.speed = 0
        if won {
            onProgress?(1)
            reaction.celebrate(); face.show(.happy); face.impact()
            GameFeedback.celebrate(at: hero.position, in: world)
            // Let the happy character and confetti play before the result card covers the board.
            run(.sequence([.wait(forDuration: 1.6), .run { [weak self] in self?.onFinish?(true) }]), withKey: "victory")
        } else { onFinish?(false) }
    }
}
