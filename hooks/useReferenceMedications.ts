
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface ReferenceMedication {
    id: string;
    name: string;
    category: 'Flea/Tick' | 'Heartworm' | 'Dewormer' | 'Other';
    description?: string;
    species_id?: string;
    default_frequency?: string;
}

export const useReferenceMedications = (speciesId?: string) => {
    const [medications, setMedications] = useState<ReferenceMedication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeds = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('reference_medications')
                    .select('*')
                    .order('name');

                if (speciesId) {
                    query = query.eq('species_id', speciesId);
                }

                const { data, error } = await query;

                if (error) throw error;
                setMedications(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMeds();
    }, [speciesId]);

    return { medications, loading, error };
};
