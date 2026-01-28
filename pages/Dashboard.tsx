
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { FeatureGate } from '../components/FeatureGate';
import PetInsights from '../components/PetInsights';
import { generateCareGuide, generateHealthCheck, generatePetNews } from '../services/gemini';
import { calculateHealthScore, getHealthLabel, getSuggestedStatus } from '../utils/healthScoring';

interface DashboardProps {
  onMenuClick?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onMenuClick }) => {
  const { pets, appointments, healthStats, vaccines, medications, activities, fetchPetAIInsights, saveHealthRecord } = useApp();
  const { t } = useLocalization();
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [careGuide, setCareGuide] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const hasHealthRecords = vaccines.length > 0 || medications.length > 0;

  const fetchAIData = async (force = false) => {
    if (pets.length === 0) return;
    setLoadingAI(true);

    try {
      // 1. Check for existing insights if not forcing
      if (!force) {
        const existing = await fetchPetAIInsights(pets[0].id, 'ai_insight');
        if (existing && existing.length > 0) {
          const latest = existing[0].metadata;
          const recordDate = new Date(existing[0].date_recorded);
          const now = new Date();
          if (now.getTime() - recordDate.getTime() < 24 * 60 * 60 * 1000) {
            setHealthCheck(latest);
          }
        }

        // Fetch existing news
        const existingNews = await fetchPetAIInsights(pets[0].id, 'ai_news');
        if (existingNews && existingNews.length > 0) {
          const latestNews = existingNews[0].metadata;
          const recordDate = new Date(existingNews[0].date_recorded);
          if (new Date().getTime() - recordDate.getTime() < 24 * 60 * 60 * 1000) {
            setNews(latestNews.items || []); // Assuming metadata structure { items: [...] }
          }
        }
      }

      // 2. Generate New Insights (if missing)
      if (!healthCheck) { // Logic simplified: if healthCheck state is null, fetch
        const check = await generateHealthCheck(pets[0], [...vaccines, ...medications], healthScore, activities || []);
        const guide = await generateCareGuide(pets, {
          healthScore,
          appointments: appointments.slice(0, 3),
          allergies: pets[0]?.allergies
        });

        await saveHealthRecord(pets[0].id, 'medical-note', `AI Health Analysis: ${check.status}`, check);
        setHealthCheck(check);
        setCareGuide(guide);
      }

      // 3. Generate News (if missing)
      if (news.length === 0) {
        const petNews = await generatePetNews(pets[0]);
        setNews(petNews);
        await saveHealthRecord(pets[0].id, 'other', 'Daily Curated News', { items: petNews });
      }

    } catch (e) {
      console.error("AI Fetch Error", e);
    } finally {
      setLoadingAI(false);
    }
  };

  // Deterministic Score Calculation
  const healthScore = pets.length > 0 ? calculateHealthScore(pets[0], vaccines, medications, activities || []) : 0;
  const healthLabel = getHealthLabel(healthScore);
  const suggestedStatus = pets.length > 0 ? getSuggestedStatus(healthScore, vaccines) : 'Healthy';
  const showStatusAlert = pets.length > 0 && pets[0].status === 'Healthy' && suggestedStatus === 'Check-up';

  useEffect(() => {
    fetchAIData();
  }, [pets.length]); // Dependency on pets.length keeps re-triggering logic correctly

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => { })} />
      <div className="p-6 md:p-8 space-y-8">

        {/* ... (Pets Section & Banner Unchanged) ... */}
        {/* ... Copied logic around lines 86-180 preserved effectively by not touching it ... */}

        {/* Pets Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">{t('my_pets_title') || 'My Pets'}</h3>
            <div className="flex gap-2">
              <Link to="/add-pet" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium shadow-md shadow-primary/20 transition-all active:scale-95 ml-2">
                <span className="material-icons-round text-lg">add</span>
                <span className="hidden sm:inline">{t('add_pet_button') || 'Add Pet'}</span>
              </Link>
            </div>
          </div>

          {pets.length > 0 ? (
            <div className="flex overflow-x-auto pb-4 gap-3 md:gap-4 snap-x no-scrollbar">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  to={`/pet/${pet.id}`}
                  className="group bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 md:p-4 min-w-[120px] w-[120px] md:w-auto md:min-w-[340px] flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-2 md:gap-4 hover:shadow-md transition-all duration-300 snap-center cursor-pointer text-center md:text-left h-[120px] md:h-auto"
                >
                  <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0 border-2 p-0.5 ${pet.color && pet.color.toLowerCase().includes('gold') ? 'border-yellow-200 dark:border-yellow-900/50' : 'border-indigo-200 dark:border-indigo-900/50'}`}>
                    <img alt={pet.name} className="w-full h-full object-cover rounded-full" src={pet.image} />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-2 border-surface-light dark:border-surface-dark rounded-full ${pet.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col md:flex-row items-center md:justify-between mb-0.5 md:mb-1">
                      <h3 className="text-xs md:text-lg font-bold text-text-main-light dark:text-text-main-dark truncate w-full md:w-auto leading-tight">{pet.name}</h3>
                      <span className={`hidden md:inline-block px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wide ${pet.status === 'Healthy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                        {pet.status}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-sm text-text-muted-light dark:text-text-muted-dark truncate w-full mb-0 md:mb-2">{pet.breed}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-light dark:bg-surface-dark rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 mb-4">{t('no_pets_message') || 'No pets added yet.'}</p>
              <Link to="/add-pet" className="text-primary font-bold hover:underline">{t('add_first_pet_link') || 'Add your first pet'}</Link>
            </div>

          )}

          {/* Status Mismatch Alert */}
          {showStatusAlert && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 mt-4">
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-yellow-600 dark:text-yellow-400">health_and_safety</span>
                <div>
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">Health Status Update Recommended</h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Based on recent records (Score: {healthScore}), we recommend updating status to <strong>Check-up</strong>.
                  </p>
                </div>
              </div>
              <Link to={`/pet/${pets[0].id}`} className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-900 dark:text-white text-xs font-bold rounded-lg transition-colors">
                Review
              </Link>
            </div>
          )}
        </div>

        {/* AI Health Check Banner */}
        <FeatureGate feature="ai_features">
          {pets.length > 0 && (
            <div className={`rounded-3xl p-6 relative overflow-hidden transition-all ${!hasHealthRecords
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              }`}>
              {!hasHealthRecords ? (
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400">
                    <span className="material-icons-round text-2xl">warning</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-300">{t('health_records_missing_title') || 'Action Required: Health Records Missing'}</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 mb-3">
                      {t('health_records_missing_text') || "To get AI insights and health tracking, please add your pet's vaccination and medical history."}
                    </p>
                    <Link to={`/pet/${pets[0].id}/add-record`} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-colors">
                      {t('add_records_button') || 'Add Records Now'}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-icons-round text-yellow-300">auto_awesome</span>
                      <h3 className="text-lg font-bold">{t('ai_health_check_title') || 'AI Health Check'}</h3>
                      <button
                        onClick={(e) => { e.preventDefault(); fetchAIData(true); }}
                        disabled={loadingAI}
                        className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                        title="Refresh Insights"
                      >
                        <span className={`material-icons-round text-sm ${loadingAI ? 'animate-spin' : ''}`}>refresh</span>
                      </button>
                    </div>
                    <p className="text-blue-100 text-sm max-w-lg">
                      {loadingAI ? 'Analyzing records...' : (healthCheck?.summary || 'Your pets seem healthy based on current records.')}
                    </p>
                  </div>
                  {healthScore > 0 && (
                    <div className={`flex items-center gap-3 ${healthLabel.bg} ${healthLabel.color} px-4 py-2 rounded-2xl`}>
                      <span className="text-3xl font-bold">{healthScore}</span>
                      <div className="text-[10px] uppercase font-bold leading-tight line-clamp-2">Health<br />Score</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </FeatureGate>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upcoming Events */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{t('upcoming_events_title') || 'Upcoming Events'}</h3>
              <button className="text-gray-400 hover:text-primary transition-colors">
                <span className="material-icons-round">calendar_month</span>
              </button>
            </div>
            <div className="space-y-4 flex-1">
              {appointments.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className={`min-w-[48px] h-[48px] flex flex-col items-center justify-center rounded-xl line-height-1 ${event.bgClass} ${event.colorClass}`}>
                    <span className="text-[10px] font-bold uppercase mb-0.5">{event.month}</span>
                    <span className="text-lg font-bold">{event.day}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark">{event.title}</h4>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">{event.subtitle}</p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-gray-400 text-sm text-center py-4">{t('no_upcoming_events') || 'No upcoming events.'}</p>}
            </div>
          </div>

          {/* Specific Care Guide (AI) */}
          <FeatureGate feature="ai_features">
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{t('care_guide_title') || 'Care Guide'}</h3>
                <span className="material-icons-round text-purple-400">menu_book</span>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                {loadingAI ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  careGuide.length > 0 ? careGuide.map((tip, i) => (
                    <div key={i} className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">{tip.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{tip.content}</p>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <span className="material-icons-round text-gray-300 text-4xl mb-2">pets</span>
                      <p className="text-gray-400 text-sm">{pets.length > 0 ? "Daily tips coming soon." : "Add a pet to see care tips."}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </FeatureGate>

          {/* Quick Actions */}
          <div className="bg-primary rounded-3xl p-6 shadow-lg shadow-primary/20 text-white flex flex-col">
            <h3 className="text-lg font-bold mb-6">{t('quick_actions_title') || 'Quick Actions'}</h3>
            <div className="space-y-3 flex-1">
              {[
                { icon: 'calendar_month', label: t('action_book_appointment') || 'Book Appointment', to: '/appointments' },
                { icon: 'note_add', label: t('action_add_record') || 'Add Health Record', to: `/pet/${pets[0]?.id || 'max'}/add-record` },
                { icon: 'notifications_active', label: t('action_set_reminder') || 'Set Reminder', to: '/reminders' },
                { icon: 'call', label: t('action_contact_vet') || 'Contact Vet', to: '/find-vet' }
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-sm transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-xl">{action.icon}</span>
                    {action.label}
                  </div>
                  <span className="material-icons-round text-lg">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* AI Powered Insights & News - SWAPPED & RESIZED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Curated News (Larger - col-span-2) */}
          <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-icons-round text-blue-500">feed</span> {t('news_title') || 'Personalized Research & News'}
              {loadingAI && <span className="text-xs font-normal text-gray-400 ml-auto flex items-center gap-1"><span className="animate-spin material-icons-round text-xs">refresh</span> Finding updates...</span>}
            </h3>
            <div className="space-y-4">
              {!loadingAI && news.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 -mx-3 rounded-xl transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wide flex items-center gap-1">
                      <span className="material-icons-round text-[10px]">auto_awesome</span>
                      {item.source || 'AI Curated'}
                    </p>
                    <span className="text-gray-300 md:opacity-0 md:group-hover:opacity-100 transition-opacity material-icons-round text-sm">open_in_new</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-primary transition-colors">{item.headline}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.snippet}</p>
                </a>
              ))}
              {!loadingAI && news.length === 0 && (
                <div className="text-center py-10">
                  <span className="material-icons-round text-gray-200 text-6xl mb-2">newspaper</span>
                  <p className="text-gray-400 text-sm">No new updates found for your pet profile.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pet Insights (Smaller - col-span-1) */}
          <div className="lg:col-span-1">
            <PetInsights mode="aggregate" />
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
