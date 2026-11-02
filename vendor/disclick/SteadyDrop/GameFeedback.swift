import SpriteKit

final class HeroFace: SKNode {
    private var mood: HeroMood?
    private let ink = UIColor(red: 0.16, green: 0.23, blue: 0.24, alpha: 1)
    func show(_ next: HeroMood) {
        guard next != mood else { return }
        mood = next
        removeAllChildren()
        for x: CGFloat in [-9, 9] {
            let cheek = SKShapeNode(ellipseOf: CGSize(width: 7, height: 3))
            cheek.fillColor = UIColor(red: 0.94, green: 0.45, blue: 0.3, alpha: next == .happy ? 0.75 : 0.45)
            cheek.strokeColor = .clear; cheek.position = CGPoint(x: x * 1.5, y: -3); addChild(cheek)
            switch next {
            case .neutral:
                let eye = SKShapeNode(ellipseOf: CGSize(width: 4, height: 6))
                eye.fillColor = ink; eye.strokeColor = .clear; eye.position = CGPoint(x: x, y: 3); addChild(eye)
            case .hurt:
                let p = CGMutablePath()
                p.move(to: CGPoint(x: x - 3, y: 8)); p.addLine(to: CGPoint(x: x + 2, y: 4)); p.addLine(to: CGPoint(x: x - 3, y: 0))
                if x > 0 {
                    let mirrored = CGMutablePath(); mirrored.move(to: CGPoint(x: x + 3, y: 8)); mirrored.addLine(to: CGPoint(x: x - 2, y: 4)); mirrored.addLine(to: CGPoint(x: x + 3, y: 0)); stroke(mirrored)
                } else { stroke(p) }
            case .happy:
                let p = CGMutablePath(); p.move(to: CGPoint(x: x - 4, y: 2)); p.addQuadCurve(to: CGPoint(x: x + 4, y: 2), control: CGPoint(x: x, y: 11)); stroke(p)
            }
        }
        if next == .happy {
            let mouth = SKShapeNode(ellipseOf: CGSize(width: 13, height: 10)); mouth.fillColor = ink; mouth.strokeColor = .clear; mouth.position.y = -7; addChild(mouth)
            let tongue = SKShapeNode(ellipseOf: CGSize(width: 8, height: 3)); tongue.fillColor = UIColor(red: 1, green: 0.52, blue: 0.46, alpha: 1); tongue.strokeColor = .clear; tongue.position.y = -10; addChild(tongue)
        } else if next == .hurt {
            let p = CGMutablePath(); p.move(to: CGPoint(x: -7, y: -8))
            for i in 1...4 { p.addLine(to: CGPoint(x: -7 + CGFloat(i) * 3.5, y: i.isMultiple(of: 2) ? -8 : -5)) }; stroke(p)
            let sweat = SKShapeNode(ellipseOf: CGSize(width: 4, height: 8)); sweat.fillColor = .cyan.withAlphaComponent(0.85); sweat.strokeColor = .clear; sweat.position = CGPoint(x: 20, y: 10); sweat.zRotation = -0.4; addChild(sweat)
        } else {
            let p = CGMutablePath(); p.move(to: CGPoint(x: -4, y: -4)); p.addQuadCurve(to: CGPoint(x: 4, y: -4), control: CGPoint(x: 0, y: -10)); stroke(p)
        }
    }
    private func stroke(_ path: CGPath) {
        let n = SKShapeNode(path: path); n.strokeColor = ink; n.lineWidth = 2.2; n.lineCap = .round; addChild(n)
    }
    func impact() {
        removeAction(forKey: "squish")
        xScale = 1; yScale = 1
        run(.sequence([.scaleX(to: 1.12, y: 0.8, duration: 0.06), .scaleX(to: 0.95, y: 1.07, duration: 0.08), .scale(to: 1, duration: 0.12)]), withKey: "squish")
    }
}

enum GameFeedback {
    static func ring(at position: CGPoint, color: UIColor, in parent: SKNode, radius: CGFloat = 12) {
        let ring = SKShapeNode(circleOfRadius: radius); ring.position = position
        ring.strokeColor = color; ring.lineWidth = 2; ring.fillColor = .clear; ring.zPosition = 10; parent.addChild(ring)
        ring.run(.sequence([.group([.scale(to: 2.5, duration: 0.3), .fadeOut(withDuration: 0.3)]), .removeFromParent()]))
    }
    static func remove(_ block: SKNode, in parent: SKNode) {
        let color = (block as? SKShapeNode)?.fillColor ?? .orange
        let bounds = (block as? SKShapeNode)?.path?.boundingBox ?? CGRect(x: -35, y: -16, width: 70, height: 32)
        let origin = block.position
        // Release the support immediately; the remaining animation has no collider.
        block.name = nil; block.physicsBody = nil; block.zPosition = 8
        let flash = SKShapeNode(path: (block as? SKShapeNode)?.path ?? CGPath(rect: bounds, transform: nil)); flash.fillColor = .white; flash.strokeColor = .clear; flash.alpha = 0.6; block.addChild(flash)
        block.run(.sequence([.group([.scale(to: 1.08, duration: 0.05), .fadeAlpha(to: 0.8, duration: 0.05)]), .group([.scale(to: 0.15, duration: 0.13), .fadeOut(withDuration: 0.13)]), .removeFromParent()]))
        ring(at: origin, color: UIColor(red: 1, green: 0.86, blue: 0.57, alpha: 0.8), in: parent)
        let count = bounds.width > 100 ? 22 : 14
        for i in 0..<count {
            let piece = SKShapeNode(rectOf: CGSize(width: CGFloat(4 + i % 4 * 2), height: CGFloat(2 + i % 3)), cornerRadius: 1)
            piece.fillColor = i.isMultiple(of: 3) ? color.withAlphaComponent(0.65) : color; piece.strokeColor = .clear; piece.zPosition = 9
            let local = CGPoint(x: CGFloat((i * 31) % max(1, Int(bounds.width))) - bounds.width / 2, y: CGFloat(i % 3 - 1) * 6)
            if let path = (block as? SKShapeNode)?.path, !path.contains(local) { continue }
            let start = block.convert(local, to: parent)
            piece.position = start; parent.addChild(piece)
            let vx = CGFloat((i * 47) % 220 - 110), vy = CGFloat(70 + (i * 31) % 100)
            let duration = 0.48 + Double(i % 4) * 0.06
            piece.run(.sequence([.customAction(withDuration: duration) { node, elapsed in
                let t = CGFloat(elapsed)
                node.position = CGPoint(x: start.x + vx * t, y: start.y + vy * t - 300 * t * t)
                node.zRotation = t * CGFloat(i.isMultiple(of: 2) ? 8 : -9)
                node.alpha = max(0, 1 - t / CGFloat(duration))
            }, .removeFromParent()]))
        }
    }
    static func impact(at point: CGPoint, strength: CGFloat, in parent: SKNode) {
        ring(at: point, color: .white.withAlphaComponent(0.45), in: parent, radius: 6 + strength * 5)
        for i in 0..<8 {
            let dust = SKShapeNode(ellipseOf: CGSize(width: 5 + strength * 3, height: 3))
            dust.position = point; dust.fillColor = UIColor(red: 0.96, green: 0.83, blue: 0.63, alpha: 0.55); dust.strokeColor = .clear; dust.zPosition = 9; parent.addChild(dust)
            let dx = CGFloat(i - 4) * (7 + strength * 6)
            dust.run(.sequence([.group([.moveBy(x: dx, y: CGFloat(8 + i % 3 * 7), duration: 0.28), .scale(to: 1.8, duration: 0.28), .fadeOut(withDuration: 0.28)]), .removeFromParent()]))
        }
    }
    static func celebrate(at origin: CGPoint, in parent: SKNode) {
        let colors: [UIColor] = [.systemPink, .systemYellow, .systemTeal, .systemOrange, .white, .systemPurple]
        for i in 0..<72 {
            let confetti = SKShapeNode(rectOf: CGSize(width: CGFloat(3 + i % 4), height: CGFloat(7 + i % 5)), cornerRadius: 1)
            confetti.fillColor = colors[i % colors.count]; confetti.strokeColor = .clear; confetti.zPosition = 30
            let side: CGFloat = i.isMultiple(of: 2) ? -1 : 1
            let start = CGPoint(x: origin.x + side * 95, y: origin.y + 10)
            confetti.position = start; confetti.alpha = 0; parent.addChild(confetti)
            let vx = -side * CGFloat(30 + (i * 17) % 150), vy = CGFloat(160 + (i * 29) % 170)
            let duration = 2.0 + Double(i % 5) * 0.15
            confetti.run(.sequence([.wait(forDuration: Double(i % 9) * 0.025), .customAction(withDuration: duration) { node, elapsed in
                let t = CGFloat(elapsed)
                node.position = CGPoint(x: start.x + vx * t, y: start.y + vy * t - 130 * t * t)
                node.zRotation = t * CGFloat(i.isMultiple(of: 2) ? 7 : -6)
                node.xScale = 0.4 + abs(cos(t * CGFloat(5 + i % 5))) * 0.6
                node.alpha = min(1, max(0, CGFloat(duration) - t) * 2)
            }, .removeFromParent()]))
        }
    }
}
