
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';

export type CampaignType = 'Banner' | 'Notification' | 'Email' | 'PartnerPost';
export type CampaignStatus = 'Active' | 'Scheduled' | 'Draft' | 'Ended' | 'Paused';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  placement: string;
  stats: { views: number; clicks: number; ctr: number };
  content: {
    title: string;
    body?: string;
    image?: string;
    animation?: string;
    ctaLabel?: string;
    ctaLink?: string;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    frequency?: string;
  };
  targeting: {
    plans: string[];
    petTypes: string[];
    regions: string[];
    userActivity: string[];
  };
}

const AdminMarketing: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { campaigns, saveCampaign, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState<CampaignType | 'All'>('All');
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();
  
  // Create Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [newCampaign, setNewCampaign] = useState<any>({
      type: 'Banner',
      status: 'Draft',
      content: { title: '', animation: 'none' },
      targeting: { plans: [], petTypes: [], userActivity: [], regions: [] },
      schedule: { startDate: new Date().toISOString().split('T')[0] },
      stats: { views: 0, clicks: 0, ctr: 0 },
      placement: 'Dashboard_Top'
  });

  const handleWizardClose = () => {
      setShowWizard(false);
      setWizardStep(1);
      setNewCampaign({
        type: 'Banner',
        status: 'Draft',
        content: { title: '', animation: 'none' },
        targeting: { plans: [], petTypes: [], userActivity: [], regions: [] },
        schedule: { startDate: new Date().toISOString().split('T')[0] },
        stats: { views: 0, clicks: 0, ctr: 0 },
        placement: 'Dashboard_Top'
      });
  };

  const handleWizardSave = async () => {
      await saveCampaign(newCampaign);
      handleWizardClose();
  };

  const filteredCampaigns = campaigns.filter(c => activeTab === 'All' || c.type === activeTab);

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => {})} title="Marketing Center" />
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-sm font-bold text-gray-500">Active Campaigns</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{campaigns.filter(c => c.status === 'Active').length}</p>
            </div>
            {/* Add more stat boxes as needed */}
        </div>

        {/* Main Content */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                    {['All', 'Banner', 'Notification', 'Email', 'PartnerPost'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                activeTab === tab 
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
                >
                    <span className="material-icons-round text-lg">add</span> Create Campaign
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-3">Campaign Name</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Placement</th>
                            <th className="px-4 py-3 text-right">Performance (CTR)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading && <tr><td colSpan={5} className="text-center py-8">Loading campaigns...</td></tr>}
                        {!loading && filteredCampaigns.map(camp => (
                            <tr key={camp.id} onClick={() => navigate(`/admin/marketing/${camp.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-gray-900 dark:text-white">{camp.name}</div>
                                    <div className="text-xs text-gray-500">{(camp.content as any).title}</div>
                                </td>
                                <td className="px-4 py-3">{camp.type}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${camp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{camp.status}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">{camp.placement}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="font-bold text-gray-900 dark:text-white">{(camp.stats as any).ctr}%</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Wizard Modal */}
        {showWizard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-surface-dark rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between">
                        <h2 className="text-xl font-bold">New Campaign</h2>
                        <button onClick={handleWizardClose}>Close</button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-4">
                        {/* Basic Fields */}
                        <input type="text" placeholder="Name" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} className="w-full border p-2 rounded" />
                        <select value={newCampaign.type} onChange={e => setNewCampaign({...newCampaign, type: e.target.value})} className="w-full border p-2 rounded">
                            <option>Banner</option><option>Notification</option>
                        </select>
                        <input type="text" placeholder="Title" value={newCampaign.content.title} onChange={e => setNewCampaign({...newCampaign, content: {...newCampaign.content, title: e.target.value}})} className="w-full border p-2 rounded" />
                    </div>
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button onClick={handleWizardSave} className="bg-primary text-white px-6 py-2 rounded-xl">Save</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default AdminMarketing;
