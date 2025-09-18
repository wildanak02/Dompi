// src/contexts/LanguageContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContextType, Language } from '@/types';
import { translations, locales } from '@/constants/localization';
import { LANG_KEY } from '@/constants/storageKeys';

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: () => {},
  t: (key: string) => key,
  locale: locales.id,
});

export const useLocalization = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('id');

  useEffect(() => {
    const loadLang = async () => {
      const savedLang = (await AsyncStorage.getItem(LANG_KEY)) as Language;
      if (savedLang) setLang(savedLang);
    };
    loadLang();
  }, []);

  const setAndStoreLang = (newLang: Language) => {
    setLang(newLang);
    AsyncStorage.setItem(LANG_KEY, newLang);
  };

  const t = (key: string, ...args: any[]) => {
    let translation = translations[lang][key as keyof typeof translations.id];
    if (typeof translation === 'function') {
      return translation(...args);
    }
    return translation || key;
  };

  const locale = locales[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang: setAndStoreLang, t, locale }}>
      {children}
    </LanguageContext.Provider>
  );
};
