import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { LANGUAGE_CODES, resolveLocale, translate, type LanguageCode, type LanguagePreference, type TranslationKey } from './translations';

const storageKey = 'joybit.language';
function deviceLanguage(): LanguageCode {
  const first = getLocales()[0];
  return resolveLocale(first?.languageTag ?? first?.languageCode);
}
function validPreference(value: string | null): LanguagePreference {
  return value === 'auto' || LANGUAGE_CODES.some(code => code === value) ? value as LanguagePreference : 'auto';
}

type LanguageContextValue = {
  locale: LanguageCode;
  preference: LanguagePreference;
  setPreference(value: LanguagePreference): Promise<void>;
  t(key: TranslationKey, values?: Record<string, string | number>): string;
};
const Context = createContext<LanguageContextValue>({
  locale: 'en', preference: 'auto', setPreference: async () => {}, t: (key, values) => translate('en', key, values),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [preference, updatePreference] = useState<LanguagePreference>('auto');
  const [device, updateDevice] = useState<LanguageCode>(deviceLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(storageKey)
      .then(value => { if (active) updatePreference(validPreference(value)); })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') updateDevice(deviceLanguage()); });
    return () => { active = false; subscription.remove(); };
  }, []);

  const locale = preference === 'auto' ? device : preference;
  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    preference,
    async setPreference(next) {
      updatePreference(next);
      if (next === 'auto') updateDevice(deviceLanguage());
      await AsyncStorage.setItem(storageKey, next);
    },
    t: (key, params) => translate(locale, key, params),
  }), [locale, preference]);
  if (!ready) return null;
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(Context);
}
