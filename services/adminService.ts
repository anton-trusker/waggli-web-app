import { supabase } from './supabase';
import { PlatformSettings, SupportedLanguage, FeatureFlag } from '../types';

// --- PLATFORM SETTINGS ---
export const getPlatformSettings = async (): Promise<PlatformSettings | null> => {
    const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'global')
        .single();

    if (error || !data) return null;
    return data as PlatformSettings;
};

export const updatePlatformSettings = async (settings: Partial<PlatformSettings>) => {
    // Ensure ID is global
    const payload = { ...settings, id: 'global', updated_at: new Date().toISOString() };
    const { error } = await supabase.from('platform_settings').upsert(payload);
    if (error) throw error;
};

// --- LANGUAGES ---
export const getAdminLanguages = async (): Promise<SupportedLanguage[]> => {
    const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as SupportedLanguage[];
};

export const updateLanguageStatus = async (code: string, isActive: boolean) => {
    const { error } = await supabase
        .from('languages')
        .update({ is_active: isActive })
        .eq('code', code);
    if (error) throw error;
};

export const setDefaultLanguage = async (code: string) => {
    // 1. Set all to false
    await supabase.from('languages').update({ is_default: false }).neq('code', 'placeholder');
    // 2. Set target to true
    const { error } = await supabase
        .from('languages')
        .update({ is_default: true, is_active: true })
        .eq('code', code);
    if (error) throw error;
};

export const addLanguage = async (lang: SupportedLanguage) => {
    const { error } = await supabase.from('languages').insert(lang);
    if (error) throw error;
};

// --- TRANSLATIONS ---
export const getTranslationKeys = async (category: string = 'common') => {
    const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('category', category);

    if (error) throw error;
    return data;
};

export const saveTranslationKey = async (key: string, values: Record<string, string>, category: string) => {
    const { error } = await supabase.from('translations').upsert({
        key,
        translations: values,
        category,
        updated_at: new Date().toISOString()
    });
    if (error) throw error;
};

export const bulkUpdateTranslations = async (updates: { key: string, translations: any, category: string }[]) => {
    const { error } = await supabase.from('translations').upsert(updates);
    if (error) throw error;
};

// --- FEATURE FLAGS ---
export const updateFeatureConfig = async (key: string, config: Partial<FeatureFlag>) => {
    const { error } = await supabase
        .from('feature_flags')
        .update({ ...config, updated_at: new Date().toISOString() })
        .eq('module_key', key);

    if (error) throw error;
};
