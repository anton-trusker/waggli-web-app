
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminRoutes: React.FC = () => {
    const { isAdmin, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) {
        // Redirect non-admins to dashboard
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoutes;
