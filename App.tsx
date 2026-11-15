import React, { useState } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { AuthScreen } from './src/auth/AuthScreen';
import { HomeScreen } from './src/home/HomeScreen';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageProvider';

function JoybitApp() {
  const auth = useAuth();
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<'signin' | 'delete' | null>(null);

  if (authMode) return <AuthScreen initialMode={authMode} onClose={() => setAuthMode(null)} />;
  return <HomeScreen
    account={auth.session ? { displayName: auth.session.user.email ?? 'Joybit' } : null}
    onSignIn={() => setAuthMode('signin')}
    onSignOut={() => { void auth.signOut().catch(() => Alert.alert(t('signOutFailed'), t('tryAgain'))); }}
    onDeleteAccount={() => setAuthMode('delete')}
  />;
}

export default function App() {
  return <SafeAreaProvider><StatusBar style="dark" /><LanguageProvider><AuthProvider><JoybitApp /></AuthProvider></LanguageProvider></SafeAreaProvider>;
}
