
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface Species {
    id: string;
    code: string;
    name_key: string;
    icon_emoji: string;
}

export const useSpecies = () => {
    const [species, setSpecies] = useState<Species[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const { data, error } = await supabase
                    .from('species')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order');

                if (error) throw error;
                setSpecies(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecies();
    }, []);

    return { species, loading, error };
};
