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
                // Fetch for ALL target pets (single or multiple)
                const promises = targetPets.map(async (pet) => {
                    const existing = await fetchPetAIInsights(pet.id, 'ai_insight');
                    if (existing && existing.length > 0) {
                        return { ...existing[0], petName: pet.name, petId: pet.id };
                    }
                    // Fallback gen
                    const pVaccines = vaccines.filter(v => v.petId === pet.id);
                    const pMeds = medications.filter(m => m.petId === pet.id);
                    const result = await generateHealthCheck(pet, [...pVaccines, ...pMeds]);
                    return { metadata: result, date_recorded: new Date().toISOString(), result: result, petName: pet.name, petId: pet.id };
                });

                const results = await Promise.all(promises);
                // Sort by score (ascending - attention needed first) or date
                const validResults = results.filter(r => r).sort((a: any, b: any) => (a.metadata?.score || 100) - (b.metadata?.score || 100));
                setInsights(validResults);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [pets.length, petId, mode]);

    if (targetPets.length === 0) return null;

    const topInsight = insights.length > 0 ? insights[0] : null;
    const latest = topInsight?.metadata;

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <span className="material-icons-round text-xl">insights</span>
                        </div>
                        <h3 className="text-lg font-bold">Health Insights</h3>
                    </div>
                    {latest?.score && (
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-bold">{latest.score}</span>
                            <span className="text-[10px] uppercase font-bold text-indigo-200">
                                {insights.length > 1 ? `${topInsight.petName}'s Score` : 'Wellness Score'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Latest / Top Insight */}
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
                                <h4 className="font-bold text-sm mb-1 text-indigo-100 flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        {insights.length > 1 && <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] uppercase">{topInsight.petName}</span>}
                                        {latest?.title || 'Analysis'}
                                    </span>
                                    <span className="text-[10px] font-normal opacity-70">
                                        {topInsight ? new Date(topInsight.date_recorded).toLocaleDateString() : 'Just now'}
                                    </span>
                                </h4>
                                <p className="text-sm leading-relaxed text-indigo-50">
                                    {latest?.summary || latest?.explanation || "Analyzing recent health records..."}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Multi-Pet List (Aggregate Mode) */}
                    {mode === 'aggregate' && insights.length > 1 && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-indigo-200 uppercase mt-4 mb-2">Other Pets</p>
                            {insights.slice(1).map((item, idx) => (
                                <Link key={idx} to={`/pet/${item.petId}`} className="block bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/5 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-indigo-500/30 rounded text-[10px] font-bold uppercase">{item.petName}</span>
                                            <span className="text-xs font-bold text-indigo-200">{item.metadata?.title || 'Health Check'}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${(item.metadata?.score || 0) >= 80 ? 'text-green-300' : 'text-yellow-300'}`}>Score: {item.metadata?.score}</span>
                                    </div>
                                    <p className="text-xs text-indigo-100 line-clamp-1">{item.metadata?.summary}</p>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Single Pet History Toggle (Single Mode) */}
                    {mode === 'single' && insights.length > 1 && (
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full py-2 text-xs font-bold text-indigo-200 hover:text-white flex items-center justify-center gap-1 transition-colors"
                        >
                            {showHistory ? 'Hide History' : `View ${insights.length - 1} Previous Insights`}
                            <span className={`material-icons-round text-sm transform transition-transform ${showHistory ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                    )}

                    <div className="flex gap-2 mt-4">
                        <Link to={targetPets.length === 1 ? `/pet/${targetPets[0].id}/add-record` : '/appointments'} className="flex-1 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold text-center hover:bg-gray-50 transition-colors shadow-sm">
                            {targetPets.length === 1 ? 'Add Vitals Log' : 'Book Check-up'}
                        </Link>
                        {targetPets.length === 1 && (
                            <Link to={`/pet/${targetPets[0].id}`} className="px-4 py-2.5 bg-indigo-800/50 hover:bg-indigo-800/70 rounded-xl text-xs font-bold text-white transition-colors border border-indigo-400/30 flex items-center justify-center">
                                View Profile
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetInsights;
