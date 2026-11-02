import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthProvider';

type Mode = 'signin' | 'signup' | 'verify' | 'delete';

export function AuthScreen({ onClose, initialMode = 'signin' }: { onClose(): void; initialMode?: Mode }) {
  const auth = useAuth();
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
        if (!entered) { setMode('verify'); setMessage('请输入发送到邮箱的验证码'); }
      }
      if (mode === 'verify') await auth.verifyEmail(email, code);
      if (mode === 'delete') {
        Alert.alert('确认删除账号', '账号和服务器数据将永久删除。', [
          { text: '取消', style: 'cancel' },
          { text: '删除', style: 'destructive', onPress: () => { void auth.deleteAccount(password).then(onClose).catch(error => setMessage(error.message)); } },
        ]);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : '操作失败，请重试'); }
    finally { setBusy(false); }
  }

  async function apple() {
    setBusy(true); setMessage('');
    try { await auth.signInWithApple(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Apple 登录失败'); }
    finally { setBusy(false); }
  }

  return <SafeAreaView style={s.screen}>
    <Pressable accessibilityLabel="返回游戏列表" onPress={onClose} style={s.back}><Text style={s.backText}>‹</Text></Pressable>
    <Text style={s.brand}>Joybit<Text style={s.dot}>.</Text></Text>
    <Text style={s.heading}>{mode === 'delete' ? '删除账号' : mode === 'verify' ? '验证邮箱' : mode === 'signup' ? '创建账号' : '欢迎回来'}</Text>
    <Text style={s.subtitle}>{mode === 'delete' ? '请验证账号后继续' : '一个账号，收藏和游戏都能使用'}</Text>
    {mode !== 'delete' && <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="邮箱" keyboardType="email-address" autoCapitalize="none" accessibilityLabel="邮箱" />}
    {(mode === 'signin' || mode === 'signup' || mode === 'delete') && <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder={mode === 'delete' ? '当前密码（Apple 账号无需填写）' : '密码'} secureTextEntry accessibilityLabel="密码" />}
    {mode === 'verify' && <TextInput style={s.input} value={code} onChangeText={setCode} placeholder="邮箱验证码" keyboardType="number-pad" accessibilityLabel="邮箱验证码" />}
    {!!message && <Text style={s.message}>{message}</Text>}
    <Pressable disabled={busy} style={s.primary} onPress={() => void submit()}><Text style={s.primaryText}>{mode === 'delete' ? '删除账号' : mode === 'verify' ? '验证并登录' : mode === 'signup' ? '注册' : '登录'}</Text></Pressable>
    {busy && <ActivityIndicator color="#25767C" />}
    {mode === 'signin' && <Pressable onPress={() => setMode('signup')} style={s.link}><Text style={s.linkText}>没有账号？注册</Text></Pressable>}
    {mode === 'signup' && <Pressable onPress={() => setMode('signin')} style={s.link}><Text style={s.linkText}>已有账号？登录</Text></Pressable>}
    {mode === 'verify' && <Pressable onPress={() => void auth.resendEmail(email).then(() => setMessage('验证码已重新发送')).catch(error => setMessage(error.message))} style={s.link}><Text style={s.linkText}>重发验证码</Text></Pressable>}
    {Platform.OS === 'ios' && mode === 'signin' && <Pressable onPress={() => void apple()} style={s.apple}><Text style={s.appleText}>通过 Apple 登录</Text></Pressable>}
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F7F8', paddingHorizontal: 28 },
  back: { width: 48, height: 54, justifyContent: 'center' }, backText: { fontSize: 38, color: '#1A2C3D' },
  brand: { fontSize: 28, fontWeight: '900', color: '#1A2C3D', marginTop: 50 }, dot: { color: '#FFB94D' },
  heading: { fontSize: 31, fontWeight: '900', color: '#1A2C3D', marginTop: 34 },
  subtitle: { fontSize: 14, color: '#81939D', marginTop: 8, marginBottom: 28 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E3EBEF', borderRadius: 14, paddingHorizontal: 17, height: 54, marginBottom: 12, fontSize: 15 },
  message: { color: '#B65050', marginVertical: 10 },
  primary: { backgroundColor: '#1F7179', borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  link: { alignItems: 'center', padding: 16 }, linkText: { color: '#26777E', fontWeight: '700' },
  apple: { backgroundColor: '#161D24', borderRadius: 14, alignItems: 'center', justifyContent: 'center', height: 52, marginTop: 16 },
  appleText: { color: '#FFF', fontWeight: '700' },
});
