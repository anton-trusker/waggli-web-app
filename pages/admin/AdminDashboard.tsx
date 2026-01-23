
import React from 'react';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { logAdminAction } from '../../services/admin';
import { useEffect } from 'react';

interface AdminDashboardProps {
    onMenuClick?: () => void;
}

const StatCard = ({ title, value, subtext, icon, trend, color }: any) => (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color.bg} ${color.text}`}>
                <span className="material-icons-round text-2xl">{icon}</span>
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                    <span className="material-icons-round text-sm">{trend > 0 ? 'trending_up' : 'trending_down'}</span>
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
            <p className="text-xs text-gray-400">{subtext}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onMenuClick }) => {
    const { role, adminProfile } = useAdminAuth();
    const { stats, users, loading } = useAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        // Log dashboard access
        if (role) {
            logAdminAction('view_dashboard', 'system', 'admin_panel', { role });
        }
    }, [role]);

    return (
        <>
            <Header onMenuClick={onMenuClick || (() => { })} title={`Admin Dashboard (${role?.replace('_', ' ')?.toUpperCase() || ''})`} />
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={loading ? '...' : stats.totalUsers.toLocaleString()}
                        subtext={`${(stats.trends?.userGrowth || 0) >= 0 ? '+' : ''}${stats.trends?.userGrowth || 0}% this week`}
                        icon="people"
                        trend={stats.trends?.userGrowth || 0}
                        color={{ bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }}
                    />
                    <StatCard
                        title="Total Pets"
                        value={loading ? '...' : stats.totalPets.toLocaleString()}
                        subtext={`Avg ${stats.avgPetsPerUser || '0.0'} pets per user`}
                        icon="pets"
                        trend={stats.trends?.petGrowth || 0}
                        color={{ bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' }}
                    />
                    <StatCard
                        title="Revenue (MRR)"
                        value={loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
                        subtext={`${(stats.trends?.revenueGrowth || 0) >= 0 ? '+' : ''}${stats.trends?.revenueGrowth || 0}% growth`}
                        icon="payments"
                        trend={stats.trends?.revenueGrowth || 0}
                        color={{ bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' }}
                    />
                    <StatCard
                        title="Active Subscriptions"
                        value={loading ? '...' : stats.activeSubs.toLocaleString()}
                        subtext={`${(stats.trends?.subGrowth || 0) >= 0 ? '+' : ''}${stats.trends?.subGrowth || 0}% this week`}
                        icon="verified"
                        trend={stats.trends?.subGrowth || 0}
                        color={{ bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Activity / Signups */}
                    <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Signups</h3>
                            <button onClick={() => navigate('/admin/users')} className="text-sm text-primary font-bold hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="pb-3 pl-2">User</th>
                                        <th className="pb-3">Plan</th>
                                        <th className="pb-3">Joined</th>
                                        <th className="pb-3 text-right pr-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {users.slice(0, 5).map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/users/${u.id}`)}>
                                            <td className="py-3 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} className="w-full h-full object-cover" alt="User" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{u.full_name?.charAt(0) || 'U'}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{u.full_name || 'Unknown User'}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-gray-600 dark:text-gray-300">{u.plan}</td>
                                            <td className="py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 text-right pr-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions / System Health */}
                    <div className="space-y-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Health</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-gray-500">Server Load</span>
                                        <span className="text-green-500">Normal (24%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[24%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-gray-500">AI Token Usage</span>
                                        <span className="text-blue-500">High (82%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[82%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pending Tasks</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <span className="material-icons-round text-orange-500">report_problem</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Reports</p>
                                        <p className="text-xs text-gray-500">0 pending</p>
                                    </div>
                                    <button className="text-xs font-bold text-primary hover:underline">Review</button>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <span className="material-icons-round text-blue-500">verified</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Verifications</p>
                                        <p className="text-xs text-gray-500">Check Providers</p>
                                    </div>
                                    <button onClick={() => navigate('/admin/providers')} className="text-xs font-bold text-primary hover:underline">Check</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
