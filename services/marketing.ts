
import { supabase } from "./supabase";

export interface AudienceSegment {
    id: string;
    name: string;
    filters: {
        breed?: string[];
        plan?: string[];
        location?: string[];
        age_range?: string;
        last_active?: number;
    };
    estimated_count: number;
}

export interface MarketingCampaign {
    id: string;
    name: string;
    status: 'Draft' | 'Scheduled' | 'Active' | 'Paused' | 'Completed';
    start_date?: string;
    end_date?: string;
    budget_total?: number;
}

export interface MarketingContent {
    id: string;
    campaign_id: string;
    type: 'banner' | 'email' | 'notification' | 'post' | 'popup';
    placement_zone: string;
    title: string;
    body: string;
    media_url?: string;
    cta_text?: string;
    cta_link?: string;
    segment_id?: string;
    metadata?: any;
    ai_generated?: boolean;
}

// --- CAMPAIGNS ---

export const fetchCampaigns = async () => {
    const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MarketingCampaign[];
};

export const createCampaign = async (campaign: Partial<MarketingCampaign>) => {
    const { data, error } = await supabase.from('marketing_campaigns').insert(campaign).select().single();
    if (error) throw error;
    return data;
};

// --- CONTENT ---

export const fetchContent = async (campaignId?: string) => {
    let query = supabase.from('marketing_content').select('*, audience_segments(name)');
    if (campaignId) query = query.eq('campaign_id', campaignId);

    const { data, error } = await query;
    if (error) throw error;
    return data; // as MarketingContent but joined
};

export const createContent = async (content: Partial<MarketingContent>) => {
    const { data, error } = await supabase.from('marketing_content').insert(content).select().single();
    if (error) throw error;
    return data;
};

// --- SEGMENTS ---

export const fetchSegments = async () => {
    const { data, error } = await supabase.from('audience_segments').select('*');
    if (error) throw error;
    return data as AudienceSegment[];
};

export const createSegment = async (segment: Partial<AudienceSegment>) => {
    const { data, error } = await supabase.from('audience_segments').insert(segment).select().single();
    if (error) throw error;
    return data;
};

// --- AI GENERATION ---

export const generateMarketingContent = async (topic: string, type: string, tone: string) => {
    // Stub for AI call (Gemini)
    // In real app, call Edge Function 'generate-copy'
    return {
        title: `AI Generated Title for ${topic}`,
        body: `Here is some compelling ${tone} copy about ${topic}. It works great for a ${type} placement!`
    };
};
