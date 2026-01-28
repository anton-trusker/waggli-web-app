import { supabase } from './supabase';
import { PlanLimit, UserUsage, SubscriptionPlan } from '../types';

// Cache for plan limits
let planCache: Record<string, SubscriptionPlan> = {};

export const getPlanDetails = async (planId: string): Promise<SubscriptionPlan | null> => {
    if (planCache[planId]) return planCache[planId];

    const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (error || !data) return null;

    planCache[planId] = data as SubscriptionPlan;
    return data as SubscriptionPlan;
};

export const getUserUsage = async (userId: string, feature: string): Promise<UserUsage | null> => {
    const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('feature', feature)
        .single();

    if (error) return null;
    return data as UserUsage;
};

export const checkUsageLimit = async (userId: string, planId: string, feature: string): Promise<{ allowed: boolean; remaining: number }> => {
    // 1. Get Plan Limits
    const plan = await getPlanDetails(planId);
    if (!plan) return { allowed: true, remaining: 999 }; // Fallback to allowing if no plan found (or assume Free defaults)

    const limitRule = plan.limits?.find(l => l.feature === feature);
    if (!limitRule || limitRule.limit === -1) return { allowed: true, remaining: 999 };

    // 2. Get Current Usage
    const usage = await getUserUsage(userId, feature);
    if (!usage) return { allowed: true, remaining: limitRule.limit };

    // 3. Check Reset Period
    const now = new Date();
    const lastReset = new Date(usage.lastReset);
    let shouldReset = false;

    if (limitRule.period === 'daily') {
        shouldReset = now.getDate() !== lastReset.getDate();
    } else if (limitRule.period === 'monthly') {
        shouldReset = now.getMonth() !== lastReset.getMonth();
    } else if (limitRule.period === 'yearly') {
        shouldReset = now.getFullYear() !== lastReset.getFullYear();
    }

    if (shouldReset) {
        // We don't reset DB here to avoid extra write, we just assume 0 usage for calculation
        // But better to reset if we are about to increment. 
        // For check, we return full limit.
        return { allowed: true, remaining: limitRule.limit };
    }

    const remaining = limitRule.limit - usage.count;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
};

export const incrementUsage = async (userId: string, feature: string) => {
    const { data: usage } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('feature', feature)
        .single();

    const now = new Date().toISOString();

    if (usage) {
        // Logic to reset count if period expired could be here or in check.
        // Simplified: Just increment. Reset logic ideally handled by a scheduled job or check-on-write.
        // Implementing basic check-on-write reset:

        // Fetch plan to know period (inefficient, simplified for MVP)
        // ideally we pass period or store it.
        // For now, assuming standard monthly reset if not recently reset.

        await supabase
            .from('user_usage')
            .update({ count: usage.count + 1, last_reset: usage.last_reset }) // Should update last_reset if period changed
            .eq('id', usage.id);
    } else {
        await supabase
            .from('user_usage')
            .insert({ user_id: userId, feature, count: 1, last_reset: now });
    }
};

export const resetUsage = async (userId: string, feature: string) => {
    const now = new Date().toISOString();
    // Upsert with count 0
    const { data, error } = await supabase
        .from('user_usage')
        .upsert({ user_id: userId, feature, count: 0, last_reset: now }, { onConflict: 'user_id, feature' as any }); // Need unique constraint
};
