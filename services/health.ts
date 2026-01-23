import { supabase } from './supabase';

/**
 * Medical Visits
 */
export async function getMedicalVisits(petId: string) {
    const { data, error } = await supabase
        .from('medical_visits')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function addMedicalVisit(visit: {
    pet_id: string;
    date: string;
    provider_name?: string;
    clinic_name?: string;
    reason: string;
    diagnosis?: string;
    cost?: number;
    notes?: string;
}) {
    const { data, error } = await supabase
        .from('medical_visits')
        .insert(visit)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Vaccinations
 */
export async function getVaccinations(petId: string) {
    const { data, error } = await supabase
        .from('vaccinations_new')
        .select('*')
        .eq('pet_id', petId)
        .order('date_administered', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function addVaccination(vaccine: {
    pet_id: string;
    name: string;
    date_administered: string;
    next_due_date?: string;
    batch_number?: string;
    clinic_name?: string;
}) {
    const { data, error } = await supabase
        .from('vaccinations_new')
        .insert(vaccine)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Allergies
 */
export async function getAllergies(petId: string) {
    const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('pet_id', petId);

    if (error) throw error;
    return data || [];
}

export async function addAllergy(allergy: {
    pet_id: string;
    name: string;
    severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    reactions?: string;
}) {
    const { data, error } = await supabase
        .from('allergies')
        .insert(allergy)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Conditions
 */
export async function getConditions(petId: string) {
    const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .eq('pet_id', petId);

    if (error) throw error;
    return data || [];
}

export async function addCondition(condition: {
    pet_id: string;
    name: string;
    status?: 'Active' | 'Managed' | 'Resolved';
    diagnosed_date?: string;
    notes?: string;
}) {
    const { data, error } = await supabase
        .from('conditions')
        .insert(condition)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Health Metrics
 */
export async function getHealthMetrics(petId: string, type?: string) {
    let query = supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });

    if (type) {
        query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function addHealthMetric(metric: {
    pet_id: string;
    type: 'Weight' | 'Temperature' | 'HeartRate' | 'Other';
    value: number;
    unit: string;
    date?: string;
    notes?: string;
}) {
    const { data, error } = await supabase
        .from('health_metrics')
        .insert(metric)
        .select()
        .single();

    if (error) throw error;
    return data;
}
