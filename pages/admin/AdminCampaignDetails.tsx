
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';
import { MarketingCampaign } from '../../types';

const AdminCampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns } = useAdmin();
  const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Config'>('Overview');

  useEffect(() => {
      if (campaigns.length > 0 && id) {
          const found = campaigns.find(c => c.id === id);
          if (found) setCampaign(found);
      }
  }, [id, campaigns]);

  if (!campaign) {
      return (
          <div className="p-10 text-center">
              <p>Campaign not found or loading...</p>
              <button onClick={() => navigate('/admin/marketing')} className="text-primary mt-4 hover:underline">Back to Marketing</button>
          </div>
      );
  }

  return (
    <>
      <Header onMenuClick={() => {}} title="Campaign Details" />
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/marketing')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                    <span className="material-icons-round">arrow_back</span>
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 
                            'bg-gray-100 text-gray-600'
                        }`}>
                            {campaign.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{campaign.type} • {campaign.placement.replace('_', ' ')}</p>
                </div>
            </div>
            
            <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Stop Campaign
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover shadow-lg shadow-primary/20">
                    Edit Campaign
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 flex gap-6">
            {['Overview', 'Config'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === tab 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content */}
        {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Stats Chart Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Views</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.stats.views.toLocaleString()}</p>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Clicks</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.stats.clicks.toLocaleString()}</p>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">CTR</p>
                            <p className={`text-2xl font-bold ${campaign.stats.ctr > 2 ? 'text-green-500' : 'text-yellow-500'}`}>{campaign.stats.ctr}%</p>
                        </div>
                    </div>

                    {/* Mock Chart */}
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-80 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Performance Over Time</h3>
                        <div className="flex-1 flex items-end justify-between gap-2 px-2">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 65, 80, 95].map((h, i) => (
                                <div key={i} className="w-full bg-primary/10 rounded-t-lg relative group">
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-500" style={{ height: `${h}%` }}></div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {h * 10} Views
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                            <span>14 Days Ago</span>
                            <span>Today</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Creative Preview */}
                <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Creative Preview</h3>
                    
                    {/* Phone Frame */}
                    <div className="w-[280px] bg-white dark:bg-surface-dark border-4 border-gray-200 dark:border-gray-700 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="h-full p-4 flex flex-col">
                            {/* Header Mock */}
                            <div className="flex justify-between mb-4 opacity-30">
                                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                                <div className="w-20 h-4 bg-gray-300 rounded"></div>
                            </div>

                            {/* The Ad Itself */}
                            <div className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 ${
                                campaign.content.animation === 'bounce' ? 'animate-bounce' : 
                                campaign.content.animation === 'pulse' ? 'animate-pulse' : ''
                            }`}>
                                {campaign.content.image && (
                                    <div className="h-32 bg-gray-200 relative">
                                        <img src={campaign.content.image} className="w-full h-full object-cover" alt="Campaign" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{campaign.content.title}</h4>
                                    <p className="text-xs text-gray-500 mb-3">{campaign.content.body}</p>
                                    <button className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold">
                                        {campaign.content.ctaLabel || 'Learn More'}
                                    </button>
                                </div>
                            </div>

                            {/* Mock Content */}
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl opacity-50"></div>
                        </div>
                    </div>

                    <div className="mt-8 w-full">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Creative Details</h4>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex justify-between"><span>Animation:</span> <span className="font-bold capitalize">{campaign.content.animation}</span></li>
                            <li className="flex justify-between"><span>Destination:</span> <span className="font-mono text-xs">{campaign.content.ctaLink}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {/* Config Tab View */}
        {activeTab === 'Config' && (
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-purple-500">schedule</span> Schedule
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Duration</p>
                                <p className="font-medium text-gray-900 dark:text-white">{campaign.schedule.startDate} — {campaign.schedule.endDate || 'Until Stopped'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Frequency</p>
                                <p className="font-medium text-gray-900 dark:text-white">{campaign.schedule.frequency || 'Default'}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-blue-500">group</span> Targeting
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User Plans</p>
                                <div className="flex flex-wrap gap-2">
                                    {campaign.targeting.plans.map(p => (
                                        <span key={p} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-900">{p}</span>
                                    ))}
                                    {campaign.targeting.plans.length === 0 && <span className="text-sm text-gray-400">All Plans</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pet Types</p>
                                <div className="flex flex-wrap gap-2">
                                    {campaign.targeting.petTypes.map(p => (
                                        <span key={p} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full text-xs font-bold border border-green-100 dark:border-green-900">{p}</span>
                                    ))}
                                    {campaign.targeting.petTypes.length === 0 && <span className="text-sm text-gray-400">All Pets</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Regions</p>
                                <div className="flex flex-wrap gap-2">
                                    {campaign.targeting.regions.map(r => (
                                        <span key={r} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">{r}</span>
                                    ))}
                                    {campaign.targeting.regions.length === 0 && <span className="text-sm text-gray-400">Global</span>}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default AdminCampaignDetails;
