
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';

const AdminSubscriptions: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { plans, savePlan, loading } = useAdmin();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleEditClick = (plan: any) => {
      setEditingPlan({ ...plan });
      setShowModal(true);
  };

  const handleCreateClick = () => {
      setEditingPlan({
          name: '',
          price_monthly: 0,
          price_annual: 0,
          currency_code: 'USD',
          description: '',
          features: {},
          limits: { pets: 1, storageGB: 1 },
          ai_features: { chat: { enabled: true, limit: 10 } }
      });
      setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      await savePlan(editingPlan);
      setShowModal(false);
      setEditingPlan(null);
  };

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => {})} title="Subscriptions" />
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Plans</h3>
            <button onClick={handleCreateClick} className="px-4 py-2 bg-primary text-white rounded-xl font-bold">Create Plan</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
                <div key={plan.id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative group">
                    <button onClick={() => handleEditClick(plan)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-primary"><span className="material-icons-round">edit</span></button>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                    <p className="text-2xl font-bold text-primary my-2">${plan.price_monthly}<span className="text-sm text-gray-400">/mo</span></p>
                    <p className="text-xs text-gray-500 mb-4">{plan.description}</p>
                    <div className="space-y-2">
                        <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">Pets: {(plan.limits as any).pets}</div>
                        <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">Storage: {(plan.limits as any).storageGB}GB</div>
                    </div>
                </div>
            ))}
        </div>

        {/* Modal */}
        {showModal && editingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-4">{editingPlan.id ? 'Edit Plan' : 'New Plan'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <input type="text" placeholder="Name" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} className="w-full border p-2 rounded" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Monthly Price" value={editingPlan.price_monthly} onChange={e => setEditingPlan({...editingPlan, price_monthly: Number(e.target.value)})} className="w-full border p-2 rounded" />
                            <input type="number" placeholder="Annual Price" value={editingPlan.price_annual} onChange={e => setEditingPlan({...editingPlan, price_annual: Number(e.target.value)})} className="w-full border p-2 rounded" />
                        </div>
                        <textarea placeholder="Description" value={editingPlan.description || ''} onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} className="w-full border p-2 rounded"></textarea>
                        
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl">Save</button>
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
