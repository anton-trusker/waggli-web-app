
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';

const AdminProviders: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { providers, loading } = useAdmin();
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [search, setSearch] = useState('');

    const filteredProviders = providers.filter(p => {
        const matchType = filterType === 'All' || p.type === filterType;
        const matchStatus = filterStatus === 'All' || p.status === filterStatus;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.owner_name || '').toLowerCase().includes(search.toLowerCase());
        return matchType && matchStatus && matchSearch;
    });

    return (
        <>
            <Header onMenuClick={onMenuClick || (() => { })} title="Service Providers" />
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Providers</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{providers.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                            <span className="material-icons-round">storefront</span>
                        </div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Pending Review</p>
                            <p className="text-2xl font-bold text-orange-500">{providers.filter(p => p.status === 'Pending').length}</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl">
                            <span className="material-icons-round">pending_actions</span>
                        </div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Businesses</p>
                            <p className="text-2xl font-bold text-purple-500">{providers.filter(p => p.type === 'Business').length}</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                            <span className="material-icons-round">business</span>
                        </div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Individuals</p>
                            <p className="text-2xl font-bold text-green-500">{providers.filter(p => p.type === 'Individual').length}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                            <span className="material-icons-round">person</span>
                        </div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['All', 'Business', 'Individual'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterType === t ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                        <div className="w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        {['All', 'Pending', 'Verified'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterStatus === s ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search providers..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Provider Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Owner/Contact</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading providers...</td></tr>}
                                {!loading && filteredProviders.map(p => (
                                    <tr
                                        key={p.id}
                                        onClick={() => navigate(`/admin/providers/${p.id}`)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{p.name}</div>
                                            <div className="text-xs text-gray-500">Joined {new Date(p.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${p.type === 'Business' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                <span className="material-icons-round text-sm">{p.type === 'Business' ? 'business' : 'person'}</span>
                                                {p.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{p.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${p.status === 'Verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    p.status === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Verified' ? 'bg-green-500' : p.status === 'Pending' ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}></span>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white font-medium">{p.owner_name}</div>
                                            <div className="text-xs text-gray-500">{p.email || p.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {p.status === 'Pending' ? (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Approve this provider?')) {
                                                                    import('../../services/admin').then(({ verifyProvider }) => {
                                                                        verifyProvider(p.id, 'Verified');
                                                                        // Optimistic update would require Context refresh or local state update
                                                                        p.status = 'Verified'; // Hacky optimistic for demo
                                                                        p.isVerified = true;
                                                                    });
                                                                }
                                                            }}
                                                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                                                            title="Approve"
                                                        >
                                                            <span className="material-icons-round text-sm">check</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Reject this provider?')) {
                                                                    import('../../services/admin').then(({ verifyProvider }) => {
                                                                        verifyProvider(p.id, 'Rejected');
                                                                        p.status = 'Rejected';
                                                                    });
                                                                }
                                                            }}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                                                            title="Reject"
                                                        >
                                                            <span className="material-icons-round text-sm">close</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                        <span className="material-icons-round">chevron_right</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filteredProviders.length === 0 && (
                            <div className="p-12 text-center text-gray-400">No providers found matching your filters.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminProviders;
