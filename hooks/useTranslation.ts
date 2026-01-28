
import { useEffect } from 'react';
import { useTranslationContext } from '../context/TranslationContext';

export const useTranslation = (namespace: string = 'common') => {
    const { t, loadNamespace, language, isLoading } = useTranslationContext();

    // Auto-load namespace on mount
    useEffect(() => {
        loadNamespace(namespace);
    }, [namespace, loadNamespace]);

    return {
        t: (key: string, fallback?: string) => t(key, namespace, fallback),
        language,
        isLoading
    };
};
