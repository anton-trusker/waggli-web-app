
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
  onMenuClick?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onMenuClick }) => {
  const { logout } = useApp();
  const { t, language, setLanguage, languages } = useLocalization();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    promos: false
  });

  // Check initial theme state from DOM or LocalStorage
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => {})} title={t("Settings")} />
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Appearance Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
               <span className="material-icons-round text-primary">palette</span> {t("Appearance")}
            </h3>
            
            <div className="flex items-center justify-between mb-4">
                <div>
                   <p className="font-bold text-text-main-light dark:text-text-main-dark">{t("Dark Mode")}</p>
                   <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{t("Adjust the appearance to reduce eye strain")}</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                   <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                   <p className="font-bold text-text-main-light dark:text-text-main-dark">{t("Language")}</p>
                   <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{t("Select your preferred language")}</p>
                </div>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 font-bold text-sm"
                >
                    {languages.map(l => (
                        <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                </select>
            </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
               <span className="material-icons-round text-primary">notifications</span> {t("Notifications")}
            </h3>
            
            <div className="space-y-6">
               <ToggleItem 
                  label={t("Email Notifications")} 
                  desc={t("Receive updates about your pet's health records")}
                  checked={notifications.email}
                  onChange={() => toggleNotification('email')}
               />
               <ToggleItem 
                  label={t("Push Notifications")} 
                  desc={t("Get reminders for appointments and meds on your device")}
                  checked={notifications.push}
                  onChange={() => toggleNotification('push')}
               />
            </div>
        </section>

        {/* Account Actions */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
               <span className="material-icons-round text-primary">manage_accounts</span> {t("Account Actions")}
            </h3>
            
            <div className="space-y-4">
               <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left">
                  <div>
                    <p className="font-bold text-text-main-light dark:text-text-main-dark">{t("Export Data")}</p>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{t("Download a copy of all your pet's data")}</p>
                  </div>
                  <span className="material-icons-round text-gray-400 group-hover:text-primary">download</span>
               </button>
               
               <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

                <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group text-left">
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400">{t("Sign Out")}</p>
                    <p className="text-sm text-red-400/70 dark:text-red-400/60 mt-1">{t("Log out of your account on this device")}</p>
                  </div>
                  <span className="material-icons-round text-red-300 group-hover:text-red-500">logout</span>
               </button>

               <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

               <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group text-left">
                  <div>
                    <p className="font-bold text-gray-600 dark:text-gray-400">{t("Delete Account")}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t("Permanently remove your account and all data")}</p>
                  </div>
                  <span className="material-icons-round text-gray-300 group-hover:text-red-500">delete_forever</span>
               </button>
            </div>
        </section>

        {/* App Info */}
        <div className="text-center pt-4">
           <p className="text-sm font-semibold text-text-main-light dark:text-text-main-dark">Pawzly App</p>
           <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">Version 1.0.4 • Build 20240115</p>
        </div>
      </div>
    </>
  );
};

// Helper Component for Toggles
const ToggleItem = ({ label, desc, checked, onChange }: { label: string, desc: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="font-bold text-text-main-light dark:text-text-main-dark">{label}</p>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{desc}</p>
        </div>
        <button 
            onClick={onChange}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

export default Settings;
