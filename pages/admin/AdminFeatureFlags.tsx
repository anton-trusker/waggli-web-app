import React, { useState } from 'react';
import { useFeatureFlags } from '../../context/FeatureFlagContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

const AdminFeatureFlags: React.FC = () => {
    const { features, refreshFeatures } = useFeatureFlags();
    const [updating, setUpdating] = useState<string | null>(null);

    const featureList = Object.values(features);

    const toggleFeature = async (moduleKey: string, currentState: boolean) => {
        setUpdating(moduleKey);

        try {
            const { error } = await supabase
                .from('feature_flags')
                .update({ is_enabled: !currentState })
                .eq('module_key', moduleKey);

            if (error) throw error;

            toast.success(`Feature ${!currentState ? 'enabled' : 'disabled'} successfully`);
            await refreshFeatures();
        } catch (error: any) {
            console.error('Failed to toggle feature:', error);
            toast.error('Failed to update feature: ' + error.message);
        } finally {
            setUpdating(null);
        }
    };

    const toggleComingSoon = async (moduleKey: string, currentState: boolean) => {
        try {
            const { error } = await supabase
                .from('feature_flags')
                .update({ show_coming_soon: !currentState })
                .eq('module_key', moduleKey);

            if (error) throw error;

            toast.success(`Coming Soon ${!currentState ? 'enabled' : 'hidden'}`);
            await refreshFeatures();
        } catch (error: any) {
            console.error('Failed to toggle coming soon:', error);
            toast.error('Failed to update: ' + error.message);
        }
    };

    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'core': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'premium': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
            case 'experimental': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Feature Flags
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Control which features are enabled and how they appear when disabled
                    </p>
                </div>

                <button
                    onClick={refreshFeatures}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <span className="material-icons-round text-lg">refresh</span>
                    Refresh
                </button>
            </div>

            <div className="grid gap-4">
                {featureList.map((feature) => (
                    <div
                        key={feature.module_key}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                {feature.icon && (
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                                        <span className="material-icons-round text-primary">{feature.icon}</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {feature.module_name}
                                        </h3>

                                        {feature.category && (
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase ${getCategoryColor(feature.category)}`}>
                                                {feature.category}
                                            </span>
                                        )}
                                    </div>

                                    {feature.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {feature.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-round text-xs">code</span>
                                            {feature.module_key}
                                        </span>

                                        {feature.requires_subscription && feature.requires_subscription.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-icons-round text-xs">lock</span>
                                                Requires: {feature.requires_subscription.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Enabled/Disabled Toggle */}
                                <div className="flex flex-col items-end gap-2">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Enabled</label>
                                    <button
                                        onClick={() => toggleFeature(feature.module_key, feature.is_enabled)}
                                        disabled={!feature.can_be_disabled || updating === feature.module_key}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${feature.is_enabled
                                                ? 'bg-green-500'
                                                : 'bg-gray-300 dark:bg-gray-600'
                                            } ${!feature.can_be_disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        title={!feature.can_be_disabled ? 'This feature cannot be disabled' : ''}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${feature.is_enabled ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>

                                    <span className={`text-xs font-semibold ${feature.is_enabled
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {updating === feature.module_key ? 'Updating...' : feature.is_enabled ? 'On' : 'Off'}
                                    </span>
                                </div>

                                {/* Show Coming Soon Toggle (only when disabled) */}
                                {!feature.is_enabled && (
                                    <div className="flex flex-col items-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Coming Soon</label>
                                        <button
                                            onClick={() => toggleComingSoon(feature.module_key, feature.show_coming_soon)}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer ${feature.show_coming_soon
                                                    ? 'bg-yellow-500'
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${feature.show_coming_soon ? 'translate-x-7' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>

                                        <span className={`text-xs font-semibold ${feature.show_coming_soon
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {feature.show_coming_soon ? 'Show' : 'Hide'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {featureList.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <span className="material-icons-round text-5xl mb-4 opacity-50">flag</span>
                    <p>No feature flags found</p>
                </div>
            )}
        </div>
    );
};

export default AdminFeatureFlags;
