
import { supabase } from "./supabase";
import { AdminRole, AdminProfile, AuditLogEntry } from "../types";

// --- ADMIN PROFILE & RBAC ---

export const getAdminProfile = async (userId: string): Promise<AdminProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // Ignore error if just not found (not an admin)
            if (error.code !== 'PGRST116') console.error("Error fetching admin profile:", error);
            return null;
        }
        return data as AdminProfile;
    } catch (e) {
        return null;
    }
};

export const hasAdminPermission = (role: AdminRole, requiredRole: AdminRole): boolean => {
    const hierarchy: Record<AdminRole, number> = {
        'super_admin': 100,
        'support': 50,
        'finance': 40,
        'content': 30,
        'compliance': 20
    };

    return (hierarchy[role] || 0) >= (hierarchy[requiredRole] || 0);
};

// --- AUDIT LOGGING ---

export const logAdminAction = async (
    action: string,
    targetType: string,
    targetId?: string,
    metadata?: any
) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const entry = {
            admin_id: user.id,
            action,
            target_type: targetType,
            target_id: targetId,
            metadata,
            ip_address: '0.0.0.0' // Client-side limitation; ideally captured by Edge Function or RLS
        };

        const { error } = await supabase
            .from('admin_audit_log')
            .insert(entry);

        if (error) console.error("Audit Log Error:", error);
    } catch (e) {
        console.error("Audit Log Exception:", e);
    }
};

export const fetchAuditLogs = async (limit = 50): Promise<AuditLogEntry[]> => {
    try {
        const { data, error } = await supabase
            .from('admin_audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as AuditLogEntry[];
    } catch (e) {
        console.error("Fetch Audit Logs Failed", e);
        return [];
    }
};

// --- USER MANAGEMENT (ADMIN) ---

// Impersonate would typically happen via an Edge Function returning a signed JWT
// For now, we'll placeholder the service call
export const impersonateUser = async (targetUserId: string) => {
    try {
        // 1. Try to call the Edge Function (Production Path)
        const { data, error } = await supabase.functions.invoke('admin-impersonate', {
            body: { target_user_id: targetUserId }
        });

        if (error) {
            // Function mismatch/missing in dev is common, treat as fallback trigger
            throw error;
        }

        return data.impersonation_url;
    } catch (e: any) {
        // 2. Dev Mode Fallback
        console.warn("Impersonation Edge Function failed (likely not deployed). Using Dev Mode.", e);
        return window.location.origin;
    }
};

// --- MODERATION ---

export const banUser = async (userId: string, type: 'shadowban' | 'suspension' | 'hard_ban', reason: string, userFacingReason?: string, expiresAt?: Date) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Create moderation record
        const { error: modError } = await supabase
            .from('user_moderation')
            .insert({
                user_id: userId,
                type,
                reason_internal: reason,
                reason_user_facing: userFacingReason,
                expires_at: expiresAt?.toISOString(),
                created_by: user?.id
            });

        if (modError) throw modError;

        // 2. Update user status in public.users table
        const statusMap = {
            'shadowban': 'Shadowbanned',
            'suspension': 'Suspended',
            'hard_ban': 'Banned'
        };

        const { error: userError } = await supabase
            .from('users')
            .update({ status: statusMap[type] })
            .eq('id', userId);

        if (userError) throw userError;

        // 3. Log it
        await logAdminAction('ban_user', 'user', userId, { type, reason });

        return true;
    } catch (e) {
        console.error("Ban User Failed", e);
        throw e;
    }
};

// --- PROVIDER VERIFICATION ---

export const verifyProvider = async (providerId: string, status: 'Verified' | 'Rejected', notes?: string) => {
    try {
        const { error } = await supabase
            .from('service_providers')
            .update({
                status: status,
                is_verified: status === 'Verified'
            })
            .eq('id', providerId);

        if (error) throw error;

        // Log it
        await logAdminAction('verify_provider', 'provider', providerId, { status, notes });

        return true;
    } catch (e) {
        console.error("Provider Verification Failed", e);
        throw e;
    }
};
