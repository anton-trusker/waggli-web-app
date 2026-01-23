
import React, { useState } from 'react';

interface SegmentBuilderProps {
    onSave: (segment: any) => void;
    onCancel: () => void;
}

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [filters, setFilters] = useState({
        plan: [] as string[],
        breed: [] as string[],
        location: [] as string[],
        last_active: 30
    });

    const toggleFilter = (category: 'plan' | 'breed' | 'location', value: string) => {
        setFilters(prev => {
            const list = prev[category];
            if (list.includes(value)) return { ...prev, [category]: list.filter(i => i !== value) };
            return { ...prev, [category]: [...list, value] };
        });
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold mb-6">Create New Audience Segment</h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Segment Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                        placeholder="e.g. Premium Labrador Owners"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Activity */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Last Active (Days)</label>
                        <input
                            type="range"
                            min="1" max="365"
                            value={filters.last_active}
                            onChange={e => setFilters({ ...filters, last_active: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="text-right font-bold text-primary mt-1">{filters.last_active} days</div>
                    </div>

                    {/* Plans */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Subscription Plan</label>
                        <div className="flex flex-wrap gap-2">
                            {['Free', 'Premium', 'Family'].map(plan => (
                                <button
                                    key={plan}
                                    onClick={() => toggleFilter('plan', plan)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${filters.plan.includes(plan) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {plan}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Breeds (Mock list) */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Common Breeds</label>
                    <div className="flex flex-wrap gap-2">
                        {['Labrador', 'Golden Retriever', 'German Shepherd', 'Poodle', 'Bulldog', 'Beagle'].map(breed => (
                            <button
                                key={breed}
                                onClick={() => toggleFilter('breed', breed)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${filters.breed.includes(breed) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'}`}
                            >
                                {breed}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onCancel} className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button onClick={() => onSave({ name, filters, estimated_count: 1240 })} className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg">Save Segment</button>
                </div>
            </div>
        </div>
    );
};
