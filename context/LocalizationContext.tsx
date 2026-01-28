
import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { generateBulkTranslations } from '../services/gemini';
import { getSupportedLanguages, getTranslations, saveTranslationsBulk } from '../services/db';
import { SupportedLanguage } from '../types';

interface LocalizationContextType {
  language: string;
  languages: SupportedLanguage[];
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
  refreshTranslations: () => void;
  translateMissingKeys: () => Promise<void>;
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

  const translateMissingKeys = async () => {
    if (language === 'en') return; // English is source
    setIsTranslating(true);
    try {
      // 1. Identify missing
      const missing: Record<string, string> = {};
      // Use 'en' as source of truth for keys, or all keys in translations obj
      Object.keys(translations).forEach(key => {
        // If missing or empty in target language
        if (!translations[key][language]) {
          // Source is English translation OR key itself (if readable)
          missing[key] = translations[key]['en'] || key;
        }
      });

      const keysToTranslate = Object.keys(missing);
      if (keysToTranslate.length === 0) {
        console.log("No missing keys to translate");
        return;
      }

      console.log(`Translating ${keysToTranslate.length} keys to ${language}...`);

      // 2. Chunking (Batch of 20 to avoid large payload)
      const chunkSize = 20;
      const chunks = [];
      for (let i = 0; i < keysToTranslate.length; i += chunkSize) {
        chunks.push(keysToTranslate.slice(i, i + chunkSize));
      }

      // 3. Process Chunks
      for (const chunkKeys of chunks) {
        const batch: Record<string, string> = {};
        chunkKeys.forEach(k => batch[k] = missing[k]);

        const translatedBatch = await generateBulkTranslations(batch, language);

        // 4. Update DB
        const dbUpdates = Object.keys(translatedBatch).map(key => ({
          key,
          translations: {
            ...translations[key], // Keep existing siblings
            [language]: translatedBatch[key]
          }
        }));

        await saveTranslationsBulk(dbUpdates);
      }

      // 5. Refresh Local
      await refreshTranslations();

    } catch (e) {
      console.error("Auto-translation failed", e);
    } finally {
      setIsTranslating(false);
    }
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
    <LocalizationContext.Provider value={{ language, languages, setLanguage, t, isTranslating, refreshTranslations, translateMissingKeys }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) throw new Error('useLocalization must be used within a LocalizationProvider');
  return context;
};
