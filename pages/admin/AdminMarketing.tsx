
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { fetchCampaigns, fetchContent, createCampaign, createContent, createSegment, MarketingCampaign } from '../../services/marketing';
import { ContentEditor } from '../../components/admin/marketing/ContentEditor';
import { SegmentBuilder } from '../../components/admin/marketing/SegmentBuilder';
import { logAdminAction } from '../../services/admin';

const AdminMarketing: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [view, setView] = useState<'dashboard' | 'banners' | 'emails' | 'notifications' | 'posts' | 'create_wizard'>('dashboard');
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1);
    const [draftCampaign, setDraftCampaign] = useState<Partial<MarketingCampaign>>({ name: '', status: 'Draft' });
    const [draftContentType, setDraftContentType] = useState<'banner' | 'email' | 'notification' | 'post'>('email');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await fetchCampaigns();
        setCampaigns(data);
    };

    const handleCreateClick = (type: 'banner' | 'email' | 'notification' | 'post') => {
        setDraftContentType(type);
        setView('create_wizard');
        setWizardStep(1); // 1: Campaign details, 2: Segment, 3: Content
    };

    const handleWizardFinish = async (contentData: any) => {
        try {
            // 1. Create Campaign
            const campaign = await createCampaign(draftCampaign);

            // 2. Create Content
            await createContent({
                ...contentData,
                campaign_id: campaign.id,
                type: draftContentType
            });

            // 3. Log
            await logAdminAction('create_campaign', 'marketing_campaign', campaign.id, { type: draftContentType });

            setView('dashboard');
            loadData();
            alert('Campaign Launched Successfully! 🚀');
        } catch (e) {
            console.error(e);
            alert('Failed to launch campaign');
        }
    };

    return (
        <>
            <Header onMenuClick={onMenuClick || (() => { })} title="Marketing Hub" />
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">

                {/* Navigation Tiles */}
                {view !== 'create_wizard' && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl border text-left transition-colors ${view === 'dashboard' ? 'bg-primary text-white border-primary' : 'bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-primary'}`}>
                            <span className="material-icons-round block mb-2 opacity-80">dashboard</span>
                            <span className="font-bold text-sm">Overview</span>
                        </button>
                        <button onClick={() => setView('banners')} className={`p-4 rounded-2xl border text-left transition-colors ${view === 'banners' ? 'bg-blue-500 text-white border-blue-500' : 'bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-blue-500'}`}>
                            <span className="material-icons-round block mb-2 opacity-80">image</span>
                            <span className="font-bold text-sm">Banners</span>
                        </button>
                        <button onClick={() => setView('emails')} className={`p-4 rounded-2xl border text-left transition-colors ${view === 'emails' ? 'bg-purple-500 text-white border-purple-500' : 'bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-purple-500'}`}>
                            <span className="material-icons-round block mb-2 opacity-80">mail</span>
                            <span className="font-bold text-sm">Emails</span>
                        </button>
                        <button onClick={() => setView('notifications')} className={`p-4 rounded-2xl border text-left transition-colors ${view === 'notifications' ? 'bg-orange-500 text-white border-orange-500' : 'bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-orange-500'}`}>
                            <span className="material-icons-round block mb-2 opacity-80">notifications</span>
                            <span className="font-bold text-sm">Push/In-App</span>
                        </button>
                        <button onClick={() => setView('posts')} className={`p-4 rounded-2xl border text-left transition-colors ${view === 'posts' ? 'bg-green-500 text-white border-green-500' : 'bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-green-500'}`}>
                            <span className="material-icons-round block mb-2 opacity-80">article</span>
                            <span className="font-bold text-sm">Posts/Feed</span>
                        </button>
                    </div>
                )}

                {/* DASHBOARD VIEW */}
                {view === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Campaigns</h2>
                            <button onClick={() => handleCreateClick('email')} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-lg">New Campaign</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns.map(c => (
                                <div key={c.id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{c.name}</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4">Started {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'Draft'}</div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                        <span>Budget</span>
                                        <span>45% Spent</span>
                                    </div>
                                </div>
                            ))}
                            {campaigns.length === 0 && <div className="p-10 text-center text-gray-400 col-span-full">No active campaigns. Start one now!</div>}
                        </div>
                    </div>
                )}

                {/* SUB-PAGES (Placeholder lists for now, focused on Creation Flow) */}
                {(view === 'banners' || view === 'emails' || view === 'notifications' || view === 'posts') && (
                    <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{view} Manager</h2>
                            <button onClick={() => handleCreateClick(view === 'banners' ? 'banner' : view === 'emails' ? 'email' : view === 'notifications' ? 'notification' : 'post')} className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg">
                                + Create {view.slice(0, -1)}
                            </button>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-10 text-center border border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <span className="material-icons-round text-3xl">post_add</span>
                            </div>
                            <p className="text-gray-500 font-medium">Create a new {view.slice(0, -1)} to see it here.</p>
                        </div>
                    </div>
                )}

                {/* CREATE WIZARD */}
                {view === 'create_wizard' && (
                    <div className="animate-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-icons-round">arrow_back</span></button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">New {draftContentType.charAt(0).toUpperCase() + draftContentType.slice(1)} Campaign</h2>
                                <p className="text-sm text-gray-500">Step {wizardStep} of 3</p>
                            </div>
                        </div>

                        {/* Step 1: Campaign Info */}
                        {wizardStep === 1 && (
                            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
                                <h3 className="text-lg font-bold mb-4">Campaign Details</h3>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Campaign Name" value={draftCampaign.name} onChange={e => setDraftCampaign({ ...draftCampaign, name: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none" autoFocus />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Start Date</label>
                                            <input type="date" value={draftCampaign.start_date || ''} onChange={e => setDraftCampaign({ ...draftCampaign, start_date: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Budget ($)</label>
                                            <input type="number" placeholder="1000" className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button onClick={() => setWizardStep(2)} disabled={!draftCampaign.name} className="px-6 py-2 bg-primary text-white font-bold rounded-xl disabled:opacity-50">Next: Audience</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Audience Segment */}
                        {wizardStep === 2 && (
                            <SegmentBuilder onSave={(seg) => { setWizardStep(3); /* save seg ID */ }} onCancel={() => setWizardStep(1)} />
                        )}

                        {/* Step 3: Creative Content */}
                        {wizardStep === 3 && (
                            <ContentEditor
                                type={draftContentType}
                                onSave={handleWizardFinish}
                                onCancel={() => setWizardStep(2)}
                            />
                        )}
                    </div>
                )}

            </div>
        </>
    );
};

export default AdminMarketing;
