
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface Breed {
    id: string;
    name: string;
    species_id: string;
    size_category?: string;
    temperament?: string[];
}

export const useBreeds = (speciesId?: string, searchTerm?: string) => {
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBreeds = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('breeds')
                    .select('id, name, species_id, size_category, temperament')
                    .order('name');

                if (speciesId) {
                    query = query.eq('species_id', speciesId);
                }

                if (searchTerm) {
                    query = query.ilike('name', `%${searchTerm}%`);
                }

                const { data, error } = await query.limit(50);

                if (error) throw error;
                setBreeds(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBreeds();
    }, [speciesId, searchTerm]);

    return { breeds, loading, error };
};
