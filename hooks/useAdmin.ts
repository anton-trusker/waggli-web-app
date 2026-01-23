
import { useState, useEffect, useCallback } from 'react';
import {
    fetchAllUsers,
    fetchAllProviders,
    fetchCampaigns,
    fetchPlans,
    updateUserStatus,
    deleteUserAccount,
    updateProviderVerification,
    saveCampaignDB,
    savePlanDB
} from '../services/db';
import { User, ServiceProvider, MarketingCampaign, SubscriptionPlan } from '../types';

export const useAdmin = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPets: 0,
        totalRevenue: 0,
        activeSubs: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [u, p, c, pl, pets, trends] = await Promise.all([
                fetchAllUsers(),
                fetchAllProviders(),
                fetchCampaigns(),
                fetchPlans(),
                (async () => {
                    const { fetchAllPets } = await import('../services/db');
                    return fetchAllPets();
                })(),
                (async () => {
                    const { getTrends } = await import('../services/db');
                    return getTrends();
                })()
            ]);

            setUsers(u);
            setProviders(p);
            setCampaigns(c);
            setPlans(pl);

            // Calculate real stats using actual data
            const { calculateAdminStats } = await import('../services/db');
            const realStats = await calculateAdminStats(u, pets);

            setStats({
                ...realStats,
                trends
            });

        } catch (error) {
            console.error("Admin fetch error", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateUserStatus = async (id: string, status: any) => {
        await updateUserStatus(id, status);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u) as any);
    };

    const handleDeleteUser = async (id: string) => {
        await deleteUserAccount(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const handleUpdateProviderStatus = async (id: string, status: any) => {
        await updateProviderVerification(id, status);
        setProviders(prev => prev.map(p => p.id === id ? { ...p, status } : p) as any);
    };

    return {
        users, providers, campaigns, plans, stats, loading,
        updateUserStatus: handleUpdateUserStatus,
        deleteUser: handleDeleteUser,
        updateProviderStatus: handleUpdateProviderStatus,
        saveCampaign: saveCampaignDB,
        savePlan: savePlanDB,
        refetch: fetchData
    };
};
