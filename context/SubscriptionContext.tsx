import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import { useApp } from './AppContext';
import { checkUsageLimit, incrementUsage, getPlanDetails } from '../services/subscriptionService';
import toast from 'react-hot-toast';

interface SubscriptionContextType {
    checkAccess: (feature: string) => Promise<boolean>;
    consumeQuota: (feature: string) => Promise<boolean>;
    getRemainingQuota: (feature: string) => Promise<number>;
    isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const { user } = useApp();
    const [isLoading, setIsLoading] = useState(false);

    const getPlanId = () => user.plan ? user.plan.toLowerCase() : 'free'; // Map user plan name to ID

    const checkAccess = async (feature: string): Promise<boolean> => {
        if (!user.id) return false;
        const { allowed } = await checkUsageLimit(user.id, getPlanId(), feature);
        return allowed;
    };

    const consumeQuota = async (feature: string): Promise<boolean> => {
        if (!user.id) return false;
        setIsLoading(true);
        try {
            const { allowed, remaining } = await checkUsageLimit(user.id, getPlanId(), feature);

            if (!allowed) {
                toast.error(`Usage limit reached for ${feature}. Upgrade to continue.`);
                return false;
            }

            // Allowed, proceed to increment
            // Note: This matches the "Reset Logic" in service: if period expired, incrementUsage should handle reset.
            // Our service implementation was simplified. In prod, we'd pass the plan period to incrementUsage.

            await incrementUsage(user.id, feature);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const getRemainingQuota = async (feature: string): Promise<number> => {
        if (!user.id) return 0;
        const { remaining } = await checkUsageLimit(user.id, getPlanId(), feature);
        return remaining;
    };

    return (
        <SubscriptionContext.Provider value={{
            checkAccess,
            consumeQuota,
            getRemainingQuota,
            isLoading
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
    return context;
};
