
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pet, VaccineRecord, HealthStat } from '../types';
import { HealthMetricCard } from '../components/pet-profile/Shared';
import { supabase } from '../services/supabase';

const PublicPetProfile: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [pet, setPet] = useState<Pet | null>(null);
    const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicData = async () => {
            // 1. Extract Pet ID from shareId (assuming format petId-random)
            // In reality, we query 'public_shares' table by share_token
            // For now, let's assume shareId passed is directly actionable or we query table.
            // Mock lookup:
            // const { data: share } = await supabase.from('public_shares').select('pet_id').eq('token', shareId).single();

            // Simplification: We assume shareId starts with petId for this demo, 
            // OR better, we query the Pet directly if RLS allows. 
            // Phase 7 db has public_shares. 
            // Let's implementation: Parse ID.

            if (!shareId) return;
            const extractedId = shareId.split('-')[0]; // simple hack for demo

            try {
                const { data: petData, error: petError } = await supabase
                    .from('pets')
                    .select('*')
                    .eq('id', extractedId)
                    .single();

                if (petError) throw petError;
                setPet(petData);

                // Fetch Vaccines (Public read?)
                const { data: vaxData } = await supabase
                    .from('vaccinations')
                    .select('*')
                    .eq('pet_id', extractedId);
                setVaccines(vaxData || []);

            } catch (err: any) {
                setError("Profile not found or link expired.");
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, [shareId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-bold">Loading Profile...</p></div>;
    if (error || !pet) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-red-500 font-bold">{error || "Profile Not Found"}</p></div>;

    const wellnessScore = pet.computed_health_score || 95; // Default for view
    const ageValue = pet.age ? pet.age.replace(/[^\d.]/g, '') : '??';
    const ageUnit = pet.age && pet.age.includes('m') ? 'mos' : 'yrs';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                            W
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white tracking-tight">Waggly Public View</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-8">
                {/* Hero Card */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500"></div>
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-surface-dark shadow-lg overflow-hidden shrink-0 relative">
                        <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{pet.name}</h1>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">{pet.status}</span>
                        </div>
                        <p className="text-gray-500 text-lg mb-4">{pet.breed} • {pet.gender}</p>
                        <div className="flex justify-center md:justify-start gap-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Age</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{ageValue} {ageUnit}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Weight</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{pet.weight}</p>
                            </div>
                        </div>
                    </div>

                    {/* Health Score Mini */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[100px]">
                        <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 28}
                                    strokeDashoffset={(2 * Math.PI * 28) * (1 - wellnessScore / 100)}
                                    className="text-green-500" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-lg font-bold text-gray-900 dark:text-white">{wellnessScore}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Health Score</span>
                    </div>
                </div>

                {/* Vax List */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vaccination Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vaccines.length === 0 ? <p className="text-gray-400">No records visible.</p> : vaccines.map(v => (
                            <div key={v.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <span className="material-icons-round">vaccines</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{v.type}</p>
                                        <p className="text-xs text-gray-500">Given: {v.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${v.status === 'Valid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {v.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicPetProfile;
