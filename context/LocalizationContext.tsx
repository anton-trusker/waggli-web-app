
import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { translateText } from '../services/gemini';
import { getSupportedLanguages, getTranslations } from '../services/db';
import { SupportedLanguage } from '../types';

interface LocalizationContextType {
  language: string;
  languages: SupportedLanguage[];
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
  refreshTranslations: () => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      // 1. Load from Cache immediately
      const cachedLangs = localStorage.getItem('app_languages');
      const cachedTrans = localStorage.getItem('app_translations');
      const storedLang = localStorage.getItem('app_language') || 'en';

      if (cachedLangs) setLanguages(JSON.parse(cachedLangs));
      if (cachedTrans) setTranslations(JSON.parse(cachedTrans));
      setLanguageState(storedLang);

      // 2. Fetch fresh data from DB (Stale-while-revalidate)
      try {
        const langs = await getSupportedLanguages();
        setLanguages(langs);
        localStorage.setItem('app_languages', JSON.stringify(langs));

        const transData = await getTranslations();
        const map: Record<string, any> = {};
        // Convert DB format to Key:Value map for current language
        Object.values(transData).forEach(item => {
          map[item.key] = item.translations;
        });

        // Only update if different (deep check or just set)
        // For simplicity and to ensure freshness, we set it. 
        // React will only re-render if object ref changes, which it will.
        setTranslations(map);
        localStorage.setItem('app_translations', JSON.stringify(map));
      } catch (e) {
        console.error("Failed to refresh localization data", e);
      }
    };
    init();
  }, []);

  const refreshTranslations = async () => {
    const transData = await getTranslations();
    const map: Record<string, any> = {};
    Object.values(transData).forEach(item => {
      map[item.key] = item.translations;
    });
    setTranslations(map);
    const langs = await getSupportedLanguages();
    setLanguages(langs);
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (text: string) => {
    // 1. Try to find translation in current language
    if (translations[text] && translations[text][language]) {
      return translations[text][language];
    }

    // 2. If English, and there is no explicit translation in DB but we passed a key, 
    // we want to return the key IF it looks like a sentence (fallback), 
    // OR return null if it looks like a code key (like 'news_title').
    // BUT we standardized on using || fallback in UI. 
    // So 't' should return falsy if not found.

    // However, if we just return null, what if the key IS the English text?
    // Case A: t('Hello') -> not in DB -> returns null -> UI: { t('Hello') || 'Hello' } -> 'Hello'. Correct.
    // Case B: t('news_title') -> not in DB -> returns null -> UI: { t('news_title') || 'News' } -> 'News'. Correct.

    // So we should just return null/empty if not found.
    return "";
  };

  return (
    <LocalizationContext.Provider value={{ language, languages, setLanguage, t, isTranslating, refreshTranslations }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) throw new Error('useLocalization must be used within a LocalizationProvider');
  return context;
};
