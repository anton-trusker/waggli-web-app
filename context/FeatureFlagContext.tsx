import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { supabase } from '../services/supabase';

export interface FeatureFlag {
    module_key: string;
    module_name: string;
    description?: string;
    is_enabled: boolean;
    show_in_navigation: boolean;
    show_coming_soon: boolean;
    icon?: string;
    category?: 'core' | 'premium' | 'experimental';
    requires_subscription?: string[];
    can_be_disabled: boolean;
}

interface FeatureFlagContextType {
    features: Record<string, FeatureFlag>;
    isFeatureEnabled: (key: string) => boolean;
    canUserAccess: (key: string) => boolean;
    refreshFeatures: () => Promise<void>;
    isLoading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

const CACHE_KEY = 'feature_flags_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const FeatureFlagProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [features, setFeatures] = useState<Record<string, FeatureFlag>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadFeatures = async () => {
        try {
            // Try cache first
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setFeatures(data);
                    setIsLoading(false);
                    return;
                }
            }

            // Fetch from database
            const { data, error } = await supabase
                .from('feature_flags')
                .select('*')
                .order('module_name');

            if (error) throw error;

            const flagsMap: Record<string, FeatureFlag> = {};
            data?.forEach((flag: any) => {
                flagsMap[flag.module_key] = flag;
            });

            setFeatures(flagsMap);

            // Cache the result
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: flagsMap,
                timestamp: Date.now()
            }));

        } catch (error) {
            console.error('Failed to load feature flags:', error);
            // Fallback to default enabled state
            setFeatures({});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFeatures();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('feature_flags_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'feature_flags' },
                () => {
                    // Invalidate cache and reload
                    localStorage.removeItem(CACHE_KEY);
                    loadFeatures();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isFeatureEnabled = (key: string): boolean => {
        return features[key]?.is_enabled ?? false;
    };

    const canUserAccess = (key: string): boolean => {
        const feature = features[key];
        if (!feature) return false;
        if (!feature.is_enabled) return false;

        // TODO: Check user subscription if feature requires it
        // if (feature.requires_subscription?.length > 0) {
        //   const userSubscription = getUserSubscription();
        //   return feature.requires_subscription.includes(userSubscription);
        // }

        return true;
    };

    const refreshFeatures = async () => {
        localStorage.removeItem(CACHE_KEY);
        await loadFeatures();
    };

    return (
        <FeatureFlagContext.Provider value={{
            features,
            isFeatureEnabled,
            canUserAccess,
            refreshFeatures,
            isLoading
        }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
    }
    return context;
};

export const useFeature = (moduleKey: string) => {
    const { features, isFeatureEnabled, canUserAccess } = useFeatureFlags();
    const feature = features[moduleKey];

    return {
        isEnabled: isFeatureEnabled(moduleKey),
        canAccess: canUserAccess(moduleKey),
        feature,
        showComingSoon: feature?.show_coming_soon ?? true,
        isLoading: !feature
    };
};
