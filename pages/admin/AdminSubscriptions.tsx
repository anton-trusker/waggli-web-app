
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { fetchPlans, saveSubscriptionPlan, fetchPromoCodes, createPromoCode, deletePromoCode, SubscriptionPlan, PromoCode } from '../../services/subscriptions';
import { logAdminAction } from '../../services/admin';

const AdminSubscriptions: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
    const [activeTab, setActiveTab] = useState<'Plans' | 'Promo Codes' | 'Transactions'>('Plans');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan>>({});

    const [showPromoModal, setShowPromoModal] = useState(false);
    const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({ type: 'percent_off', value: 20 });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        if (activeTab === 'Plans') {
            const data = await fetchPlans();
            setPlans(data);
        } else if (activeTab === 'Promo Codes') {
            const data = await fetchPromoCodes();
            setPromos(data);
        }
        setLoading(false);
    };

    const handlePlanSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveSubscriptionPlan(editingPlan);
            await logAdminAction('update_plan', 'subscription_plan', editingPlan.internal_name, { plan_name: editingPlan.display_name });
            setShowPlanModal(false);
            loadData();
        } catch (err) {
            alert("Failed to save plan");
        }
    };

    const handlePromoSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPromoCode(newPromo);
            await logAdminAction('create_promo', 'promo_code', newPromo.code, { type: newPromo.type });
            setShowPromoModal(false);
            loadData();
        } catch (err) {
            alert("Failed to create promo code (Code might be duplicate)");
        }
    };

    return (
        <>
            <Header onMenuClick={onMenuClick || (() => { })} title="Subscriptions & Monetization" />
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
                    {['Plans', 'Promo Codes', 'Transactions'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* PLANS TAB */}
                {activeTab === 'Plans' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Plans</h3>
                            <button
                                onClick={() => {
                                    setEditingPlan({
                                        internal_name: '',
                                        display_name: '',
                                        price_monthly: 999,
                                        trial_days: 7,
                                        segment: 'pet_owner',
                                        max_pets: 1,
                                        can_use_ai_assistant: false,
                                        is_active: true,
                                        features: {}
                                    });
                                    setShowPlanModal(true);
                                }}
                                className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors"
                            >
                                + New Plan
                            </button>
                        </div>
                        {loading ? <p>Loading...</p> : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {plans.map(plan => (
                                    <div key={plan.id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative group hover:border-primary/50 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{plan.display_name}</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {plan.is_active ? 'Active' : 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-3xl font-bold text-primary mb-4">${(plan.price_monthly / 100).toFixed(2)}<span className="text-sm text-gray-400 font-normal">/mo</span></p>

                                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                                            <div className="flex justify-between"><span>Max Pets:</span> <b>{plan.max_pets < 0 ? 'Unlimited' : plan.max_pets}</b></div>
                                            <div className="flex justify-between"><span>AI Queries:</span> <b>{plan.monthly_ai_queries}</b></div>
                                            <div className="flex justify-between"><span>Storage:</span> <b>{plan.storage_limit_mb} MB</b></div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setEditingPlan(plan);
                                                setShowPlanModal(true);
                                            }}
                                            className="w-full py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Edit Entitlements
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* PROMO CODES TAB */}
                {activeTab === 'Promo Codes' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Promo Codes</h3>
                            <button
                                onClick={() => setShowPromoModal(true)}
                                className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors"
                            >
                                + Generate Code
                            </button>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-400 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Value</th>
                                        <th className="px-6 py-4">Redemptions</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {promos.map(promo => (
                                        <tr key={promo.id}>
                                            <td className="px-6 py-4 font-mono font-bold text-primary">{promo.code}</td>
                                            <td className="px-6 py-4 capitalize">{promo.type.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 font-bold">
                                                {promo.type === 'percent_off' ? `${promo.value}%` :
                                                    promo.type === 'fixed_amount' ? `$${(promo.value / 100).toFixed(2)}` :
                                                        `${promo.value} Days`}
                                            </td>
                                            <td className="px-6 py-4">{promo.current_redemptions} / {promo.max_redemptions || '∞'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => deletePromoCode(promo.id).then(loadData)} className="text-red-500 hover:text-red-700 font-bold text-xs">ARCHIVE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {promos.length === 0 && <div className="p-8 text-center text-gray-400">No active promo codes.</div>}
                        </div>
                    </div>
                )}

                {/* Plan Builder Modal */}
                {showPlanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-6">{editingPlan.id ? 'Edit Plan Entitlements' : 'Create New Plan'}</h3>
                            <form onSubmit={handlePlanSave} className="space-y-6">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-4 mb-4">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Plan Type & Segment</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Target Audience</label>
                                            <select
                                                value={editingPlan.segment || 'pet_owner'}
                                                onChange={e => setEditingPlan({ ...editingPlan, segment: e.target.value as any })}
                                                className="w-full p-2 bg-white rounded-lg border border-gray-200"
                                            >
                                                <option value="pet_owner">Pet Owner (B2C)</option>
                                                <option value="service_provider">Service Provider (B2B)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Internal ID</label>
                                            <input required type="text" value={editingPlan.internal_name} onChange={e => setEditingPlan({ ...editingPlan, internal_name: e.target.value })} className="w-full p-2 bg-white rounded-lg border border-gray-200 font-mono text-sm" placeholder="pro_monthly_v1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Display Name</label>
                                        <input required type="text" value={editingPlan.display_name} onChange={e => setEditingPlan({ ...editingPlan, display_name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none" placeholder="Pro Plan" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Price (Cents)</label>
                                        <input required type="number" value={editingPlan.price_monthly} onChange={e => setEditingPlan({ ...editingPlan, price_monthly: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none" />
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-4">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Entitlements (Limits)</h4>

                                    {/* B2B Specifics */}
                                    {editingPlan.segment === 'service_provider' && (
                                        <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 mb-2">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-blue-800">Commission Rate (%)</label>
                                                <input type="number" value={editingPlan.commission_rate || 0} onChange={e => setEditingPlan({ ...editingPlan, commission_rate: Number(e.target.value) })} className="w-full p-2 bg-white rounded-lg border border-blue-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-blue-800">Listings Limit</label>
                                                <input type="number" value={editingPlan.listings_limit || 1} onChange={e => setEditingPlan({ ...editingPlan, listings_limit: Number(e.target.value) })} className="w-full p-2 bg-white rounded-lg border border-blue-200" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Standard Limits */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Max Pets (-1 for ∞)</label>
                                            <input type="number" value={editingPlan.max_pets} onChange={e => setEditingPlan({ ...editingPlan, max_pets: Number(e.target.value) })} className="w-full p-2 bg-white rounded-lg border border-gray-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Storage (MB)</label>
                                            <input type="number" value={editingPlan.storage_limit_mb} onChange={e => setEditingPlan({ ...editingPlan, storage_limit_mb: Number(e.target.value) })} className="w-full p-2 bg-white rounded-lg border border-gray-200" />
                                        </div>
                                    </div>

                                    {/* Feature Flags (JSON Builder Mock) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500">Feature Flags</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border">
                                                <input type="checkbox" checked={editingPlan.can_use_ai_assistant} onChange={e => setEditingPlan({ ...editingPlan, can_use_ai_assistant: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                                                <span className="text-xs font-bold">AI Assistant</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border">
                                                <input type="checkbox" checked={editingPlan.can_share_passport} onChange={e => setEditingPlan({ ...editingPlan, can_share_passport: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                                                <span className="text-xs font-bold">Share Passport</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border">
                                                <input
                                                    type="checkbox"
                                                    checked={editingPlan.features?.ad_free}
                                                    onChange={e => setEditingPlan({ ...editingPlan, features: { ...editingPlan.features, ad_free: e.target.checked } })}
                                                    className="w-4 h-4 rounded text-primary"
                                                />
                                                <span className="text-xs font-bold">Ad-Free Experience</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border">
                                                <input
                                                    type="checkbox"
                                                    checked={editingPlan.features?.booking_calendar_advanced}
                                                    onChange={e => setEditingPlan({ ...editingPlan, features: { ...editingPlan.features, booking_calendar_advanced: e.target.checked } })}
                                                    className="w-4 h-4 rounded text-primary"
                                                />
                                                <span className="text-xs font-bold">Advanced Calendar</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowPlanModal(false)} className="px-5 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg">Save Plan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Promo Modal */}
                {showPromoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl p-8">
                            <h3 className="text-xl font-bold mb-6">Generate Promo Code</h3>
                            <form onSubmit={handlePromoSave} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Code</label>
                                    <input required type="text" value={newPromo.code || ''} onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-mono tracking-wider" placeholder="SUMMER25" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                                        <select value={newPromo.type} onChange={e => setNewPromo({ ...newPromo, type: e.target.value as any })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm">
                                            <option value="percent_off">Percent Off</option>
                                            <option value="fixed_amount">Fixed Amount</option>
                                            <option value="extended_trial">Extended Trial</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Value</label>
                                        <input required type="number" value={newPromo.value} onChange={e => setNewPromo({ ...newPromo, value: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowPromoModal(false)} className="px-5 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default AdminSubscriptions;
