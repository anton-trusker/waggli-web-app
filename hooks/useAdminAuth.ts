
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AdminRole } from '../types';

interface AdminContextType {
    isAdmin: boolean;
    role: AdminRole | null;
    can: (action: string) => boolean;
}

// Simple logic for mapped permissions
const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
    'super_admin': ['*'],
    'support': ['users.read', 'users.write', 'pets.read', 'pets.write'],
    'content': ['cms.read', 'cms.write', 'localization.write'],
    'finance': ['revenue.read', 'refunds.write'],
    'compliance': ['audit.read', 'users.read']
};

/**
 * Hook to check if the current user is an admin
 * Reads from user.roles array (e.g., ['admin', 'pet_owner'])
 */
export const useAdminAuth = (): AdminContextType => {
    const { user } = useApp();

    const isAdmin = useMemo(() => {
        return user?.roles?.includes('admin') || false;
    }, [user?.roles]);

    // Determine admin role level (if admin)
    // You can extend this to check for specific admin roles like 'super_admin', 'support', etc.
    const role = useMemo<AdminRole | null>(() => {
        if (!isAdmin) return null;

        const roles = (user?.roles || []) as string[];

        // Check for specific admin roles in priority order
        if (roles.includes('super_admin')) return 'super_admin';
        if (roles.includes('support')) return 'support';
        if (roles.includes('content')) return 'content';
        if (roles.includes('finance')) return 'finance';
        if (roles.includes('compliance')) return 'compliance';

        // Default to super_admin if just 'admin' is present
        return 'super_admin';
    }, [isAdmin, user?.roles]);

    const can = (action: string): boolean => {
        if (!isAdmin || !role) return false;
        if (role === 'super_admin') return true;

        const perms = ROLE_PERMISSIONS[role] || [];
        return perms.includes(action) || perms.includes('*');
    };

    return {
        isAdmin,
        role,
        can
    };
};
