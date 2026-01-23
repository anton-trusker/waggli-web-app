
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
            const [u, p, c, pl] = await Promise.all([
                fetchAllUsers(),
                fetchAllProviders(),
                fetchCampaigns(),
                fetchPlans()
            ]);
            
            setUsers(u);
            setProviders(p);
            setCampaigns(c);
            setPlans(pl);

            // Calculate mock stats from real user count
            setStats({
                totalUsers: u.length,
                totalPets: u.length * 1.5, // Mock multiplier
                totalRevenue: u.length * 10,
                activeSubs: u.filter(user => user.plan !== 'Free').length
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
