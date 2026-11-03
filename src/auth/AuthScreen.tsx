import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthProvider';
import { useLanguage } from '../i18n/LanguageProvider';
import type { TranslationKey } from '../i18n/translations';

type Mode = 'signin' | 'signup' | 'verify' | 'delete';

export function AuthScreen({ onClose, initialMode = 'signin' }: { onClose(): void; initialMode?: Mode }) {
  const auth = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit() {
    setBusy(true); setMessage('');
    try {
      if (mode === 'signin') await auth.signIn(email, password);
      if (mode === 'signup') {
        const entered = await auth.signUp(email, password);
        if (!entered) { setMode('verify'); setMessage(t('checkEmailOrLogin')); }
      }
      if (mode === 'verify') await auth.verifyEmail(email, code);
      if (mode === 'delete') {
        Alert.alert(t('confirmDeleteTitle'), t('confirmDeleteBody'), [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: () => { void auth.deleteAccount(password).then(onClose).catch(error => setMessage(authErrorMessage(error, t))); } },
        ]);
      }
    } catch (error) { setMessage(authErrorMessage(error, t)); }
    finally { setBusy(false); }
  }

  return <SafeAreaView style={s.screen}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Pressable accessibilityLabel={t('backToGames')} onPress={onClose} style={s.back}><Text style={s.backText}>‹</Text></Pressable>
    <Text style={s.brand}>Joybit<Text style={s.dot}>.</Text></Text>
    <Text style={s.heading}>{t(mode === 'delete' ? 'deleteAccount' : mode === 'verify' ? 'authTitleVerify' : mode === 'signup' ? 'authTitleSignUp' : 'authTitleSignIn')}</Text>
    <Text style={s.subtitle}>{t(mode === 'delete' ? 'authDeleteSubtitle' : 'authSubtitle')}</Text>
    {mode !== 'delete' && <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder={t('email')} keyboardType="email-address" autoCapitalize="none" accessibilityLabel={t('email')} />}
    {(mode === 'signin' || mode === 'signup' || mode === 'delete') && <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder={t(mode === 'delete' ? 'currentPassword' : 'password')} secureTextEntry accessibilityLabel={t(mode === 'delete' ? 'currentPassword' : 'password')} />}
    {mode === 'verify' && <TextInput style={s.input} value={code} onChangeText={setCode} placeholder={t('emailCode')} keyboardType="number-pad" accessibilityLabel={t('emailCode')} />}
    {!!message && <Text style={s.message}>{message}</Text>}
    <Pressable disabled={busy} style={s.primary} onPress={() => void submit()}><Text style={s.primaryText}>{t(mode === 'delete' ? 'deleteAccount' : mode === 'verify' ? 'verifySignIn' : mode === 'signup' ? 'register' : 'signIn')}</Text></Pressable>
    {busy && <ActivityIndicator color="#25767C" />}
    {mode === 'signin' && <Pressable onPress={() => setMode('signup')} style={s.link}><Text style={s.linkText}>{t('noAccount')}</Text></Pressable>}
    {mode === 'signup' && <Pressable onPress={() => setMode('signin')} style={s.link}><Text style={s.linkText}>{t('haveAccount')}</Text></Pressable>}
    {mode === 'verify' && <Pressable onPress={() => void auth.resendEmail(email).then(() => setMessage(t('codeResent'))).catch(error => setMessage(authErrorMessage(error, t)))} style={s.link}><Text style={s.linkText}>{t('resendCode')}</Text></Pressable>}
    {mode === 'verify' && <Pressable onPress={() => { setMode('signin'); setMessage(''); setCode(''); }} style={s.link}><Text style={s.linkText}>{t('backToSignIn')}</Text></Pressable>}
  </ScrollView></SafeAreaView>;
}

function authErrorMessage(error: unknown, t: (key: TranslationKey) => string): string {
  const value = error as { code?: string; name?: string } | null;
  if (value?.name === 'AuthRetryableFetchError') return t('authNetwork');
  if (value?.code === 'invalid_credentials') return t('authInvalidCredentials');
  if (value?.code === 'email_not_confirmed') return t('authEmailUnconfirmed');
  if (value?.code === 'otp_expired' || value?.code === 'invalid_otp') return t('authInvalidCode');
  if (value?.code?.includes('rate_limit')) return t('authRateLimit');
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
  message: { color: '#B65050', marginVertical: 10 },
  primary: { backgroundColor: '#1F7179', borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  link: { alignItems: 'center', padding: 16 }, linkText: { color: '#26777E', fontWeight: '700' },
});
