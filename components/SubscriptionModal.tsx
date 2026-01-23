import React, { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    period: '/mo',
    features: ['1 Pet Profile', 'Basic Health Records', 'Community Support'],
    color: 'bg-gray-100 dark:bg-gray-800',
    btnColor: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: '/mo',
    features: ['Unlimited Pets', 'AI Health Analysis', 'Priority Support', 'Cloud Storage'],
    recommended: true,
    color: 'bg-primary/5 border-primary/20',
    btnColor: 'bg-primary text-white'
  },
  {
    id: 'family',
    name: 'Family',
    price: '$19.99',
    period: '/mo',
    features: ['Up to 5 Users', 'Shared Calendar', 'All Premium Features', 'Export to Vet'],
    color: 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30',
    btnColor: 'bg-purple-600 text-white'
  }
];

const INVOICES = [
    { id: 'inv-001', date: 'Jan 15, 2024', amount: '$9.99', status: 'Paid', plan: 'Premium Monthly' },
    { id: 'inv-002', date: 'Dec 15, 2023', amount: '$9.99', status: 'Paid', plan: 'Premium Monthly' },
    { id: 'inv-003', date: 'Nov 15, 2023', amount: '$9.99', status: 'Paid', plan: 'Premium Monthly' },
    { id: 'inv-004', date: 'Oct 15, 2023', amount: '$9.99', status: 'Paid', plan: 'Premium Monthly' },
];

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentPlan = 'Premium' }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'billing'>('plans');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlanChange = (planName: string) => {
      setLoadingPlan(planName);
      setTimeout(() => {
          setLoadingPlan(null);
          alert(`Switched to ${planName} plan!`);
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-surface-dark w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h2>
                    <p className="text-xs text-gray-500">Manage your plan and payment details</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-icons-round">close</span>
                </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Sidebar Navigation */}
                <div className="w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-2 shrink-0">
                    <button 
                        onClick={() => setActiveTab('plans')}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'plans' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <span className="material-icons-round text-lg">verified</span> Available Plans
                    </button>
                    <button 
                        onClick={() => setActiveTab('billing')}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'billing' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <span className="material-icons-round text-lg">receipt_long</span> Billing & History
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {activeTab === 'plans' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose the right plan for your pets</h3>
                                <p className="text-gray-500">Upgrade or downgrade at any time. Prices in USD.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {PLANS.map(plan => (
                                    <div key={plan.id} className={`relative p-6 rounded-3xl border flex flex-col ${plan.recommended ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                        {plan.recommended && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                Recommended
                                            </div>
                                        )}
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h4>
                                        <div className="flex items-baseline mb-6">
                                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                                            <span className="text-gray-500 text-sm font-medium">{plan.period}</span>
                                        </div>
                                        
                                        <ul className="space-y-3 mb-8 flex-1">
                                            {plan.features.map((feat, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="material-icons-round text-green-500 text-base">check_circle</span>
                                                    {feat}
                                                </li>
                                            ))}
                                        </ul>

                                        <button 
                                            onClick={() => handlePlanChange(plan.name)}
                                            disabled={loadingPlan !== null}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-95 ${
                                                currentPlan === plan.name 
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default shadow-none' 
                                                : plan.btnColor + ' shadow-md hover:shadow-lg'
                                            }`}
                                        >
                                            {loadingPlan === plan.name ? (
                                                <span className="material-icons-round animate-spin text-lg">refresh</span>
                                            ) : (
                                                currentPlan === plan.name ? 'Current Plan' : (plan.id === 'free' ? 'Downgrade' : 'Upgrade')
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            
                            {/* Payment Method */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Method</h3>
                                <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                            {/* Simple Card Icon Placeholder */}
                                            <div className="flex gap-0.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/80 -ml-1.5 mix-blend-multiply"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">Visa ending in 4242</p>
                                            <p className="text-xs text-gray-500">Expires 12/2025</p>
                                        </div>
                                    </div>
                                    <button className="text-sm font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                                        Update
                                    </button>
                                </div>
                            </section>

                            <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

                            {/* Billing History */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Billing History</h3>
                                    <button className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
                                        <span className="material-icons-round text-sm">download</span> Download All
                                    </button>
                                </div>
                                
                                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Description</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {INVOICES.map(inv => (
                                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{inv.date}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inv.plan}</td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{inv.amount}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-gray-400 hover:text-primary transition-colors">
                                                            <span className="material-icons-round text-lg">download</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
  );
};

export default SubscriptionModal;
