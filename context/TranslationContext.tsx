
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize client (ensure you have environment variables set)
// In a real app, use a singleton or passed client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

type Translations = Record<string, string>;
type NamespaceCache = Record<string, Translations>;

interface TranslationContextType {
    t: (key: string, namespace?: string, fallback?: string) => string;
    language: string;
    setLanguage: (lang: string) => void;
    loadNamespace: (namespace: string) => Promise<void>;
    isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<string>('en'); // Default to English
    const [cache, setCache] = useState<NamespaceCache>({});
    const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Function to fetch translations for a namespace
    const loadNamespace = useCallback(async (namespace: string) => {
        const cacheKey = `${language}:${namespace}`;
        if (loadedNamespaces.has(cacheKey)) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('ui_translations')
                .select('key, value')
                .eq('language_code', language)
                .eq('namespace', namespace);

            if (error) throw error;

            const newTranslations: Translations = {};
            data?.forEach(row => {
                newTranslations[row.key] = row.value;
            });

            setCache(prev => ({
                ...prev,
                [cacheKey]: { ...(prev[cacheKey] || {}), ...newTranslations }
            }));

            setLoadedNamespaces(prev => new Set(prev).add(cacheKey));
        } catch (err) {
            console.error(`Failed to load translations for ${namespace}:`, err);
        } finally {
            setIsLoading(false);
        }
    }, [language, loadedNamespaces]);

    // Translation function
    const t = useCallback((key: string, namespace: string = 'common', fallback?: string): string => {
        const cacheKey = `${language}:${namespace}`;
        const translations = cache[cacheKey];

        if (translations && translations[key]) {
            return translations[key];
        }

        // Return fallback or key if not found
        return fallback || key; // In dev, maybe return `[${key}]` to highlight missing
    }, [cache, language]);

    // Initial load of 'common' namespace
    useEffect(() => {
        loadNamespace('common');
    }, [loadNamespace]);

    return (
        <TranslationContext.Provider value={{ t, language, setLanguage, loadNamespace, isLoading }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslationContext = () => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslationContext must be used within a TranslationProvider');
    }
    return context;
};
