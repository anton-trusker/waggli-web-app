
import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../../services/admin';
import { AuditLogEntry } from '../../types';

export const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLogs = async () => {
        setLoading(true);
        const data = await fetchAuditLogs(50);
        setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString();
    };

    const getActionColor = (action: string) => {
        if (action.includes('delete') || action.includes('ban')) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
        if (action.includes('create') || action.includes('add')) return 'text-green-500 bg-green-50 dark:bg-green-900/20';
        if (action.includes('update') || action.includes('edit')) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Audit Logs</h3>
                    <p className="text-sm text-gray-500">Recent administrative actions</p>
                </div>
                <button
                    onClick={loadLogs}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Refresh Logs"
                >
                    <span className={`material-icons-round ${loading ? 'animate-spin' : ''}`}>refresh</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase font-bold text-gray-500">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-xl">Time</th>
                            <th className="px-4 py-3">Admin</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Target</th>
                            <th className="px-4 py-3 rounded-tr-xl">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading && logs.length === 0 ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-4 py-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                    </td>
                                </tr>
                            ))
                        ) : logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                                    {formatDate(log.created_at)}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            A
                                        </div>
                                        <span className="truncate max-w-[100px]" title={log.admin_id}>{log.admin_id.substring(0, 8)}...</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-xs uppercase text-gray-400">{log.target_type}</span>
                                        <span className="font-mono text-xs">{log.target_id ? log.target_id.substring(0, 8) + '...' : '-'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate" title={JSON.stringify(log.metadata, null, 2)}>
                                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!loading && logs.length === 0 && (
                    <div className="py-12 text-center text-gray-400">
                        <span className="material-icons-round text-4xl mb-2 opacity-50">history</span>
                        <p>No audit logs found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
