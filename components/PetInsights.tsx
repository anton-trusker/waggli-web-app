import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateHealthCheck } from '../services/gemini';
import { Link } from 'react-router-dom';

interface PetInsightsProps {
    mode: 'aggregate' | 'single';
    petId?: string;
}

const PetInsights: React.FC<PetInsightsProps> = ({ mode, petId }) => {
    const { pets, vaccines, medications, fetchPetAIInsights } = useApp();
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const targetPets = petId ? pets.filter(p => p.id === petId) : pets;

    useEffect(() => {
        const fetchInsight = async () => {
            if (targetPets.length === 0) return;
            setLoading(true);
            try {
                // 1. Try to fetch existing insights from DB
                const existing = await fetchPetAIInsights(targetPets[0].id, 'ai_insight');
                if (existing && existing.length > 0) {
                    setInsights(existing);
                    setLoading(false);
                    return;
                }

                // 2. Fallback to generating new one if none found (only if no existing history)
                if (mode === 'single' || mode === 'aggregate') {
                    const result = await generateHealthCheck(targetPets[0], [...vaccines, ...medications]);
                    // Wrap in standard DB format structure for consistency in UI
                    setInsights([{ metadata: result, date_recorded: new Date().toISOString() }]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [pets.length, petId, mode]);

    if (targetPets.length === 0) return null;

    const latest = insights.length > 0 ? insights[0].metadata : null;

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <span className="material-icons-round text-xl">insights</span>
                        </div>
                        <h3 className="text-lg font-bold">AI Health Insights</h3>
                    </div>
                    {latest?.score && (
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-bold">{latest.score}</span>
                            <span className="text-[10px] uppercase font-bold text-indigo-200">Wellness Score</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Latest Insight */}
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
                                <h4 className="font-bold text-sm mb-1 text-indigo-100 flex justify-between">
                                    {latest?.title || 'Analysis'}
                                    <span className="text-[10px] font-normal opacity-70">
                                        {insights.length > 0 ? new Date(insights[0].date_recorded).toLocaleDateString() : 'Just now'}
                                    </span>
                                </h4>
                                <p className="text-sm leading-relaxed text-indigo-50">
                                    {latest?.summary || latest?.explanation || "Analyzing recent health records to provide personalized insights..."}
                                </p>
                            </>
                        )}
                    </div>

                    {/* History Toggle */}
                    {insights.length > 1 && (
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full py-2 text-xs font-bold text-indigo-200 hover:text-white flex items-center justify-center gap-1 transition-colors"
                        >
                            {showHistory ? 'Hide History' : `View ${insights.length - 1} Previous Insights`}
                            <span className={`material-icons-round text-sm transform transition-transform ${showHistory ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                    )}

                    {/* History List */}
                    {showHistory && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            {insights.slice(1).map((item, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-indigo-200">{item.metadata?.title || 'Health Check'}</span>
                                        <span className="text-[10px] text-indigo-300">{new Date(item.date_recorded).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-indigo-100 line-clamp-2">{item.metadata?.summary || item.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Link to={`/pet/${targetPets[0].id}/add-record`} className="flex-1 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold text-center hover:bg-gray-50 transition-colors shadow-sm">
                            Add Vitals Log
                        </Link>
                        <Link to={`/pet/${targetPets[0].id}`} className="px-4 py-2.5 bg-indigo-800/50 hover:bg-indigo-800/70 rounded-xl text-xs font-bold text-white transition-colors border border-indigo-400/30 flex items-center justify-center">
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetInsights;
