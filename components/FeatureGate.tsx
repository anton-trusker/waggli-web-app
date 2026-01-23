import React, { PropsWithChildren } from 'react';
import { useFeature } from '../context/FeatureFlagContext';

interface FeatureGateProps extends PropsWithChildren {
    feature: string;
    fallback?: React.ReactNode;
    showComingSoon?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
    feature,
    fallback,
    showComingSoon = true,
    children
}) => {
    const { isEnabled, feature: featureData, showComingSoon: defaultShowComingSoon } = useFeature(feature);

    if (isEnabled) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showComingSoon && defaultShowComingSoon) {
        return (
            <ComingSoonCard
                title={featureData?.module_name || 'Feature'}
                description={featureData?.description}
                icon={featureData?.icon}
            />
        );
    }

    return null;
};

interface ComingSoonCardProps {
    title: string;
    description?: string;
    icon?: string;
    estimatedLaunch?: string;
    notifyMe?: boolean;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
    title,
    description,
    icon = 'lock',
    estimatedLaunch,
    notifyMe = false
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <span className="material-icons-round text-5xl text-primary/40">{icon}</span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                    {description}
                </p>
            )}

            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
                <span className="material-icons-round text-yellow-600 dark:text-yellow-500 text-sm">schedule</span>
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    Coming Soon
                </span>
            </div>

            {estimatedLaunch && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Expected: {estimatedLaunch}
                </p>
            )}

            {notifyMe && (
                <button className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Notify Me When Available
                </button>
            )}
        </div>
    );
};

export const ComingSoonBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md text-xs font-semibold ${className}`}>
            <span className="material-icons-round text-xs">schedule</span>
            Coming Soon
        </span>
    );
};

export const ComingSoonButton: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <button
            disabled
            className={`relative opacity-60 cursor-not-allowed ${className}`}
            title="This feature is coming soon"
        >
            <div className="absolute -top-2 -right-2 z-10">
                <ComingSoonBadge />
            </div>
            {children}
        </button>
    );
};
