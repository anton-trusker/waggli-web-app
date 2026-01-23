import React from 'react';
import Header from '../../components/Header';
import { useApp } from '../../context/AppContext';

const ProviderDashboard = () => {
    const { providerProfile } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <div className="flex justify-between items-center bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Provider Dashboard</h1>
                        <p className="text-gray-500">Welcome back, {providerProfile?.name || 'Partner'}</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover">
                            + New Appointment
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Today's Appointments</h3>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">8</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Pending Requests</h3>
                        <p className="text-4xl font-bold text-orange-500">3</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Total Revenue (Month)</h3>
                        <p className="text-4xl font-bold text-green-500">$2,450</p>
                    </div>
                </div>

                {/* Calendar / List View Stubs */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm min-h-[400px] flex items-center justify-center text-gray-400">
                    Chart / Calendar Component Placeholder
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
