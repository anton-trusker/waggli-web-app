
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pet } from '../../types';
import { useApp } from '../../context/AppContext';
import { HealthMetricCard } from './Shared';
import { analyzeVaccineSchedule } from '../../services/gemini';

interface HealthRecordsTabProps {
    pet: Pet;
    onEditRecord: (type: 'vaccine' | 'medication' | 'activity', record: any) => void;
    onViewRecord: (type: string, data: any) => void;
}

const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({ pet, onEditRecord, onViewRecord }) => {
    const { vaccines, medications, activities, medicalVisits } = useApp();
    const [healthFilterType, setHealthFilterType] = useState('All');
    const [healthDateStart, setHealthDateStart] = useState('');
    const [healthDateEnd, setHealthDateEnd] = useState('');
    const [vaccineRecs, setVaccineRecs] = useState<any[]>([]);
    const [analyzingRecs, setAnalyzingRecs] = useState(false);

    const petVaccines = vaccines.filter(v => v.petId === pet.id);
    const petMedications = medications.filter(m => m.petId === pet.id);
    const petActivities = activities.filter(a => a.petId === pet.id);

    // AI Analysis
    useEffect(() => {
        const analyze = async () => {
            if (petVaccines.length > 0 && vaccineRecs.length === 0 && !analyzingRecs) {
                setAnalyzingRecs(true);
                const recs = await analyzeVaccineSchedule(petVaccines, pet);
                setVaccineRecs(recs);
                setAnalyzingRecs(false);
            }
        };
        analyze();
    }, [pet.id, petVaccines.length]);

    const timelineEvents = useMemo(() => {
        const events: any[] = [];
        const getDateObj = (d: string) => new Date(d);

        petVaccines.forEach(v => events.push({
            id: v.id, dataType: 'vaccine', data: v,
            rawDate: getDateObj(v.date), dateDisplay: v.date,
            title: `${v.type} Vaccination`,
            subtitle: `Manufacturer: ${v.manufacturer}`,
            type: 'Vaccination', icon: 'vaccines',
            bgClass: 'bg-green-100 dark:bg-green-900/20', colorClass: 'text-green-600 dark:text-green-400'
        }));

        petMedications.forEach(m => events.push({
            id: m.id, dataType: 'medication', data: m,
            rawDate: getDateObj(m.startDate), dateDisplay: m.startDate,
            title: `Started ${m.name}`,
            subtitle: `Dosage: ${m.frequency}`,
            type: 'Medication', icon: 'medication',
            bgClass: 'bg-blue-100 dark:bg-blue-900/20', colorClass: 'text-blue-600 dark:text-blue-400'
        }));

        // Medical visits are now from the top-level useApp() call
        const petCheckups = medicalVisits?.filter(v => v.petId === pet.id) || [];

        petCheckups.forEach(c => events.push({
            id: c.id, dataType: 'medical_visit', data: c,
            rawDate: getDateObj(c.date), dateDisplay: c.date,
            title: c.reason,
            subtitle: `Clinic: ${c.clinicName}. Diagnosis: ${c.diagnosis || 'None'}`,
            type: 'Checkup', icon: 'medical_services',
            bgClass: 'bg-purple-100 dark:bg-purple-900/20', colorClass: 'text-purple-600 dark:text-purple-400'
        }));

        petActivities.forEach(a => {
            // Filter out old checkups if migrating, or keep legacy. 
            // For now, keep everything but maybe distinguish visual
            if (a.type !== 'checkup') {
                events.push({
                    id: a.id, dataType: 'activity', data: a,
                    rawDate: getDateObj(a.date), dateDisplay: a.date,
                    title: a.title,
                    subtitle: a.description,
                    type: a.type === 'vitals' ? 'Vitals' : 'Note',
                    icon: a.icon || 'note',
                    bgClass: a.colorClass?.split(' ')[0] || 'bg-gray-100',
                    colorClass: a.colorClass?.split(' ')[1] || 'text-gray-600'
                })
            }
        });

        let filtered = events.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
        if (healthFilterType !== 'All') filtered = filtered.filter(e => e.type === healthFilterType);
        if (healthDateStart) filtered = filtered.filter(e => e.rawDate >= new Date(healthDateStart));
        if (healthDateEnd) filtered = filtered.filter(e => e.rawDate <= new Date(healthDateEnd));

        return filtered;
    }, [petVaccines, petMedications, petActivities, medicalVisits, healthFilterType, healthDateStart, healthDateEnd]);

    const ageValue = (pet.age || '').replace(/[^\d.]/g, '') || '0';
    const ageUnit = (pet.age || '').includes('m') ? 'mos' : 'yrs';

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <HealthMetricCard icon="monitor_weight" label="Weight" value={pet.weight} subValue="Stable" color="blue" trend="flat" />
                <HealthMetricCard icon="straighten" label="Height" value={pet.height || '--'} subValue={pet.height ? 'Last Recorded' : 'Not Set'} color="purple" trend="up" />
                <HealthMetricCard icon="bloodtype" label="Blood Type" value={pet.bloodType?.split(' ')[0] || '?'} subValue={pet.bloodType?.split(' ').slice(1).join(' ') || 'Unknown'} color="red" />
                <HealthMetricCard icon="calendar_month" label="Age" value={ageValue} subValue={ageUnit === 'yrs' ? 'Years Old' : 'Months Old'} color="orange" trend="up" />
            </div>

            {/* AI VACCINE RECOMMENDATIONS */}
            {petVaccines.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
                            <span className="material-icons-round text-indigo-500">health_and_safety</span> Vaccine Schedule Analysis
                        </h3>
                        {analyzingRecs ? (
                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-300 text-sm">
                                <span className="material-icons-round animate-spin">refresh</span> Analyzing {pet.name}'s history with AI...
                            </div>
                        ) : vaccineRecs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vaccineRecs.map((rec: any, idx: number) => (
                                    <div key={idx} className="bg-white/60 dark:bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-indigo-900 dark:text-indigo-100 text-sm">{rec.vaccine}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${rec.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                rec.status === 'Due Soon' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>{rec.status}</span>
                                        </div>
                                        <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">{rec.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-indigo-600 dark:text-indigo-300">AI analysis ready.</p>
                        )}
                    </div>
                </div>
            )}

            {/* VACCINES & MEDS GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-green-500">vaccines</span> Vaccinations
                        </h3>
                        <Link to={`/pet/${pet.id}/add-record`} className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">+ Add</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-400 font-bold">
                                <tr>
                                    <th className="px-6 py-4">Vaccine</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Next Due</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {petVaccines.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group cursor-pointer" onClick={() => onEditRecord('vaccine', v)}>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{v.type}</td>
                                        <td className="px-6 py-4 text-gray-500">{v.date}</td>
                                        <td className="px-6 py-4 text-gray-500">{v.expiryDate}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${v.status === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{v.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-blue-500">medication</span> Medications
                        </h3>
                        <Link to={`/pet/${pet.id}/add-record`} className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">+ Add</Link>
                    </div>
                    <div className="p-4 space-y-3">
                        {petMedications.map(m => (
                            <div key={m.id} className="flex items-center p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 bg-white dark:bg-white/5 transition-all cursor-pointer group" onClick={() => onEditRecord('medication', m)}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${m.active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <span className="material-icons-round text-2xl">pill</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{m.name}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{m.frequency} • {m.startDate} - {m.endDate || 'Ongoing'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TIMELINE */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><span className="material-icons-round">history_edu</span></div>
                        Medical Notes & Activity
                    </h3>
                    <div className="flex gap-3">
                        <select
                            value={healthFilterType}
                            onChange={(e) => setHealthFilterType(e.target.value)}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="All">All Types</option>
                            <option value="Vaccination">Vaccinations</option>
                            <option value="Medication">Medications</option>
                            <option value="Vitals">Vitals</option>
                            <option value="Checkup">Checkups</option>
                        </select>
                        <Link to={`/pet/${pet.id}/add-record`} className="text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-1.5 rounded-lg transition-colors flex items-center justify-center">+ Note</Link>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/5"></div>
                    <div className="space-y-8 relative">
                        {timelineEvents.map((event, idx) => (
                            <div key={idx} className="relative pl-16 md:pl-20 group">
                                <div className="absolute left-0 top-2 text-right w-12 md:w-14">
                                    <span className="block text-[11px] font-black text-gray-900 dark:text-white uppercase">{event.rawDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="block text-xl font-black text-primary leading-none">{event.rawDate.getDate()}</span>
                                    <span className="block text-[9px] font-bold text-gray-400 mt-0.5">{event.rawDate.getFullYear()}</span>
                                </div>
                                <div className={`absolute left-[30px] top-4 w-4 h-4 rounded-full border-[3px] border-white dark:border-surface-dark ${event.colorClass.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(0,0,0,0.1)] z-10 transition-transform group-hover:scale-150 duration-300 ring-2 ring-transparent group-hover:ring-primary/20`}></div>
                                <div
                                    onClick={() => onViewRecord(event.type, event)}
                                    className="bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden group/card"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${event.bgClass} opacity-0 group-hover/card:opacity-10 rounded-full blur-3xl -translate-y-16 translate-x-16 transition-opacity`}></div>

                                    <div className="flex items-start justify-between gap-6 relative z-10">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${event.bgClass} ${event.colorClass} transition-transform group-hover/card:rotate-6 duration-300`}>
                                                <span className="material-icons-round text-2xl">{event.icon}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg tracking-tight">{event.title}</h4>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${event.bgClass} ${event.colorClass}`}>{event.type}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">{event.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="material-icons-round text-gray-200 dark:text-gray-700 group-hover/card:text-primary transition-colors text-2xl">arrow_forward_ios</span>
                                            <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Details</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {timelineEvents.length === 0 && (
                            <div className="pl-20 py-12 text-center md:text-left">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-3xl mb-4 border border-dashed border-gray-200 dark:border-gray-800">
                                    <span className="material-icons-round text-gray-300 text-3xl">history</span>
                                </div>
                                <p className="text-gray-400 font-bold text-sm">No activity records found yet.</p>
                                <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Add your first medical note above</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthRecordsTab;
