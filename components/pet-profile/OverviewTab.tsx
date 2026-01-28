
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pet, Appointment, VaccineRecord, Medication } from '../../types';
import { useApp } from '../../context/AppContext';
import PetInsights from '../PetInsights';
import { HealthMetricCard, RoutineItem } from './Shared';

interface OverviewTabProps {
    pet: Pet;
    onCheckSymptoms: () => void;
    setActiveTab: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ pet, onCheckSymptoms, setActiveTab }) => {
    const { vaccines, medications, appointments, fetchPetAIInsights, reminders, updateReminder, notifications } = useApp();
    const navigate = useNavigate();
    const [news, setNews] = React.useState<any[]>([]);

    React.useEffect(() => {
        const loadNews = async () => {
            const data = await fetchPetAIInsights(pet.id, 'ai_news');
            if (data && data.length > 0) {
                setNews(data[0].metadata.items || []);
            }
        };
        loadNews();
    }, [pet.id]);

    const petVaccines = vaccines.filter(v => v.petId === pet.id);
    const petMedications = medications.filter(m => m.petId === pet.id);
    const petAppointments = appointments.filter(a => a.petId === pet.id);

    const overdueVaccines = petVaccines.filter(v => v.status === 'Overdue');
    const expiringVaccines = petVaccines.filter(v => v.status === 'Expiring Soon');
    const activeMeds = petMedications.filter(m => m.active);

    // Gap Analysis Alerts (High Priority)
    const gapAlerts = notifications.filter(n => n.type === 'gap' && n.userId === pet.ownerId); // Assuming notification has pet context or we filter by user for now. 
    // Types need update to link notification to pet, but for now assuming user context fits single pet or we filter.
    // Actually notificationGenerator creates for ownerId. If multi-pet, it's global.
    // For specific pet gaps, the title usually contains pet name. A better way is filtering by actionPath containing pet ID if possible.
    const petGapAlerts = gapAlerts.filter(n => n.actionPath?.includes(pet.id));

    // Calculate Wellness Score
    let wellnessScore = pet.computed_health_score ?? 100;

    // Fallback logic if 0 or undefined (optional, or just trust DB)
    if (wellnessScore === 0 && !pet.computed_health_score) {
        wellnessScore = 100;
        if (pet.status !== 'Healthy') wellnessScore -= 20;
        wellnessScore -= (overdueVaccines.length * 15);
        wellnessScore -= (expiringVaccines.length * 5);
        if (wellnessScore < 0) wellnessScore = 0;
    }

    const ageValue = (pet.age || '').replace(/[^\d.]/g, '') || '0';
    const ageUnit = (pet.age || '').includes('m') ? 'mos' : 'yrs';

    // Simple events for recent history
    const recentEvents = [
        ...petVaccines.map(v => ({ title: `${v.type} Vax`, date: v.date, icon: 'vaccines', bg: 'bg-green-100', color: 'text-green-600' })),
        ...petAppointments.map(a => ({ title: a.title, date: a.date, icon: 'event', bg: 'bg-purple-100', color: 'text-purple-600' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wellness Score Card */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-surface-dark dark:to-gray-800/50 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-800 relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                    <div className="relative w-36 h-36 flex items-center justify-center mb-4 mt-2">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                            <circle
                                cx="72" cy="72" r="60"
                                stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={2 * Math.PI * 60}
                                strokeDashoffset={(2 * Math.PI * 60) * (1 - wellnessScore / 100)}
                                strokeLinecap="round"
                                className={`${wellnessScore > 80 ? 'text-yellow-400' : wellnessScore > 50 ? 'text-orange-400' : 'text-red-500'} transition-all duration-1000 ease-out drop-shadow-md`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-extrabold ${wellnessScore > 80 ? 'text-yellow-500' : 'text-gray-900 dark:text-white'}`}>{wellnessScore}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {wellnessScore > 80 ? 'Good Condition' : wellnessScore > 50 ? 'Fair Condition' : 'Needs Care'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[220px] leading-relaxed">
                        Based on vaccinations, check-ups, and recorded vitals.
                    </p>
                </div>

                {/* Action Center / Alerts */}
                <div className="md:col-span-2 bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-red-500">notifications_active</span> Action Center
                        </h3>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onCheckSymptoms}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-500/20 hover:scale-105 transition-transform"
                            >
                                <span className="material-icons-round text-sm">health_and_safety</span> Check Symptoms
                            </button>
                            {overdueVaccines.length === 0 && activeMeds.length === 0 && (
                                <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">All Good</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {/* 1. Gap Alerts (Highest Priority) */}
                        {petGapAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center gap-4 p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-orange-900/30 flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
                                    <span className="material-icons-round">priority_high</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{alert.title}</h4>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">{alert.message}</p>
                                </div>
                                <Link to={alert.actionPath || '#'} className="px-3 py-1.5 bg-white dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold rounded-lg shadow-sm hover:bg-orange-50 transition-colors">
                                    {alert.actionLabel || 'Fix'}
                                </Link>
                            </div>
                        ))}

                        {overdueVaccines.map(v => (
                            <div key={v.id} className="flex items-center gap-4 p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0 shadow-sm">
                                    <span className="material-icons-round">warning</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Overdue: {v.type}</h4>
                                    <p className="text-xs text-red-500 dark:text-red-400">Expired on {v.expiryDate}</p>
                                </div>
                                <button onClick={() => navigate(`/pet/${pet.id}/add-record`)} className="px-3 py-1.5 bg-white dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-bold rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                                    Update
                                </button>
                            </div>
                        ))}

                        {activeMeds.length > 0 && (
                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-blue-900/30 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                                    <span className="material-icons-round">medication</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Active Medication: {activeMeds[0].name}</h4>
                                    <p className="text-xs text-blue-500 dark:text-blue-400">{activeMeds[0].frequency} • {activeMeds.length > 1 ? `+${activeMeds.length - 1} more` : 'Ongoing'}</p>
                                </div>
                                <button className="px-3 py-1.5 bg-white dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    Log Dose
                                </button>
                            </div>
                        )}

                        {overdueVaccines.length === 0 && activeMeds.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center py-4">
                                <span className="material-icons-round text-gray-300 text-4xl mb-2">check_circle</span>
                                <p className="text-gray-500 text-sm font-medium">No urgent alerts. {pet.name} is doing great!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <HealthMetricCard icon="monitor_weight" label="Weight" value={pet.weight} subValue="Stable" color="blue" trend="flat" />
                <HealthMetricCard icon="straighten" label="Height" value={pet.height || '--'} subValue={pet.height ? 'Last Recorded' : 'Not Set'} color="purple" />
                <HealthMetricCard icon="bloodtype" label="Blood Type" value={pet.bloodType?.split(' ')[0] || '?'} subValue={pet.bloodType?.split(' ').slice(1).join(' ') || 'Unknown'} color="red" />
                <HealthMetricCard icon="calendar_month" label="Age" value={ageValue} subValue={ageUnit === 'yrs' ? 'Years Old' : 'Months Old'} color="orange" />
            </div>

            {/* ALLERGIES & CONDITIONS */}
            {(pet.allergies && pet.allergies.length > 0) && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-red-900/20 text-red-500 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-icons-round text-2xl">no_food</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Conditions & Allergies</h3>
                        <div className="flex flex-wrap gap-2">
                            {pet.allergies.map((allergy, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-xs font-bold border border-red-100 dark:border-transparent shadow-sm">
                                    {allergy}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Research & News Section (Added) */}
            {news.length > 0 && (
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-blue-500">science</span> Personalized Research & News
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {news.map((item, i) => (
                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block border border-gray-100 dark:border-gray-800 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                <p className="text-xs text-blue-500 font-bold uppercase tracking-wide mb-2 flex items-center gap-1">
                                    <span className="material-icons-round text-[10px]">auto_awesome</span>
                                    {item.source || 'AI Curated'}
                                </p>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.headline}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{item.snippet}</p>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <PetInsights petId={pet.id} mode="single" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent History</h3>
                        <button onClick={() => setActiveTab('Health Records')} className="text-xs font-bold text-primary hover:text-primary-hover">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentEvents.map((event, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{new Date(event.date).getDate()}</span>
                                </div>
                                <div className="w-px h-10 bg-gray-100 dark:bg-gray-800"></div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-xl flex items-center gap-3 border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                                    <div className={`p-2 rounded-lg ${event.bg} dark:${event.bg.replace('bg-', 'bg-opacity-20 ')} ${event.color} dark:text-white`}>
                                        <span className="material-icons-round text-lg">{event.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{event.title}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentEvents.length === 0 && <p className="text-gray-400 italic text-sm">No recent activity recorded.</p>}
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Daily Routine</h3>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Today</span>
                    </div>
                    <div className="space-y-3">
                        {reminders.filter(r => r.petId === pet.id && (!r.date || r.date === new Date().toISOString().split('T')[0])).length > 0 ? (
                            reminders
                                .filter(r => r.petId === pet.id && (!r.date || r.date === new Date().toISOString().split('T')[0]))
                                .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                                .map(reminder => (
                                    <div
                                        key={reminder.id}
                                        onClick={() => updateReminder({ ...reminder, completed: !reminder.completed })}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${reminder.completed ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 opacity-70' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-700'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${reminder.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {reminder.completed && <span className="material-icons-round text-xs">check</span>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{reminder.title}</p>
                                            <p className="text-xs text-gray-500">{reminder.time || 'All Day'}</p>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-4 italic">No routine items set for today.</p>
                        )}
                    </div>
                    <Link to="/reminders" className="w-full mt-4 py-2 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-primary border border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        + Add Routine Item
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
