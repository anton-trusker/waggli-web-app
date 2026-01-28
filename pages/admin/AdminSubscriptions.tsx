import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../services/supabase';
import { SubscriptionPlan, PlanLimit } from '../../types';
import { fetchPlans, savePlanDB } from '../../services/db';

const AdminSubscriptions: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        const data = await fetchPlans();
        setPlans(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingPlan) return;
        setLoading(true);
        await savePlanDB(editingPlan);
        await loadPlans();
        setEditingPlan(null);
        setLoading(false);
    };

    const addLimit = () => {
        if (!editingPlan) return;
        const newLimit: PlanLimit = { feature: 'new_feature', limit: 10, period: 'monthly' };
        setEditingPlan({ ...editingPlan, limits: [...(editingPlan.limits || []), newLimit] });
    };

    const updateLimit = (index: number, field: keyof PlanLimit, value: any) => {
        if (!editingPlan || !editingPlan.limits) return;
        const newLimits = [...editingPlan.limits];
        newLimits[index] = { ...newLimits[index], [field]: value };
        setEditingPlan({ ...editingPlan, limits: newLimits });
    };

    const removeLimit = (index: number) => {
        if (!editingPlan || !editingPlan.limits) return;
        const newLimits = editingPlan.limits.filter((_, i) => i !== index);
        setEditingPlan({ ...editingPlan, limits: newLimits });
    };

    return (
        <>
            <Header onMenuClick={() => { }} title="Subscription Management" />
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                        <p className="text-gray-500">Manage pricing, intervals, and usage limits.</p>
                    </div>
                    <button
                        onClick={() => setEditingPlan({
                            id: `plan_${Date.now()}`,
                            name: 'New Plan',
                            price_monthly: 0,
                            price_annual: 0,
                            currency: 'USD',
                            description: '',
                            features: [],
                            limits: [],
                            isActive: true
                        })}
                        className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-lg"
                    >
                        + Create Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {plan.isActive ? 'Active' : 'Draft'}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <p className="font-mono">${plan.price_monthly}/mo • ${plan.price_annual}/yr</p>
                                <p className="line-clamp-2">{plan.description}</p>
                            </div>

                            <div className="space-y-2 mb-6">
                                <p className="text-xs font-bold uppercase text-gray-400">Limits</p>
                                {plan.limits && plan.limits.length > 0 ? (
                                    (plan.limits as PlanLimit[]).slice(0, 3).map((l, i) => (
                                        <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                                            <span className="font-semibold">{l.feature}</span>
                                            <span>{l.limit === -1 ? '∞' : l.limit} / {l.period}</span>
                                        </div>
                                    ))
                                ) : <p className="text-xs italic text-gray-400">No limits defined</p>}
                            </div>

                            <button
                                onClick={() => setEditingPlan(plan)}
                                className="w-full py-2 border border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors"
                            >
                                Edit Configuration
                            </button>
                        </div>
                    ))}
                </div>

                {/* EDIT MODAL */}
                {editingPlan && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold dark:text-white">Edit Plan: {editingPlan.name}</h2>
                                <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Name</label>
                                        <input
                                            value={editingPlan.name}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan ID (Slug)</label>
                                        <input
                                            value={editingPlan.id}
                                            disabled={plans.some(p => p.id === editingPlan.id && p !== editingPlan)} // Simple check
                                            onChange={(e) => setEditingPlan({ ...editingPlan, id: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-2 font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monthly Price</label>
                                        <input type="number" value={editingPlan.price_monthly} onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: parseFloat(e.target.value) })} className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Annual Price</label>
                                        <input type="number" value={editingPlan.price_annual} onChange={(e) => setEditingPlan({ ...editingPlan, price_annual: parseFloat(e.target.value) })} className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lifetime Price</label>
                                        <input type="number" value={editingPlan.price_lifetime || 0} onChange={(e) => setEditingPlan({ ...editingPlan, price_lifetime: parseFloat(e.target.value) })} className="w-full bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-2" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Usage Limits</h3>
                                    <div className="space-y-3">
                                        {editingPlan.limits?.map((limit: PlanLimit, i: number) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input
                                                    placeholder="Feature (e.g. ocr)"
                                                    value={limit.feature}
                                                    onChange={(e) => updateLimit(i, 'feature', e.target.value)}
                                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Limit (-1 = ∞)"
                                                    value={limit.limit}
                                                    onChange={(e) => updateLimit(i, 'limit', parseInt(e.target.value))}
                                                    className="w-24 bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm"
                                                />
                                                <select
                                                    value={limit.period}
                                                    onChange={(e) => updateLimit(i, 'period', e.target.value)}
                                                    className="w-32 bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                    <option value="lifetime">Lifetime</option>
                                                </select>
                                                <button onClick={() => removeLimit(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                    <span className="material-icons-round">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addLimit} className="mt-3 text-xs font-bold text-primary hover:underline">+ Add Limit Rule</button>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                                <button onClick={() => setEditingPlan(null)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                                <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg hover:bg-primary-hover">
                                    {loading ? 'Saving...' : 'Save Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminSubscriptions;
