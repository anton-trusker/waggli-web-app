import { supabase } from './supabase';

/**
 * Events (Unified Calendar)
 */
export async function getEvents(userId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) return [];

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', targetUserId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function addEvent(event: {
    pet_id?: string;
    title: string;
    type: 'Appointment' | 'Medication' | 'Vaccine' | 'Task' | 'Reminder' | 'Birthday';
    start_time: string;
    end_time?: string;
    location?: string;
    notes?: string;
    is_all_day?: boolean;
}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('events')
        .insert({
            ...event,
            user_id: user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateEvent(eventId: string, updates: Partial<{
    title: string;
    start_time: string;
    end_time: string;
    location: string;
    notes: string;
}>) {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteEvent(eventId: string) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

    if (error) throw error;
}

/**
 * Subscriptions
 */
export async function getUserSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
}

export async function createSubscription(plan: 'Free' | 'Pro' | 'Family') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: user.id,
            plan,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
