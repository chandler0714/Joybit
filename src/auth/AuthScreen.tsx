import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthProvider';
import { isEmail, isEmailCode, isPassword, normalizeEmail } from './emailInput';
import { useLanguage } from '../i18n/LanguageProvider';
import type { TranslationKey } from '../i18n/translations';

type Mode = 'signin' | 'signup' | 'verify' | 'recover' | 'reset' | 'delete';

export function AuthScreen({ onClose, initialMode = 'signin' }: { onClose(): void; initialMode?: Mode }) {
  const auth = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const cooldowns = useRef<Record<string, number>>({});
  const waitSeconds = Math.max(0, Math.ceil(((cooldowns.current[pendingEmail] ?? 0) - now) / 1000));

  useEffect(() => {
    if (mode !== 'verify' && mode !== 'reset') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') setNow(Date.now()); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [mode]);

  function startCooldown(address: string) {
    cooldowns.current[address] = Date.now() + 60000;
    setNow(Date.now());
  }
  function clearSecrets() { setPassword(''); setConfirmPassword(''); setCode(''); }
  function navigate(next: Mode) {
    clearSecrets(); setEmail(''); setMessage(''); setMode(next);
    if (next !== 'verify' && next !== 'reset') setPendingEmail('');
  }
  function close() { clearSecrets(); onClose(); }

  async function submit() {
    if (busyRef.current) return;
    const address = mode === 'verify' || mode === 'reset' ? pendingEmail : normalizeEmail(email);
    if (mode !== 'delete' && !isEmail(address)) { setMessage(t('authInvalidEmail')); return; }
    if ((mode === 'signup' || mode === 'reset') && !isPassword(password)) { setMessage(t('authWeakPassword')); return; }
    if ((mode === 'signup' || mode === 'reset') && password !== confirmPassword) { setMessage(t('authPasswordMismatch')); return; }
    if ((mode === 'verify' || mode === 'reset') && !isEmailCode(code)) { setMessage(t('authInvalidCodeFormat')); return; }
    if (mode === 'delete' && !password) { setMessage(t('authDeletePasswordRequired')); return; }

    busyRef.current = true; setBusy(true); setMessage('');
    try {
      if (mode === 'signin') {
        await auth.signIn(address, password); clearSecrets();
      } else if (mode === 'signup') {
        const entered = await auth.signUp(address, password);
        clearSecrets();
        if (!entered) { setPendingEmail(address); startCooldown(address); setMode('verify'); setMessage(t('checkEmailOrLogin')); }
      } else if (mode === 'verify') {
        await auth.verifyEmail(address, code.trim()); clearSecrets();
      } else if (mode === 'recover') {
        await auth.requestPasswordReset(address);
        clearSecrets(); setPendingEmail(address); startCooldown(address); setMode('reset'); setMessage(t('recoveryCodeSent'));
      } else if (mode === 'reset') {
        await auth.resetPasswordWithCode(address, code.trim(), password); clearSecrets();
      } else {
        Alert.alert(t('confirmDeleteTitle'), t('confirmDeleteBody'), [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: () => { void auth.deleteAccount(password).then(close).catch(error => setMessage(authErrorMessage(error, t))); } },
        ]);
      }
    } catch (error) {
      if (mode === 'signin' && (error as { code?: string } | null)?.code === 'email_not_confirmed') {
        clearSecrets(); setPendingEmail(address); setMode('verify'); setMessage(t('authEmailUnconfirmed'));
      } else setMessage(authErrorMessage(error, t));
    } finally { busyRef.current = false; setBusy(false); }
  }

  async function resend() {
    if (busyRef.current || waitSeconds > 0 || !pendingEmail) return;
    busyRef.current = true; setBusy(true); setMessage('');
    try {
      if (mode === 'verify') await auth.resendEmail(pendingEmail);
      else await auth.requestPasswordReset(pendingEmail);
      startCooldown(pendingEmail); setMessage(t(mode === 'verify' ? 'codeResent' : 'recoveryCodeSent'));
    } catch (error) {
      if (isRateLimited(error)) startCooldown(pendingEmail);
      setMessage(authErrorMessage(error, t));
    } finally { busyRef.current = false; setBusy(false); }
  }

  const title: TranslationKey = mode === 'delete' ? 'deleteAccount' : mode === 'verify' ? 'authTitleVerify' : mode === 'signup' ? 'authTitleSignUp' : mode === 'recover' ? 'authTitleRecover' : mode === 'reset' ? 'authTitleReset' : 'authTitleSignIn';
  const action: TranslationKey = mode === 'delete' ? 'deleteAccount' : mode === 'verify' ? 'verifySignIn' : mode === 'signup' ? 'register' : mode === 'recover' ? 'sendRecoveryCode' : mode === 'reset' ? 'resetPassword' : 'signIn';

  return <SafeAreaView style={s.screen}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Pressable accessibilityLabel={t('backToGames')} onPress={close} style={s.back}><Text style={s.backText}>‹</Text></Pressable>
    <Text style={s.brand}>Joybit<Text style={s.dot}>.</Text></Text>
    <Text style={s.heading}>{t(title)}</Text>
    <Text style={s.subtitle}>{t(mode === 'delete' ? 'authDeleteSubtitle' : 'authSubtitle')}</Text>
    {(mode === 'signin' || mode === 'signup' || mode === 'recover') && <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder={t('email')} keyboardType="email-address" autoCapitalize="none" accessibilityLabel={t('email')} />}
    {(mode === 'verify' || mode === 'reset') && <Text style={s.pendingEmail}>{pendingEmail}</Text>}
    {(mode === 'signin' || mode === 'signup' || mode === 'reset' || mode === 'delete') && <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder={t(mode === 'delete' ? 'currentPassword' : mode === 'reset' ? 'newPassword' : 'password')} secureTextEntry accessibilityLabel={t(mode === 'delete' ? 'currentPassword' : mode === 'reset' ? 'newPassword' : 'password')} />}
    {(mode === 'signup' || mode === 'reset') && <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder={t('confirmPassword')} secureTextEntry accessibilityLabel={t('confirmPassword')} />}
    {(mode === 'verify' || mode === 'reset') && <TextInput style={s.input} value={code} onChangeText={setCode} placeholder={t('emailCode')} keyboardType="number-pad" textContentType="oneTimeCode" accessibilityLabel={t('emailCode')} />}
    {!!message && <Text style={s.message}>{message}</Text>}
    <Pressable accessibilityRole="button" disabled={busy} style={s.primary} onPress={() => void submit()}><Text style={s.primaryText}>{t(action)}</Text></Pressable>
    {busy && <ActivityIndicator color="#25767C" />}
    {mode === 'signin' && <><Pressable onPress={() => navigate('recover')} style={s.link}><Text style={s.linkText}>{t('forgotPassword')}</Text></Pressable><Pressable onPress={() => navigate('signup')} style={s.link}><Text style={s.linkText}>{t('noAccount')}</Text></Pressable></>}
    {mode === 'signup' && <Pressable onPress={() => navigate('signin')} style={s.link}><Text style={s.linkText}>{t('haveAccount')}</Text></Pressable>}
    {(mode === 'verify' || mode === 'reset') && <Pressable accessibilityRole="button" accessibilityLabel={t('resendCode')} disabled={busy || waitSeconds > 0} onPress={() => void resend()} style={s.link}><Text style={s.linkText}>{waitSeconds > 0 ? t('resendCountdown', { seconds: waitSeconds }) : t('resendCode')}</Text></Pressable>}
    {(mode === 'verify' || mode === 'reset') && <Pressable onPress={() => navigate(mode === 'verify' ? 'signup' : 'recover')} style={s.link}><Text style={s.linkText}>{t('changeEmail')}</Text></Pressable>}
    {(mode === 'verify' || mode === 'reset' || mode === 'recover') && <Pressable onPress={() => navigate('signin')} style={s.link}><Text style={s.linkText}>{t('backToSignIn')}</Text></Pressable>}
  </ScrollView></SafeAreaView>;
}

function isRateLimited(error: unknown): boolean {
  const value = error as { code?: string; status?: number } | null;
  return value?.status === 429 || Boolean(value?.code?.includes('rate_limit'));
}
function authErrorMessage(error: unknown, t: (key: TranslationKey) => string): string {
  const value = error as { code?: string; name?: string } | null;
  if (value?.name === 'AuthRetryableFetchError') return t('authNetwork');
  if (value?.code === 'invalid_credentials') return t('authInvalidCredentials');
  if (value?.code === 'email_not_confirmed') return t('authEmailUnconfirmed');
  if (value?.code === 'weak_password') return t('authWeakPassword');
  if (value?.code === 'otp_expired' || value?.code === 'invalid_otp') return t('authInvalidCode');
  if (isRateLimited(error)) return t('authRateLimit');
  return t('authError');
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F7F8', paddingHorizontal: 28 },
  content: { flexGrow: 1, paddingBottom: 28 },
  back: { width: 48, height: 54, justifyContent: 'center' }, backText: { fontSize: 38, color: '#1A2C3D' },
  brand: { fontSize: 28, fontWeight: '900', color: '#1A2C3D', marginTop: 50 }, dot: { color: '#FFB94D' },
  heading: { fontSize: 31, fontWeight: '900', color: '#1A2C3D', marginTop: 34 },
  subtitle: { fontSize: 14, color: '#81939D', marginTop: 8, marginBottom: 28 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E3EBEF', borderRadius: 14, paddingHorizontal: 17, height: 54, marginBottom: 12, fontSize: 15 },
  pendingEmail: { fontSize: 16, color: '#1A2C3D', fontWeight: '700', marginBottom: 18 },
  message: { color: '#B65050', marginVertical: 10 },
  primary: { backgroundColor: '#1F7179', borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  link: { alignItems: 'center', padding: 16 }, linkText: { color: '#26777E', fontWeight: '700' },
});
