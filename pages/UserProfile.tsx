import React, { useState } from 'react';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../components/SubscriptionModal';

interface UserProfileProps {
  onMenuClick?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onMenuClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const { user, updateUser, logout } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(user);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => { })} title="My Profile" />
      <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-32 bg-gradient-to-br from-primary to-secondary opacity-10"></div>

              <div className="relative mt-8 mb-4">
                <div className="w-32 h-32 rounded-full p-1 bg-surface-light dark:bg-surface-dark ring-4 ring-gray-50 dark:ring-gray-800">
                  <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-md">
                    <span className="material-icons-round text-lg">camera_alt</span>
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-1">{user.name}</h2>
              <p className="text-primary font-medium text-sm mb-6">Pet Parent</p>

              <div className="grid grid-cols-3 gap-2 w-full border-t border-gray-100 dark:border-gray-700 pt-6">
                <div className="text-center">
                  <span className="block text-lg font-bold text-text-main-light dark:text-text-main-dark">3</span>
                  <span className="text-xs text-text-muted-light dark:text-text-muted-dark uppercase font-semibold">Pets</span>
                </div>
                <div className="text-center border-l border-gray-100 dark:border-gray-700">
                  <span className="block text-lg font-bold text-text-main-light dark:text-text-main-dark">12</span>
                  <span className="text-xs text-text-muted-light dark:text-text-muted-dark uppercase font-semibold">Records</span>
                </div>
                <div className="text-center border-l border-gray-100 dark:border-gray-700">
                  <span className="block text-lg font-bold text-text-main-light dark:text-text-main-dark">2y</span>
                  <span className="text-xs text-text-muted-light dark:text-text-muted-dark uppercase font-semibold">Member</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <span className="material-icons-round">verified</span> Premium Member
              </h3>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-4">You have full access to all Pawzly features.</p>
              <button
                onClick={() => setShowSubscription(true)}
                className="text-xs font-bold text-primary hover:text-primary-hover underline"
              >
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Right Column: Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-text-main-light dark:text-white font-medium text-sm transition-colors"
                  >
                    <span className="material-icons-round text-lg">edit</span> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-colors disabled:opacity-70"
                    >
                      {isLoading ? <span className="material-icons-round animate-spin text-lg">refresh</span> : <span className="material-icons-round text-lg">save</span>}
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-background-light dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-text-main-light dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base font-medium text-text-main-light dark:text-white py-2">{user.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-background-light dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-text-main-light dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base font-medium text-text-main-light dark:text-white py-2">{user.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-background-light dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-text-main-light dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base font-medium text-text-main-light dark:text-white py-2">{user.phone}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full bg-background-light dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-text-main-light dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-base font-medium text-text-main-light dark:text-white py-2 flex items-center gap-2">
                      <span className="material-icons-round text-gray-400 text-lg">location_on</span>
                      {user.address}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full h-24 bg-background-light dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-text-main-light dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    />
                  ) : (
                    <p className="text-base text-text-muted-light dark:text-text-muted-dark py-2 leading-relaxed">{user.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Login & Security Section */}
            <div className="mt-8 bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6">Login & Security</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-bold text-text-main-light dark:text-text-main-dark">Password</p>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Last changed 3 months ago</p>
                  </div>
                  <button className="text-sm font-bold text-primary hover:text-primary-hover px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">Change Password</button>
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-bold text-text-main-light dark:text-text-main-dark">Two-Factor Authentication</p>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400">Sign Out</p>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Log out of your account on this device</p>
                  </div>
                  <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Log Out</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        currentPlan="Premium"
      />
    </>
  );
};

export default UserProfile;