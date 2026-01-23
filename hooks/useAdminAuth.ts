
import { useState, useEffect, useContext, createContext } from 'react';
import { useApp } from '../context/AppContext';
import { getAdminProfile, hasAdminPermission } from '../services/admin';
import { AdminProfile, AdminRole } from '../types';

interface AdminContextType {
    adminProfile: AdminProfile | null;
    isAdmin: boolean;
    role: AdminRole | null;
    loading: boolean;
    can: (action: string) => boolean; // Helper for permissions
}

// Simple logic for mapped permissions
const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
    'super_admin': ['*'],
    'support': ['users.read', 'users.write', 'pets.read', 'pets.write'],
    'content': ['cms.read', 'cms.write', 'localization.write'],
    'finance': ['revenue.read', 'refunds.write'],
    'compliance': ['audit.read', 'users.read']
};

export const useAdminAuth = () => {
    const { user } = useApp();
    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.id) {
            setAdminProfile(null);
            setLoading(false);
            return;
        }

        const loadProfile = async () => {
            const profile = await getAdminProfile(user.id);
            setAdminProfile(profile);
            setLoading(false);
        };

        loadProfile();
    }, [user]);

    const can = (action: string): boolean => {
        if (!adminProfile) return false;
        if (adminProfile.role === 'super_admin') return true;

        const perms = ROLE_PERMISSIONS[adminProfile.role] || [];
        return perms.includes(action) || perms.includes('*');
    };

    return {
        adminProfile,
        isAdmin: !!adminProfile,
        role: adminProfile?.role || null,
        loading,
        can
    };
};
