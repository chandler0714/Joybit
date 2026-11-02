import SwiftUI
import AuthenticationServices

struct AuthRootView: View {
    @StateObject private var auth = AuthModel()
    @Environment(\.scenePhase) private var scenePhase
    var body: some View {
        ZStack {
            if auth.checking {
                Color(red: 0.07, green: 0.17, blue: 0.19).ignoresSafeArea()
                ProgressView().tint(.white)
            } else if let session = auth.session {
                ContentView(progressNamespace: session.user.id).id(session.user.id).environmentObject(auth)
            } else { AuthView().environmentObject(auth) }
        }
        .task { await auth.restore(); await auth.refreshProviders() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active && auth.session != nil { Task { await auth.restore(); await auth.refreshProviders() } }
        }
        .onReceive(NotificationCenter.default.publisher(for: ASAuthorizationAppleIDProvider.credentialRevokedNotification)) { _ in auth.credentialRevoked() }
    }
}

struct AuthView: View {
    @EnvironmentObject private var auth: AuthModel
    @AppStorage("language") private var languageCode = Language.device.rawValue
    @State private var registering = false
    @State private var recovering = false
    @State private var codeSent = false
    @State private var email = ""
    @State private var password = ""
    @State private var confirmation = ""
    @State private var code = ""
    private let mint = Color(red: 0.45, green: 0.87, blue: 0.73)
    private var confirmingSignup: Bool { auth.pendingSignupEmail != nil }
    private var language: Language { Language(rawValue: languageCode) ?? .en }
    private func t(_ key: String) -> String { Copy.text(key, language) }
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.07, green: 0.22, blue: 0.25), Color(red: 0.07, green: 0.17, blue: 0.19)], startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea()
            ScrollView {
                VStack(spacing: 19) {
                    HStack {
                        Spacer()
                        Menu { ForEach(Language.allCases) { lang in Button(lang.title) { languageCode = lang.rawValue } } } label: {
                            Label(language.title, systemImage: "globe").font(.caption).foregroundStyle(mint)
                        }
                    }.padding(.top, 12)
                    ZStack {
                        Hexagon().fill(Color(red: 1, green: 0.76, blue: 0.39)).frame(width: 72, height: 66)
                        Text("• ᴗ •").font(.system(size: 24, weight: .bold)).foregroundStyle(Color(red: 0.07, green: 0.17, blue: 0.19))
                    }.padding(.top, 12)
                    Text("STEADY DROP").font(.system(size: 29, weight: .black, design: .rounded)).tracking(-0.8)
                    Text(t(confirmingSignup ? "authVerifyTitle" : recovering ? "authResetTitle" : registering ? "authRegisterTitle" : "authTitle")).font(.title3.bold())
                    Text(confirmingSignup ? t("authVerifyDetail") : t("authSubtitle")).font(.subheadline).foregroundStyle(.white.opacity(0.6)).multilineTextAlignment(.center)
                    VStack(spacing: 13) {
                        if let pending = auth.pendingSignupEmail {
                            Text(pending).font(.subheadline.weight(.semibold)).foregroundStyle(mint).textSelection(.enabled)
                            TextField(t("authCode"), text: $code, prompt: Text(t("authCode")).foregroundColor(.white.opacity(0.45)))
                                .textContentType(.oneTimeCode).keyboardType(.numberPad)
                                .textInputAutocapitalization(.never).autocorrectionDisabled()
                                .modifier(AuthField()).accessibilityIdentifier("signupVerificationCode")
                        } else {
                            TextField(t("authEmail"), text: $email).textContentType(.emailAddress).keyboardType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled().disabled(codeSent)
                                .modifier(AuthField())
                            if !recovering || codeSent {
                                if codeSent { TextField(t("authCode"), text: $code).textContentType(.oneTimeCode).keyboardType(.numberPad).modifier(AuthField()) }
                                SecureField(t("authPassword"), text: $password).textContentType(registering || recovering ? .newPassword : .password).modifier(AuthField())
                                if registering || codeSent { SecureField(t("authConfirm"), text: $confirmation).textContentType(.newPassword).modifier(AuthField()) }
                            }
                        }
                    }.disabled(auth.busy)
                    if !auth.configured {
                        Label(t("authConfig"), systemImage: "info.circle").font(.footnote).foregroundStyle(mint.opacity(0.9)).multilineTextAlignment(.leading)
                    }
                    if let key = auth.errorKey { Text(t(key)).font(.footnote).foregroundStyle(Color(red: 1, green: 0.65, blue: 0.55)).multilineTextAlignment(.center).accessibilityAddTraits(.updatesFrequently) }
                    if let key = auth.noticeKey { Text(t(key)).font(.footnote).foregroundStyle(mint).multilineTextAlignment(.center) }
                    Button { submit() } label: {
                        HStack {
                            Spacer()
                            if auth.busy { ProgressView().tint(.black) }
                            else { Text(t(confirmingSignup ? "authVerifyContinue" : recovering ? (codeSent ? "authSavePassword" : "authSendCode") : registering ? "authRegister" : "authLogin")) }
                            Spacer()
                        }.font(.headline).foregroundStyle(Color(red: 0.07, green: 0.17, blue: 0.19)).padding(.vertical, 17).background(mint, in: RoundedRectangle(cornerRadius: 17))
                    }.disabled(!auth.configured || auth.busy).opacity(auth.configured ? 1 : 0.45)
                    if confirmingSignup {
                        TimelineView(.periodic(from: .now, by: 1)) { context in
                            let remaining = auth.resendSecondsRemaining(at:context.date)
                            Button {
                                Task { await auth.resendSignup(); if auth.errorKey == nil { code = "" } }
                            } label: {
                                Text(remaining > 0 ? "\(t("authResend")) · \(remaining)s" : t("authResend"))
                                    .frame(minHeight:44)
                            }.tint(mint).disabled(auth.busy || remaining > 0)
                        }
                        HStack {
                            Button(t("authChangeEmail")) { auth.cancelSignup(); registering = true; recovering = false; clearForm() }
                            Spacer()
                            Button(t("authBackLogin")) { auth.cancelSignup(); registering = false; recovering = false; clearForm() }
                        }.font(.caption).tint(mint).disabled(auth.busy)
                    } else if !recovering {
                        HStack {
                            Button(t(registering ? "authHaveAccount" : "authCreateAccount")) { registering.toggle(); clearForm() }
                            Spacer(minLength: 5)
                            if !registering { Button(t("authForgot")) { recovering = true; clearForm() } }
                        }.font(.caption).tint(mint).disabled(auth.busy)
                        HStack { Rectangle().frame(height: 1); Text(t("authOr")).font(.caption); Rectangle().frame(height: 1) }.foregroundStyle(.white.opacity(0.2))
                        SignInWithAppleButton(.signIn, onRequest: auth.prepareApple) { result in Task { await auth.completeApple(result) } }
                            .signInWithAppleButtonStyle(.white).frame(height: 52).clipShape(RoundedRectangle(cornerRadius: 14))
                            .disabled(!auth.appleAvailable || auth.busy).opacity(auth.appleAvailable ? 1 : 0.45)
                            .environment(\.locale, Locale(identifier: language.rawValue))
                        if auth.configured && !auth.appleAvailable { Text(t("authAppleUnavailable")).font(.caption).foregroundStyle(.white.opacity(0.5)).multilineTextAlignment(.center) }
                    } else {
                        Button(t("authBackLogin")) { recovering = false; codeSent = false; clearForm() }.tint(mint).disabled(auth.busy)
                    }
                    Link(t("privacyPolicy"), destination:AppLinks.privacy).font(.footnote).tint(mint).frame(minHeight:44)
                    Text(t("authLocalProgress")).font(.caption2).foregroundStyle(.white.opacity(0.35)).multilineTextAlignment(.center)
                }.padding(.horizontal, 28).padding(.bottom, 24).frame(maxWidth: 480)
                    .frame(maxWidth: .infinity)
            }.scrollDismissesKeyboard(.interactively)
        }.foregroundStyle(Color(red: 0.97, green: 0.94, blue: 0.85))
        .onChange(of:auth.pendingSignupEmail) { _, pending in
            if pending != nil { password = ""; confirmation = ""; code = ""; codeSent = false; recovering = false }
        }
    }
    private func clearForm() { password = ""; confirmation = ""; code = ""; auth.errorKey = nil; auth.noticeKey = nil }
    private func submit() {
        Task {
            if confirmingSignup {
                await auth.verifySignup(code:code)
            } else if recovering {
                if codeSent { await auth.reset(email: email, code: code, password: password, confirmation: confirmation); password = ""; confirmation = "" }
                else { codeSent = await auth.requestReset(email: email) }
            } else {
                await auth.email(email: email, password: password, confirmation: confirmation, registering: registering)
                password = ""; confirmation = ""
            }
        }
    }
}

private struct AuthField: ViewModifier {
    func body(content: Content) -> some View {
        content.padding(16).background(.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(.white.opacity(0.1)))
    }
}
