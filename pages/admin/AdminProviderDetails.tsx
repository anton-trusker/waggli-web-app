
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';

const AdminProviderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { providers, updateProviderStatus } = useAdmin();
  const [provider, setProvider] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'Profile' | 'Services' | 'Verification'>('Profile');

  useEffect(() => {
      const found = providers.find(p => p.id === id);
      if (found) setProvider(found);
  }, [id, providers]);

  if (!provider) {
      return <div className="p-10 text-center">Loading Provider...</div>;
  }

  const handleStatusChange = (newStatus: 'Verified' | 'Rejected') => {
      if (confirm(`Change status to ${newStatus}?`)) {
          updateProviderStatus(provider.id, newStatus);
      }
  };

  return (
    <>
      <Header onMenuClick={() => {}} title="Provider Details" />
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 ${
                    provider.type === 'Business' 
                    ? 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-900/20 dark:border-purple-900/30' 
                    : 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900/30'
                }`}>
                    <span className="material-icons-round">{provider.type === 'Business' ? 'business' : 'person'}</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        {provider.name}
                        {provider.status === 'Verified' && <span className="material-icons-round text-blue-500 text-lg" title="Verified">verified</span>}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-medium">{provider.type}</span>
                        <span>•</span>
                        <span>{provider.category}</span>
                        <span>•</span>
                        <span>Since {new Date(provider.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    provider.status === 'Verified' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                    provider.status === 'Pending' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }`}>
                    {provider.status}
                </div>
                
                {provider.status === 'Pending' && (
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => handleStatusChange('Rejected')} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                            Reject
                        </button>
                        <button onClick={() => handleStatusChange('Verified')} className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/20 transition-colors">
                            Approve & Verify
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 flex gap-6">
            {['Profile', 'Services', 'Verification'].map(tab => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content (Dynamic based on Tab) */}
            <div className="lg:col-span-2 space-y-6">
                
                {activeTab === 'Profile' && (
                    <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Owner Name</label>
                                <p className="font-medium text-gray-900 dark:text-white">{provider.owner_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                                <p className="font-medium text-gray-900 dark:text-white">{provider.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone</label>
                                <p className="font-medium text-gray-900 dark:text-white">{provider.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address</label>
                                <p className="font-medium text-gray-900 dark:text-white">{provider.address || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Description</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {provider.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'Services' && (
                    <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Offered Services</h3>
                        <div className="space-y-3">
                            {provider.services_list?.map((svc: string, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-primary shadow-sm">
                                            <span className="material-icons-round text-lg">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{svc}</p>
                                            <p className="text-xs text-gray-500">Service Item</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!provider.services_list || provider.services_list.length === 0) && <p className="text-gray-500">No services listed.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'Verification' && (
                    <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submitted Documents</h3>
                        </div>
                        {provider.documents && provider.documents.length > 0 ? (
                            <div className="space-y-3">
                                {provider.documents.map((doc: any, index: number) => (
                                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                                        <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-primary shadow-sm">
                                            <span className="material-icons-round text-2xl">description</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">{doc.type || 'Document'}</p>
                                            <p className="text-xs text-gray-500">{doc.name} • {doc.size}</p>
                                        </div>
                                        <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-600">
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <span className="material-icons-round text-4xl text-gray-300">folder_off</span>
                                <p className="text-gray-500 mt-2">No documents attached for review.</p>
                            </div>
                        )}
                        
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm mb-1">Verification Guidelines</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Ensure business license matches the provider name and is valid for the current year. ID should match the owner name.
                            </p>
                        </div>
                    </div>
                )}

            </div>

            {/* Right Sidebar: Quick Stats */}
            <div className="space-y-6">
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Performance</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300 text-sm">Rating</span>
                            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                {provider.rating} <span className="material-icons-round text-yellow-400 text-sm">star</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300 text-sm">Reviews</span>
                            <span className="font-bold text-gray-900 dark:text-white">{provider.review_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default AdminProviderDetails;
