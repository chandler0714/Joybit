import SwiftUI

struct Pentagon: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            for i in 0..<5 {
                let angle = -.pi / 2 + Double(i) * 2 * .pi / 5
                let point = CGPoint(x:rect.midX + cos(angle)*rect.width/2,y:rect.midY + sin(angle)*rect.height/2)
                if i == 0 { p.move(to:point) } else { p.addLine(to:point) }
            }
            p.closeSubpath()
        }
    }
}
struct LifeBadge: View {
    let snapshot: LifeSnapshot?
    let event: Int
    let previousPoints: Int
    let earnedLife: Bool
    let label: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var shownProgress: CGFloat = 0
    @State private var pulse = false
    @State private var plus = false
    @State private var animating = false
    @State private var animationTask: Task<Void,Never>?
    private let gold = Color(red:1,green:0.76,blue:0.39)
    var body: some View {
        ZStack {
            Pentagon().fill(Color(red:0.07,green:0.17,blue:0.19))
            Pentagon().stroke(.white.opacity(0.18),lineWidth:3)
            Pentagon().trim(from:0,to:shownProgress).stroke(gold,style:StrokeStyle(lineWidth:3,lineCap:.round,lineJoin:.round))
                .shadow(color:gold.opacity(pulse ? 1 : 0.4),radius:pulse ? 12 : 3)
            Text(snapshot.map { String($0.lives) } ?? "–").font(.system(size:19,weight:.black,design:.rounded)).foregroundStyle(.white).offset(y:2)
            if plus { Text("+1").font(.system(size:18,weight:.black,design:.rounded)).foregroundStyle(gold).offset(y:-35).transition(.opacity.combined(with:.offset(y:8))) }
        }.frame(width:48,height:50).scaleEffect(pulse && !reduceMotion ? 1.2 : 1)
            .accessibilityElement(children:.ignore)
            .accessibilityLabel(label)
            .accessibilityValue("\(snapshot?.lives ?? 0), \(snapshot?.points ?? 0)%")
            .onAppear { shownProgress = CGFloat(snapshot?.points ?? 0)/100 }
            .onChange(of:snapshot?.points) { _, value in
                // A win animates via its event; other refreshes update without inventing rewards.
                if !animating { shownProgress = CGFloat(value ?? 0)/100 }
            }
            .onChange(of:event) { _, _ in
                animationTask?.cancel()
                animationTask = Task {
                animating = true
                shownProgress = CGFloat(previousPoints)/100
                do {
                    try await Task.sleep(for:.milliseconds(reduceMotion ? 150 : 650))
                    withAnimation(.easeOut(duration:0.22)) { pulse = true }
                    let completes = previousPoints == 90
                    withAnimation(.easeInOut(duration:0.35)) { shownProgress = completes ? 1 : CGFloat(snapshot?.points ?? 0)/100 }
                    try await Task.sleep(for:.milliseconds(400))
                    withAnimation(.easeOut(duration:0.2)) { plus = earnedLife }
                    try await Task.sleep(for:.milliseconds(450))
                    withAnimation(.easeOut(duration:0.2)) { pulse = false; plus = false }
                    if completes { shownProgress = CGFloat(snapshot?.points ?? 0)/100 }
                } catch { pulse = false; plus = false; shownProgress = CGFloat(snapshot?.points ?? 0)/100 }
                animating = false
                }
            }
            .onDisappear { animationTask?.cancel(); pulse = false; plus = false; animating = false }
    }
}
struct ExperienceFlight: View {
    let event: Int
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var flying = false
    @State private var arrived = false
    @State private var animationTask: Task<Void,Never>?
    var body: some View {
        GeometryReader { geo in
            ZStack {
                if flying {
                    ForEach(0..<5) { i in
                        ZStack {
                            Circle().fill(Color(red:1,green:0.76,blue:0.39))
                            Circle().stroke(.white.opacity(0.65),lineWidth:1).padding(3)
                            Image(systemName:"sparkle").font(.system(size:10,weight:.black)).foregroundStyle(Color(red:0.35,green:0.22,blue:0.1))
                        }.frame(width:21,height:21)
                            .scaleEffect(arrived ? 0.15 : 1)
                            .opacity(arrived ? 0 : 1)
                            .position(arrived ? CGPoint(x:geo.size.width-48,y:37) : CGPoint(x:geo.size.width/2+CGFloat(i-2)*15,y:geo.size.height*0.53))
                            .animation(reduceMotion ? .easeOut(duration:0.2) : .easeInOut(duration:0.55).delay(Double(i)*0.065),value:arrived)
                    }
                }
            }
        }.allowsHitTesting(false).accessibilityHidden(true)
            .onChange(of:event) { _, _ in
                animationTask?.cancel()
                animationTask = Task {
                flying = true; arrived = false
                do {
                    try await Task.sleep(for:.milliseconds(70)); arrived = true
                    try await Task.sleep(for:.milliseconds(950)); flying = false
                } catch { flying = false }
                }
            }
            .onDisappear { animationTask?.cancel(); flying = false }
    }
}
