import SwiftUI
import SpriteKit
import AuthenticationServices

private let ink = Color(red: 0.07, green: 0.17, blue: 0.19)
private let cream = Color(red: 0.97, green: 0.94, blue: 0.85)
private let mint = Color(red: 0.45, green: 0.87, blue: 0.73)
private let gold = Color(red: 1, green: 0.76, blue: 0.39)

struct ContentView: View {
    @StateObject private var model: GameModel
    @EnvironmentObject private var auth: AuthModel
    init(progressNamespace: String) {
        _model = StateObject(wrappedValue: GameModel(progressNamespace: progressNamespace))
    }
    @State private var settings = false
    @State private var confirmDeletion = false
    @State private var showDeletion = false
    @State private var deletionPassword = ""
    @State private var levels = false
    @Environment(\.scenePhase) private var scenePhase
    private let midnightTick = Timer.publish(every: 30, on: .main, in: .common).autoconnect()
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.07, green: 0.22, blue: 0.25), ink], startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea()
            if model.screen == .home { home } else { game }
            if model.life.needsLife { noLivesOverlay }
            if model.life.busy || model.transitioning {
                VStack { Spacer(); ProgressView(model.t("lifeSyncing")).tint(mint).font(.caption).padding(14).background(ink,in:Capsule()) }.padding(.bottom,8).allowsHitTesting(false)
            }
        }
        .foregroundStyle(cream)
        .task { model.life.connect(auth); await model.life.refresh() }
        .onReceive(midnightTick) { _ in if !auth.busy { Task { await model.life.refresh(showErrors: false) } } }
        .alert(model.t("lifeNotice"), isPresented: Binding(get: { model.life.errorKey != nil }, set: { if !$0 { model.life.errorKey = nil } })) {
            Button(model.t("done")) { model.life.errorKey = nil }
            Button(model.t("lifeSync")) { Task { await model.life.refresh() } }
        } message: { Text(model.t(model.life.errorKey ?? "lifeError")) }
        .sheet(isPresented: $settings) { settingsView.presentationDetents([.medium, .large]) }
        .sheet(isPresented: $levels) { levelView }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { Task { await model.life.refresh(showErrors: false) } }
            if phase != .active && model.screen == .playing { model.setPaused(true) }
        }
    }
    private var home: some View {
        VStack(spacing: 0) {
            HStack {
                Label("\(model.stars)", systemImage: "sparkle").font(.headline).foregroundStyle(gold)
                Spacer()
                lifeBadge
                iconButton("gearshape", label: model.t("settings")) { settings = true }
            }.padding(.top, 16)
            Spacer(minLength: 20)
            Text("STEADY\nDROP").font(.system(size: 64, weight: .black, design: .rounded)).tracking(-3).lineSpacing(-8).multilineTextAlignment(.center).fixedSize(horizontal:false,vertical:true)
            Text(model.t("tagline")).font(.subheadline).foregroundStyle(mint).multilineTextAlignment(.center).padding(.top, 12)
            Spacer(minLength: 24)
            ZStack {
                Circle().fill(mint.opacity(0.05)).frame(width: 280, height: 280)
                Circle().stroke(mint.opacity(0.12), style: StrokeStyle(lineWidth: 1, dash: [3, 9])).frame(width: 255, height: 255)
                VStack(spacing: 4) {
                    mascot.frame(width: 123, height: 123).rotationEffect(.degrees(-8)).padding(.bottom, 3)
                    wood(width: 172, height: 29)
                    HStack(spacing: 5) { wood(width: 54, height: 48); wood(width: 54, height: 48); wood(width: 54, height: 48) }
                    RoundedRectangle(cornerRadius: 5).fill(mint).frame(width: 200, height: 12)
                }
            }.frame(height: 290)
            Spacer(minLength: 20)
            Text("\(model.t("level")) \(model.unlocked) / 20").font(.system(size: 11, weight: .bold, design: .monospaced)).tracking(2).foregroundStyle(mint)
            primaryButton(model.t("play"), symbol: "arrow.down") { model.start(model.unlocked) }.padding(.top, 14)
            Button { levels = true } label: { Label(model.t("levels"), systemImage: "square.grid.2x2").font(.subheadline.weight(.semibold)).frame(minHeight: 44) }.tint(cream).padding(.top, 10)
            #if DEBUG
            Text(model.t("prototype")).font(.caption2).foregroundStyle(cream.opacity(0.35)).padding(.top, 18).padding(.bottom, 12)
            #endif
        }.padding(.horizontal, 28)
    }
    private func wood(width: CGFloat, height: CGFloat) -> some View {
        RoundedRectangle(cornerRadius: 4).fill(LinearGradient(colors: [Color(red: 0.83, green: 0.58, blue: 0.35), Color(red: 0.68, green: 0.42, blue: 0.25)], startPoint: .top, endPoint: .bottom))
            .overlay { VStack(spacing: 7) { ForEach(0..<3) { _ in Rectangle().fill(.white.opacity(0.13)).frame(height: 1) } }.padding(.horizontal, 9) }.frame(width: width, height: height)
    }
    private var mascot: some View {
        ZStack {
            Hexagon().fill(gold).overlay(Hexagon().stroke(cream.opacity(0.8), lineWidth: 3))
            VStack(spacing: 6) {
                HStack(spacing: 18) { Capsule().frame(width: 5, height: 8); Capsule().frame(width: 5, height: 8) }
                Text("⌣").font(.system(size: 22, weight: .bold)).frame(height: 8)
            }.foregroundStyle(ink)
        }
    }
    private var game: some View {
        ZStack {
            if let scene = model.scene {
                SpriteView(scene: scene, options: [.allowsTransparency]).id(ObjectIdentifier(scene)).ignoresSafeArea().accessibilityLabel(model.t("board"))
            }
            VStack {
                HStack {
                    HStack(spacing: 2) {
                        iconButton("chevron.left", label: model.t("home")) { model.home() }
                        iconButton("pause.fill", label: model.t("paused")) { model.setPaused(true) }.disabled(model.screen != .playing)
                    }
                    Spacer()
                    VStack(spacing: 3) {
                        Text("\(model.t("level")) \(String(format: "%02d", model.level))").font(.system(size: 13, weight: .bold, design: .monospaced)).tracking(2)
                        Text(model.t(model.level <= 2 ? "easy" : "challenge")).font(.system(size: 8, weight: .semibold)).tracking(1).foregroundStyle(mint)
                    }
                    Spacer()
                    Color.clear.frame(width:48,height:50)
                }
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.white.opacity(0.12))
                        Capsule().fill(mint).frame(width: max(4, geo.size.width * model.progress))
                    }
                }.frame(height: 4).padding(.top, 14)
                Spacer()
                if model.screen == .playing {
                    Text(model.t(model.level == 1 ? "hint" : model.level == 2 ? "hintSecond" : "instruction"))
                        .font(.system(size: 12, weight: .medium)).multilineTextAlignment(.center)
                        .padding(.horizontal, 16).padding(.vertical, 12).background(ink.opacity(0.85), in: Capsule())
                        .allowsHitTesting(false)
                    HStack {
                        Text("\(Int(model.progress * 100))%").font(.system(size: 11, weight: .medium, design: .monospaced)).foregroundStyle(mint)
                        Spacer()
                        iconButton("arrow.counterclockwise", label: model.t("retry")) { model.start() }
                    }.padding(.top, 8)
                }
            }.padding(.horizontal, 24).padding(.top, 12).padding(.bottom, 10)
            if model.screen == .won || model.screen == .lost { resultOverlay }
            if model.paused && model.screen == .playing {
                overlayCard {
                    Image(systemName: "pause.circle").font(.system(size: 48)).foregroundStyle(mint)
                    Text(model.t("paused")).font(.title2.bold())
                    primaryButton(model.t("resume"), symbol: "play.fill") { model.setPaused(false) }
                    Button(model.t("retry")) { model.start() }.frame(minHeight: 44).tint(cream)
                    Button(model.t("home")) { model.home() }.frame(minHeight: 44).tint(cream.opacity(0.6))
                }
            }
            VStack { HStack { Spacer(); lifeBadge }; Spacer() }.padding(.horizontal,24).padding(.top,12).allowsHitTesting(false)
            ExperienceFlight(event: model.life.rewardEvent)
        }
    }
    private var lifeBadge: some View {
        LifeBadge(snapshot:model.life.snapshot,event:model.life.rewardEvent,previousPoints:model.life.previousPoints,earnedLife:model.life.earnedLife,label:model.t("lifeLives"))
    }
    private var noLivesOverlay: some View {
        overlayCard {
            Image(systemName:"heart.slash").font(.system(size:42)).foregroundStyle(gold)
            Text(model.t("lifeEmpty")).font(.title2.bold()).multilineTextAlignment(.center)
            Text(model.t("lifeOffer")).font(.subheadline).foregroundStyle(cream.opacity(0.7)).multilineTextAlignment(.center)
            primaryButton(model.t("lifeWatch"),symbol:"play.rectangle.fill") { Task { await model.life.watchAd(model.ads) } }
            Button(model.t("lifeLater")) { model.life.needsLife = false }.frame(minHeight:44).tint(cream).disabled(model.life.busy)
        }
    }
    private var resultOverlay: some View {
        let won = model.screen == .won
        return overlayCard {
            Image(systemName: won ? "sparkles" : "leaf").font(.system(size: 46)).foregroundStyle(won ? gold : mint)
            Text(model.t(won ? "won" : "lost")).font(.system(size: 28, weight: .bold, design: .rounded)).multilineTextAlignment(.center)
            Text(model.t(won ? (model.level == 20 ? "complete" : "wonDetail") : "lostDetail")).font(.subheadline).foregroundStyle(cream.opacity(0.6)).multilineTextAlignment(.center)
            if won { Label("\(model.stars)", systemImage: "star.fill").font(.headline).foregroundStyle(gold) }
            primaryButton(model.t(won && model.level < 20 ? "next" : "retry"), symbol: won ? "arrow.right" : "arrow.counterclockwise") {
                model.start(won && model.level < 20 ? model.level + 1 : model.level)
            }
            if won { Button(model.t("retry")) { model.start() }.frame(minHeight: 44).tint(cream) }
            Button(model.t("home")) { model.home() }.frame(minHeight: 44).tint(cream.opacity(0.6))
        }
    }
    private func overlayCard<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        ZStack {
            ink.opacity(0.7).ignoresSafeArea()
            VStack(spacing: 18, content: content).padding(28).frame(maxWidth: 340)
                .background(RoundedRectangle(cornerRadius: 30).fill(Color(red: 0.10, green: 0.24, blue: 0.26)))
                .overlay(RoundedRectangle(cornerRadius: 30).stroke(mint.opacity(0.18), lineWidth: 1))
                .padding(20)
        }
    }
    private var settingsView: some View {
        NavigationStack {
            Form {
                Picker(model.t("language"), selection: $model.language) { ForEach(Language.allCases) { language in Text(language.title).tag(language) } }
                Toggle(model.t("haptics"), isOn: $model.haptics)
                Section(model.t("privacyAndSupport")) {
                    Link(model.t("privacyPolicy"), destination:AppLinks.privacy)
                    Link(model.t("contactSupport"), destination:AppLinks.support)
                }
                Text(model.t("authLocalProgress")).font(.footnote).foregroundStyle(.secondary)
                if model.ads.privacyRequired { Button(model.t("lifePrivacy")) { Task { await model.ads.privacyOptions() } } }
                #if DEBUG
                Text(model.t("prototype")).font(.footnote).foregroundStyle(.secondary)
                #endif
            }.navigationTitle(model.t("settings"))
                .confirmationDialog(model.t("authDelete"), isPresented:$confirmDeletion, titleVisibility:.visible) {
                    Button(model.t("authDeleteContinue"),role:.destructive) {
                        model.home(); auth.errorKey = nil; deletionPassword = ""; showDeletion = true
                    }
                    Button(model.t("cancel"),role:.cancel) {}
                } message: { Text(model.t("authDeleteWarning")) }
                .sheet(isPresented:$showDeletion) { deletionView.interactiveDismissDisabled(auth.busy) }
                .interactiveDismissDisabled(auth.busy)
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button(model.t("done")) { settings = false } } }
        }.tint(mint)
    }
    private var deletionView: some View {
        NavigationStack {
            Form {
                Section { Text(model.t("authDeleteWarning")) }
                Section(model.t("authDeleteVerify")) {
                    if auth.requiresAppleDeletion {
                        Text(model.t("authDeleteAppleDetail"))
                        SignInWithAppleButton(.continue,onRequest:auth.prepareApple) { result in
                            Task { await auth.completeAppleDeletion(result) }
                        }.signInWithAppleButtonStyle(.white).frame(height:48).disabled(auth.busy)
                    } else {
                        SecureField(model.t("authPassword"),text:$deletionPassword).textContentType(.password).disabled(auth.busy)
                        Button(model.t("authDelete"),role:.destructive) {
                            let password = deletionPassword; deletionPassword = ""
                            Task { await auth.deleteAccount(password:password) }
                        }.disabled(auth.busy || deletionPassword.isEmpty)
                    }
                }
                if auth.busy { ProgressView(model.t("authDeleting")) }
                if let key = auth.errorKey { Text(model.t(key)).foregroundStyle(.red) }
            }.navigationTitle(model.t("authDelete"))
                .toolbar { ToolbarItem(placement:.cancellationAction) {
                    Button(model.t("cancel")) { showDeletion = false; deletionPassword = ""; auth.errorKey = nil }.disabled(auth.busy)
                } }
        }.onDisappear { deletionPassword = "" }
    }
    private var levelView: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 16) {
                    ForEach(1...20, id: \.self) { n in
                        Button { levels = false; model.start(n) } label: {
                            VStack(spacing: 6) {
                                if n > model.unlocked { Image(systemName: "lock.fill") } else { Text("\(n)").font(.title2.bold()) }
                                Text(n <= 2 ? "•" : "••").font(.caption2)
                            }.frame(maxWidth: .infinity).frame(height: 76)
                                .foregroundStyle(n > model.unlocked ? cream.opacity(0.25) : n == model.unlocked ? ink : cream)
                                .background(n == model.unlocked ? mint : cream.opacity(0.06), in: RoundedRectangle(cornerRadius: 18))
                        }.disabled(n > model.unlocked).accessibilityLabel("\(model.t("level")) \(n)")
                    }
                }.padding(24)
            }.background(ink).navigationTitle(model.t("levels"))
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button(model.t("done")) { levels = false } } }
        }.tint(mint)
    }
    private func primaryButton(_ text: String, symbol: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack { Spacer(); Text(text); Image(systemName: symbol); Spacer() }
                .font(.system(size: 17, weight: .bold, design: .rounded)).foregroundStyle(ink)
                .padding(.vertical, 18).background(mint, in: RoundedRectangle(cornerRadius: 19))
        }.buttonStyle(.plain).disabled(model.life.busy || model.transitioning)
    }
    private func iconButton(_ symbol: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) { Image(systemName: symbol).font(.system(size: 16, weight: .semibold)).frame(width: 44, height: 44).background(cream.opacity(0.07), in: Circle()) }.buttonStyle(.plain).accessibilityLabel(label).disabled(model.life.busy || model.transitioning)
    }
}

struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        Path { path in
            for i in 0..<6 {
                let a = Double(i) * .pi / 3
                let p = CGPoint(x: rect.midX + cos(a) * rect.width / 2, y: rect.midY + sin(a) * rect.height / 2)
                if i == 0 { path.move(to: p) } else { path.addLine(to: p) }
            }
            path.closeSubpath()
        }
    }
}
