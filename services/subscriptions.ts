
import { supabase } from "./supabase";

export interface SubscriptionPlan {
    id: string;
    internal_name: string;
    display_name: string;
    stripe_product_id?: string;
    price_monthly: number;
    price_yearly?: number;
    trial_days: number;
    max_pets: number;
    can_use_ai_assistant: boolean;
    can_share_passport: boolean;
    monthly_ai_queries: number;
    storage_limit_mb: number;
    // New Spec Fields
    segment: 'pet_owner' | 'service_provider';
    commission_rate: number;
    listings_limit: number;
    features: Record<string, any>; // Flexible JSON for UI display features
    is_active: boolean;
    created_at?: string;
}

export interface PromoCode {
    id: string;
    code: string;
    type: 'percent_off' | 'fixed_amount' | 'extended_trial';
    value: number;
    max_redemptions?: number;
    current_redemptions: number;
    expires_at?: string;
    is_active: boolean;
}

// --- PLANS ---

export const fetchPlans = async (): Promise<SubscriptionPlan[]> => {
    const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

    if (error) {
        console.error("Fetch Plans Error", error);
        return [];
    }
    return data as SubscriptionPlan[];
};

export const saveSubscriptionPlan = async (plan: Partial<SubscriptionPlan>) => {
    const { data, error } = await supabase
        .from('subscription_plans')
        .upsert(plan as any)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteSubscriptionPlan = async (id: string) => {
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) throw error;
};

// --- PROMOS ---

export const fetchPromoCodes = async (): Promise<PromoCode[]> => {
    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch Promos Error", error);
        return [];
    }
    return data as PromoCode[];
};

export const createPromoCode = async (promo: Partial<PromoCode>) => {
    const { data, error } = await supabase
        .from('promo_codes')
        .insert(promo as any)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deletePromoCode = async (id: string) => {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (error) throw error;
};
