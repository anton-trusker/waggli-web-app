
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

export interface CoOwner {
    id: string;
    pet_id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'active' | 'pending';
    profile?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
}

export interface Invitation {
    id: string;
    pet_id: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'pending' | 'accepted' | 'expired';
    created_at: string;
}

export const useSharing = (petId: string) => {
    const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!petId) return;
        setLoading(true);
        try {
            // Fetch Co-Owners with Profiles
            const { data: ownersData, error: ownersError } = await supabase
                .from('co_owners')
                .select(`
                    id, 
                    pet_id, 
                    user_id, 
                    role, 
                    status,
                    profiles:user_id (full_name, email, avatar_url)
                `)
                .eq('pet_id', petId);

            if (ownersError) throw ownersError;

            // Map data to simpler structure
            const mappedOwners = ownersData?.map((o: any) => ({
                ...o,
                profile: o.profiles
            })) || [];
            setCoOwners(mappedOwners);

            // Fetch Pending Invitations
            const { data: invitesData, error: invitesError } = await supabase
                .from('invitations')
                .select('*')
                .eq('pet_id', petId)
                .eq('status', 'pending');

            if (invitesError) throw invitesError;
            setInvitations(invitesData || []);

        } catch (err: any) {
            console.error('Error fetching sharing data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [petId]);

    const inviteUser = async (email: string, role: 'editor' | 'viewer' = 'editor') => {
        try {
            // 1. Create Invitation
            const { data, error } = await supabase
                .from('invitations')
                .insert({
                    pet_id: petId,
                    email,
                    role,
                    status: 'pending',
                    invited_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Refresh lists
            await fetchData();
            return data;
        } catch (err: any) {
            throw err;
        }
    };

    const removeOwner = async (ownerId: string) => {
        try {
            const { error } = await supabase
                .from('co_owners')
                .delete()
                .eq('id', ownerId);

            if (error) throw error;
            await fetchData();
        } catch (err: any) {
            throw err;
        }
    };

    const cancelInvitation = async (invitationId: string) => {
        try {
            const { error } = await supabase
                .from('invitations')
                .delete()
                .eq('id', invitationId);

            if (error) throw error;
            await fetchData();
        } catch (err: any) {
            throw err;
        }
    };

    return { coOwners, invitations, loading, error, inviteUser, removeOwner, cancelInvitation, refresh: fetchData };
};
