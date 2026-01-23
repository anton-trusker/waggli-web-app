import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateHealthCheck } from '../services/gemini';
import { Link } from 'react-router-dom';

interface PetInsightsProps {
    mode: 'aggregate' | 'single';
    petId?: string;
}

const PetInsights: React.FC<PetInsightsProps> = ({ mode, petId }) => {
    const { pets, vaccines, medications } = useApp();
    const [insight, setInsight] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const targetPets = petId ? pets.filter(p => p.id === petId) : pets;

    useEffect(() => {
        const fetchInsight = async () => {
            if (targetPets.length === 0) return;
            setLoading(true);
            try {
                // For aggregate, we might just analyze the first pet or summarize all
                // This is a simplified reconstruction
                const result = await generateHealthCheck(targetPets[0], [...vaccines, ...medications]);
                setInsight(result);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [pets.length, petId]); // naive dependency

    if (targetPets.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <span className="material-icons-round text-xl">insights</span>
                        </div>
                        <h3 className="text-lg font-bold">AI Health Insights</h3>
                    </div>
                    {insight?.score && (
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-bold">{insight.score}</span>
                            <span className="text-[10px] uppercase font-bold text-indigo-200">Wellness Score</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        {loading ? (
                            <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h4 className="font-bold text-sm mb-1 text-indigo-100">Analysis</h4>
                                <p className="text-sm leading-relaxed text-indigo-50">
                                    {insight?.summary || "Analyzing recent health records to provide personalized insights..."}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Link to={`/pet/${targetPets[0].id}/add-record`} className="flex-1 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold text-center hover:bg-gray-50 transition-colors shadow-sm">
                            Add Vitals Log
                        </Link>
                        <button onClick={() => { }} className="px-4 py-2.5 bg-indigo-800/50 hover:bg-indigo-800/70 rounded-xl text-xs font-bold text-white transition-colors border border-indigo-400/30">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetInsights;
