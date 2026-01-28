import React, { useState, useEffect } from 'react';
import { Pet, VaccineRecord, Medication } from '../types';

interface AIInsightsWidgetProps {
    pet: Pet;
    healthScore: number;
    vaccines: VaccineRecord[];
    medications: Medication[];
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ pet, healthScore, vaccines, medications }) => {
    const [insights, setInsights] = useState<Array<{ title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }>>([]);

    useEffect(() => {
        generateInsights();
    }, [healthScore, vaccines, medications]);

    const generateInsights = () => {
        const newInsights: Array<{ title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }> = [];

        // Check vaccination status
        const overdueVaccines = vaccines.filter(v => v.status === 'Overdue');
        if (overdueVaccines.length > 0) {
            newInsights.push({
                title: 'Vaccination Overdue',
                message: `${pet.name} has ${overdueVaccines.length} overdue vaccine(s). Schedule a vet visit soon.`,
                priority: 'high',
                icon: 'warning'
            });
        }

        // Check active medications
        const activeMeds = medications.filter(m => m.active);
        if (activeMeds.length > 0) {
            newInsights.push({
                title: 'Active Medications',
                message: `Currently taking ${activeMeds.length} medication(s). Ensure consistent dosing.`,
                priority: 'medium',
                icon: 'medication'
            });
        }

        // Health score based insights
        if (healthScore < 60) {
            newInsights.push({
                title: 'Health Score Alert',
                message: 'Health records need attention. Update vaccinations and checkup history.',
                priority: 'high',
                icon: 'emergency'
            });
        } else if (healthScore >= 90) {
            newInsights.push({
                title: 'Excellent Care!',
                message: `${pet.name}'s health records are up-to-date. Keep up the great work! 🏆`,
                priority: 'low',
                icon: 'celebration'
            });
        }

        // Breed-specific tip (simplified)
        if (pet.breed) {
            newInsights.push({
                title: `${pet.breed} Care Tip`,
                message: `Regular exercise and mental stimulation are important for ${pet.breed}s.`,
                priority: 'low',
                icon: 'pets'
            });
        }

        setInsights(newInsights.slice(0, 3)); // Show top 3
    };

    return (
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-icons-round text-yellow-300">auto_awesome</span>
                <h3 className="text-lg font-bold">AI Insights</h3>
            </div>

            <div className="space-y-3">
                {insights.length > 0 ? (
                    insights.map((insight, i) => (
                        <div
                            key={i}
                            className={`bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all cursor-pointer ${insight.priority === 'high' ? 'ring-2 ring-yellow-300' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`material-icons-round text-2xl ${insight.priority === 'high' ? 'text-yellow-300' :
                                        insight.priority === 'medium' ? 'text-blue-200' :
                                            'text-green-200'
                                    }`}>
                                    {insight.icon}
                                </span>
                                <div className="flex-1">
                                    <p className="font-bold text-sm mb-1">{insight.title}</p>
                                    <p className="text-xs text-white/80 leading-relaxed">{insight.message}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-white/60 text-sm">
                        <p>All systems looking good! 👍</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsightsWidget;
