import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { clearCachedSession, createRecoveryClient, getAuthClient, readCachedOfflineSession } from './authClient';
import { normalizeEmail } from './emailInput';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<boolean>;
  verifyEmail(email: string, code: string): Promise<void>;
  resendEmail(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPasswordWithCode(email: string, code: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(password?: string): Promise<void>;
  requireValidSession(): Promise<Session | null>;
};

const Context = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, client: suppliedClient, recoveryClientFactory = createRecoveryClient }: { children: React.ReactNode; client?: SupabaseClient; recoveryClientFactory?: () => SupabaseClient }) {
  const client = useMemo(() => suppliedClient ?? getAuthClient(), [suppliedClient]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionEpoch = useRef(0);

  useEffect(() => {
    let live = true;
    const epoch = sessionEpoch.current;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => { if (live) setSession(next); });
    void client.auth.getSession().then(async ({ data, error }) => {
      const cached = error?.name === 'AuthRetryableFetchError' ? await readCachedOfflineSession() : null;
      if (live && sessionEpoch.current === epoch) { setSession(error ? cached : data.session); setLoading(false); }
    }).catch(async error => {
      const cached = error?.name === 'AuthRetryableFetchError' ? await readCachedOfflineSession() : null;
      if (live && sessionEpoch.current === epoch) { setSession(cached); setLoading(false); }
    });
    return () => { live = false; subscription.unsubscribe(); };
  }, [client]);

  const value = useMemo<AuthContextValue>(() => ({
    session, loading,
    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email: normalizeEmail(email), password });
      if (error) throw error;
      setSession(data.session);
    },
    async signUp(email, password) {
      const { data, error } = await client.auth.signUp({ email: normalizeEmail(email), password });
      if (error) throw error;
      if (data.session) setSession(data.session);
      return Boolean(data.session);
    },
    async verifyEmail(email, code) {
      const { data, error } = await client.auth.verifyOtp({ email: normalizeEmail(email), token: code.trim(), type: 'email' });
      if (error) throw error;
      setSession(data.session);
    },
    async resendEmail(email) {
      const { error } = await client.auth.resend({ email: normalizeEmail(email), type: 'signup' });
      if (error) throw error;
    },
    async requestPasswordReset(email) {
      const { error } = await client.auth.resetPasswordForEmail(normalizeEmail(email));
      if (error) throw error;
    },
    async resetPasswordWithCode(email, code, password) {
      const recoveryClient = recoveryClientFactory();
      const { data: verified, error: verifyError } = await recoveryClient.auth.verifyOtp({ email: normalizeEmail(email), token: code.trim(), type: 'recovery' });
      if (verifyError) throw verifyError;
      if (!verified.session) throw new Error('Recovery session missing');
      const { error: updateError } = await recoveryClient.auth.updateUser({ password });
      if (updateError) throw updateError;
      const { data: promoted, error: promoteError } = await client.auth.setSession({
        access_token: verified.session.access_token,
        refresh_token: verified.session.refresh_token,
      });
      if (promoteError) throw promoteError;
      if (!promoted.session) throw new Error('Session promotion failed');
      setSession(promoted.session);
    },
    async signOut() {
      sessionEpoch.current += 1;
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) await clearCachedSession();
      setSession(null);
      setLoading(false);
    },
    async deleteAccount(password) {
      if (!session) throw new Error('请先登录');
      if (!password) throw new Error('请输入密码以删除账号');
      const { data, error } = await client.functions.invoke('delete-account', { body: { password } });
      if (error || data?.deleted !== true) throw error ?? new Error('删除账号失败');
      await client.auth.signOut({ scope: 'local' });
      setSession(null);
    },
    async requireValidSession() {
      if (!session) return null;
      if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + 30) {
        const { data, error } = await client.auth.refreshSession();
        if (error || !data.session) { if (error?.name !== 'AuthRetryableFetchError') setSession(null); return null; }
        setSession(data.session);
        return data.session;
      }
      const { error } = await client.auth.getUser();
      if (error) { if (error.name !== 'AuthRetryableFetchError') setSession(null); return null; }
      const latest = await client.auth.getSession();
      if (latest.error || !latest.data.session) { if (latest.error?.name !== 'AuthRetryableFetchError') setSession(null); return null; }
      setSession(latest.data.session);
      return latest.data.session;
    },
  }), [client, recoveryClientFactory, session, loading]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}
