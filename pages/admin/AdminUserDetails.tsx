
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';
import { User } from '../../types';

// Mock Activity Data (Keeping activity mock for now as backend log isn't fully spec'd yet)
const MOCK_ACTIVITY = [
    { id: 1, action: 'User Logged In', date: '2 hours ago', ip: '192.168.1.1', device: 'Chrome / MacOS' },
    { id: 2, action: 'Booked Appointment', date: '1 day ago', details: 'Vet Visit for Max' },
    { id: 3, action: 'Updated Profile', date: '3 days ago', details: 'Changed phone number' },
    { id: 4, action: 'Uploaded Document', date: '1 week ago', details: 'Vaccination_Cert.pdf' },
    { id: 5, action: 'Subscription Renewed', date: '1 month ago', details: 'Pro Plan ($4.99)' },
];

const AdminUserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { users, updateUserStatus } = useAdmin();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Pets' | 'Activity' | 'Billing'>('Overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [adminNote, setAdminNote] = useState('Customer prefers email communication. Verified owner.');
    const [showEmailModal, setShowEmailModal] = useState(false);

    useEffect(() => {
        if (users.length > 0 && id) {
            const foundUser = users.find(u => u.id === id);
            if (foundUser) {
                setUser(foundUser);
                setFormData(foundUser);
            }
        }
    }, [id, users]);

    if (!user) {
        return (
            <div className="p-10 text-center">
                <p className="text-gray-500">User not found or loading...</p>
                <button onClick={() => navigate('/admin/users')} className="text-primary hover:underline mt-2">Back to List</button>
            </div>
        );
    }

    const handleSave = () => {
        // In real implementation call API update here
        setUser({ ...user, ...formData });
        setIsEditing(false);
    };

    const handleStatusToggle = () => {
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        if (id) updateUserStatus(id, newStatus);
        setUser({ ...user, status: newStatus });
    };

    const handleImpersonate = () => {
        if (confirm(`Login as ${user.name}? This will log you out of Admin.`)) {
            // Logic to switch auth token would go here
            alert("Switched to user view.");
            navigate('/');
        }
    };

    // Helper to get array for roles
    const userRole = Array.isArray(user.roles) ? user.roles[0] : user.role || 'user';

    return (
        <>
            <Header onMenuClick={() => { }} title="User Details" />
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">

                {/* Top Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/users')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                            <span className="material-icons-round">arrow_back</span>
                        </button>
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-white dark:border-gray-700 shadow-sm relative">
                            {user.image ? (
                                <img src={user.image} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">{user.name?.charAt(0)}</div>
                            )}
                            <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 border-2 border-white dark:border-gray-700 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {user.name}
                                {user.plan === 'Premium' && <span className="material-icons-round text-blue-500 text-lg" title="Pro Member">verified</span>}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><span className="material-icons-round text-xs">email</span> {user.email}</span>
                                <span className="flex items-center gap-1"><span className="material-icons-round text-xs">calendar_today</span> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button onClick={handleImpersonate} className="px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="material-icons-round text-sm">login</span> Login As
                        </button>
                        <button onClick={() => setShowEmailModal(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="material-icons-round text-sm">mail</span> Send Email
                        </button>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <button
                            onClick={handleStatusToggle}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${user.status === 'Active'
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                                }`}
                        >
                            {user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800 flex gap-6 overflow-x-auto no-scrollbar">
                    {['Overview', 'Pets', 'Activity', 'Billing'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Content based on Tab */}
                    <div className="lg:col-span-2 space-y-6">

                        {activeTab === 'Overview' && (
                            <>
                                {/* Edit Profile Form */}
                                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Details</h3>
                                        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="text-sm font-bold text-primary hover:underline">
                                            {isEditing ? 'Save Changes' : 'Edit'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                            {isEditing ? (
                                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                            ) : (
                                                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                                            {isEditing ? (
                                                <input type="text" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                            ) : (
                                                <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
                                            {isEditing ? (
                                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                            ) : (
                                                <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
                                            {isEditing ? (
                                                <select value={userRole} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                                    <option>User</option><option>Vet</option><option>Admin</option>
                                                </select>
                                            ) : (
                                                <p className="font-medium text-gray-900 dark:text-white">{userRole}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                                            {isEditing ? (
                                                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                                            ) : (
                                                <p className="font-medium text-gray-900 dark:text-white">{user.address}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Admin Notes</h3>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        className="w-full h-32 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl text-sm text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-yellow-400 outline-none"
                                        placeholder="Add notes about this user..."
                                    ></textarea>
                                    <div className="flex justify-end mt-2">
                                        <button className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">Save Note</button>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'Pets' && (
                            <div className="space-y-4">
                                <div className="p-10 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <span className="material-icons-round text-4xl text-gray-300">pets</span>
                                    <p className="text-gray-500 mt-2">Pets management available via main Pets Dashboard.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Activity' && (
                            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Activity Log</h3>
                                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                                    {MOCK_ACTIVITY.map((log) => (
                                        <div key={log.id} className="relative pl-8">
                                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{log.action}</p>
                                                    <p className="text-xs text-gray-500">{log.details || log.device}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">{log.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    Load More
                                </button>
                            </div>
                        )}

                        {activeTab === 'Billing' && (
                            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Plan</h3>
                                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold uppercase">{user.plan || 'Free'}</span>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Quick Stats & Danger Zone */}
                    <div className="space-y-6">

                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Engagement</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300 text-sm">Last Login</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{user.lastLogin || 'Never'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300 text-sm">Platform</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">Web</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                                    <span className="material-icons-round text-gray-400">lock_reset</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Send Password Reset</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                                    <span className="material-icons-round text-gray-400">logout</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Force Logout</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 p-6">
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                            <p className="text-xs text-red-500/80 mb-4">Irreversible actions.</p>
                            <button className="w-full py-2 bg-white dark:bg-red-900/20 text-red-600 dark:text-red-300 font-bold text-sm rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 transition-colors">
                                Delete User
                            </button>
                        </div>

                    </div>
                </div>

                {/* Email Modal */}
                {showEmailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                            <h3 className="text-xl font-bold mb-4 dark:text-white">Email {user.name}</h3>
                            <input type="text" placeholder="Subject" className="w-full mb-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none" />
                            <textarea rows={5} placeholder="Message..." className="w-full mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none resize-none"></textarea>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 bg-primary text-white font-bold rounded-xl">Send</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default AdminUserDetails;
