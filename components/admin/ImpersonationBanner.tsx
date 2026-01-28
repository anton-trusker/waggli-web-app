
import React from 'react';
import { useApp } from '../../context/AppContext';

export const ImpersonationBanner: React.FC = () => {
    // In a real implementation, we'd detect this via a cookie or local storage flag set during the impersonation flow
    // For now, we'll check a sessionStorage flag
    const isImpersonating = sessionStorage.getItem('waggly_impersonating') === 'true';
    const adminId = sessionStorage.getItem('waggly_admin_id');
    const { user, logout } = useApp();

    if (!isImpersonating) return null;

    const handleStopImpersonating = async () => {
        // 1. Logout of user session
        await logout();

        // 2. Clear flags
        sessionStorage.removeItem('waggly_impersonating');
        sessionStorage.removeItem('waggly_admin_id');

        // 3. Ideally re-login as admin, but for now we redirect to login
        // In a perfect world, we'd store the admin token in memory and restore it.
        window.location.href = '/login?role=admin_cleanup';
    };

    return (
        <div className="bg-orange-600 text-white px-4 py-2 flex justify-between items-center shadow-md relative z-[100]">
            <div className="flex items-center gap-2">
                <span className="material-icons-round animate-pulse">visibility</span>
                <span className="font-bold text-sm">
                    You are impersonating {user?.name || user?.email}
                </span>
            </div>
            <button
                onClick={handleStopImpersonating}
                className="bg-white text-orange-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-orange-50 transition-colors uppercase"
            >
                Stop Impersonating
            </button>
        </div>
    );
};
