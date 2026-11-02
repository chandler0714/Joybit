import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getAuthClient } from './authClient';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<boolean>;
  verifyEmail(email: string, code: string): Promise<void>;
  resendEmail(email: string): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(password?: string): Promise<void>;
  requireValidSession(): Promise<Session | null>;
};

const Context = createContext<AuthContextValue | null>(null);

async function appleCredential() {
  if (Platform.OS !== 'ios') throw new Error('Apple 登录仅支持 iOS');
  const bytes = await Crypto.getRandomBytesAsync(32);
  const nonce = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  const credential = await AppleAuthentication.signInAsync({ nonce: hashed, requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL] });
  if (!credential.identityToken) throw new Error('Apple 未返回身份凭证');
  return { nonce, credential };
}

export function AuthProvider({ children, client: suppliedClient }: { children: React.ReactNode; client?: SupabaseClient }) {
  const client = useMemo(() => suppliedClient ?? getAuthClient(), [suppliedClient]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => { if (live) setSession(next); });
    void client.auth.getSession().then(({ data, error }) => {
      if (live) { setSession(error ? null : data.session); setLoading(false); }
    }).catch(() => { if (live) setLoading(false); });
    return () => { live = false; subscription.unsubscribe(); };
  }, [client]);

  const value = useMemo<AuthContextValue>(() => ({
    session, loading,
    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      setSession(data.session);
    },
    async signUp(email, password) {
      const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      if (data.session) setSession(data.session);
      return Boolean(data.session);
    },
    async verifyEmail(email, code) {
      const { data, error } = await client.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
      if (error) throw error;
      setSession(data.session);
    },
    async resendEmail(email) {
      const { error } = await client.auth.resend({ email: email.trim().toLowerCase(), type: 'signup' });
      if (error) throw error;
    },
    async signInWithApple() {
      const { nonce, credential } = await appleCredential();
      const { data, error } = await client.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken!, nonce });
      if (error) throw error;
      setSession(data.session);
    },
    async signOut() {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      setSession(null);
    },
    async deleteAccount(password) {
      if (!session) throw new Error('请先登录');
      let body: Record<string, string>;
      if (session.user.app_metadata?.providers?.includes('apple')) {
        const { nonce, credential } = await appleCredential();
        if (!credential.authorizationCode) throw new Error('Apple 未返回授权码');
        const { data, error } = await client.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken!, nonce });
        if (error || data.user?.id !== session.user.id) throw new Error('Apple 账号验证失败');
        body = { appleAuthorizationCode: credential.authorizationCode };
      } else {
        if (!password) throw new Error('请输入密码以删除账号');
        body = { password };
      }
      const { data, error } = await client.functions.invoke('delete-account', { body });
      if (error || data?.deleted !== true) throw error ?? new Error('删除账号失败');
      await client.auth.signOut({ scope: 'local' });
      setSession(null);
    },
    async requireValidSession() {
      if (!session) return null;
      if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + 30) {
        const { data, error } = await client.auth.refreshSession();
        if (error || !data.session) { setSession(null); return null; }
        setSession(data.session);
        return data.session;
      }
      const { error } = await client.auth.getUser();
      if (error) { setSession(null); return null; }
      const latest = await client.auth.getSession();
      if (latest.error || !latest.data.session) { setSession(null); return null; }
      setSession(latest.data.session);
      return latest.data.session;
    },
  }), [client, session, loading]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}
