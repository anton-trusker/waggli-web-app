
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface CoatColor {
    id: string;
    name: string;
    hex_code?: string;
}

export const useColors = () => {
    const [colors, setColors] = useState<CoatColor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const { data, error } = await supabase
                    .from('colors')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;
                setColors(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchColors();
    }, []);

    return { colors, loading, error };
};
