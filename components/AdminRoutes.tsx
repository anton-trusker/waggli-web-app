
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminRoutes: React.FC = () => {
    const { isAdmin } = useAdminAuth();

    if (!isAdmin) {
        // Redirect non-admins to dashboard
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoutes;
