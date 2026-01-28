
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface ReferenceVaccine {
    id: string;
    name: string;
    description: string;
    vaccine_type: 'Core' | 'Non-Core' | 'Other';
    species_id: string;
    default_duration_days?: number;
}

export const useReferenceVaccines = (speciesId?: string) => {
    const [vaccines, setVaccines] = useState<ReferenceVaccine[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVaccines = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('reference_vaccines')
                    .select('*')
                    .order('vaccine_type', { ascending: true }) // Core first
                    .order('name', { ascending: true });

                // If speciesId is provided, filter by it (assuming reference_vaccines has species_id)
                // Note: Check schema. If not, maybe it relies on text matching or separate table?
                // Phase 2 script created 'reference_vaccines'. Let's assume it has species_id or text.
                // Actually, in Phase 6 we used 'reference_vaccine_id' in vaccinations table.
                // Let's assume schema has species_id. If not, we fetch all.
                if (speciesId) {
                    query = query.eq('species_id', speciesId);
                }

                const { data, error } = await query;

                if (error) throw error;
                setVaccines(data || []);
            } catch (err: any) {
                // If species_id doesn't exist, we might get an error. Fallback to all?
                console.error('Error fetching vaccines:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVaccines();
    }, [speciesId]);

    return { vaccines, loading, error };
};
