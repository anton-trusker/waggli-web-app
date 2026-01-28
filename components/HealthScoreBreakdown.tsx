import React from 'react';

interface HealthScoreBreakdownProps {
    breakdown: {
        preventiveCare: number;
        vaccination: number;
        weight: number;
        dataCompleteness: number;
        recentWellness: number;
        decayFactor: number;
    };
}

const HealthScoreBreakdown: React.FC<HealthScoreBreakdownProps> = ({ breakdown }) => {
    const categories = [
        {
            name: 'Preventive Care',
            score: breakdown.preventiveCare,
            weight: '30%',
            icon: 'medical_services',
            color: 'bg-blue-500',
            description: 'Annual checkup status'
        },
        {
            name: 'Vaccination',
            score: breakdown.vaccination,
            weight: '25%',
            icon: 'vaccines',
            color: 'bg-green-500',
            description: 'Core vaccines valid'
        },
        {
            name: 'Weight Tracking',
            score: breakdown.weight,
            weight: '20%',
            icon: 'monitor_weight',
            color: 'bg-purple-500',
            description: 'Recent weight logs'
        },
        {
            name: 'Data Complete',
            score: breakdown.dataCompleteness,
            weight: '15%',
            icon: 'fact_check',
            color: 'bg-orange-500',
            description: 'Profile completeness'
        },
        {
            name: 'Active Tracking',
            score: breakdown.recentWellness,
            weight: '10%',
            icon: 'timeline',
            color: 'bg-pink-500',
            description: 'Recent activity logs'
        }
    ];

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary">analytics</span>
                        Health Score Breakdown
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Activity Factor: {Math.round(breakdown.decayFactor * 100)}%
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {categories.map((category, i) => (
                    <div key={i} className="group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${category.color} bg-opacity-10 flex items-center justify-center`}>
                                    <span className={`material-icons-round text-sm ${category.color.replace('bg-', 'text-')}`}>
                                        {category.icon}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {category.name}
                                    </p>
                                    <p className="text-xs text-gray-400">{category.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {Math.round(category.score)}%
                                </p>
                                <p className="text-xs text-gray-400">{category.weight} weight</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${category.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${category.score}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HealthScoreBreakdown;
