
import { supabase } from "./supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


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
    // TODO: marketing_campaigns table doesn't exist
    console.warn('Fetch campaigns disabled - table does not exist');
    return [];
    // const { data, error } = await supabase
    //     .from('marketing_campaigns')
    //     .select('*')
    //     .order('created_at', { ascending: false });
    // if (error) throw error;
    // return data as MarketingCampaign[];
};

export const createCampaign = async (campaign: Partial<MarketingCampaign>) => {
    // TODO: marketing_campaigns table doesn't exist
    console.warn('Create campaign disabled - table does not exist');
    return null;
    // const { data, error } = await supabase.from('marketing_campaigns').insert(campaign).select().single();
    // if (error) throw error;
    // return data;
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
    try {
        const prompt = `Generate a marketing ${type} about "${topic}" with a ${tone} tone for a pet health platform. 
        Return JSON format: { "title": "...", "body": "..." }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Marketing AI Error:", error);
        return {
            title: `AI Generated Title for ${topic}`,
            body: `Here is some compelling ${tone} copy about ${topic}. It works great for a ${type} placement!`
        };
    }
};
