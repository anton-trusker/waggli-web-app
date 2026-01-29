
import React from 'react';

export const HealthMetricCard = ({ icon, label, value, subValue, color, trend }: any) => {
    const colorClasses: any = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', glow: 'group-hover:shadow-blue-500/20' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', glow: 'group-hover:shadow-purple-500/20' },
        red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', glow: 'group-hover:shadow-red-500/20' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', glow: 'group-hover:shadow-orange-500/20' },
    };
    const styles = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`group bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 ${styles.glow} transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <span className="material-icons-round text-2xl">{icon}</span>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${trend === 'up' ? 'bg-green-100 text-green-600' : trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        <span className="material-icons-round text-xs">{trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}</span>
                        {trend.toUpperCase()}
                    </div>
                )}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-500 transition-colors">{label}</p>
            <div className="flex items-baseline gap-1">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white transition-colors">{value}</p>
                {subValue && <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{subValue}</p>}
            </div>
        </div>
    );
};

export const RoutineItem = ({ title, time, status, urgent }: { title: string, time: string, status: string, urgent?: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${status === 'completed' ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 opacity-70' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-700'}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : urgent ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
            {status === 'completed' && <span className="material-icons-round text-xs">check</span>}
        </div>
        <div className="flex-1">
            <p className={`text-sm font-bold ${status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{title}</p>
            <p className="text-xs text-gray-500">{time}</p>
        </div>
        {urgent && !status.includes('completed') && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
    </div>
);

export const PassportField = ({ label, value, isEditing, onChange, fullWidth }: any) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        {isEditing ? (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
            />
        ) : (
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{value || '---'}</p>
        )}
    </div>
);
