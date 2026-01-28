import React from 'react';
import { Link } from 'react-router-dom';

interface SmartRemindersWidgetProps {
    petId: string;
}

const SmartRemindersWidget: React.FC<SmartRemindersWidgetProps> = ({ petId }) => {
    // Mock smart suggestions - in real app, this would be AI-generated based on health data
    const suggestions = [
        {
            title: 'Schedule Annual Checkup',
            description: 'Due for yearly wellness exam',
            action: 'Book Now',
            icon: 'calendar_today',
            color: 'bg-blue-500',
            link: '/appointments'
        },
        {
            title: 'Update Weight',
            description: 'Log weight for health tracking',
            action: 'Add Weight',
            icon: 'monitor_weight',
            color: 'bg-green-500',
            link: `/pet/${petId}/add-record`
        },
        {
            title: 'Medication Refill',
            description: 'Check prescription status',
            action: 'Review',
            icon: 'medication',
            color: 'bg-purple-500',
            link: `/pet/${petId}`
        }
    ];

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-primary">lightbulb</span>
                    Smart Suggestions
                </h3>
            </div>

            <div className="space-y-3">
                {suggestions.map((item, i) => (
                    <Link
                        key={i}
                        to={item.link}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                        <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-10 flex items-center justify-center shrink-0`}>
                            <span className={`material-icons-round text-lg ${item.color.replace('bg-', 'text-')}`}>
                                {item.icon}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.description}
                            </p>
                        </div>
                        <span className="material-icons-round text-gray-400 group-hover:text-primary transition-colors">
                            chevron_right
                        </span>
                    </Link>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                    to="/reminders"
                    className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1"
                >
                    View All Reminders
                    <span className="material-icons-round text-sm">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
};

export default SmartRemindersWidget;
