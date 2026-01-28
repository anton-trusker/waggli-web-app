
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useLocalization } from '../context/LocalizationContext';
import { useApp } from '../context/AppContext';

interface SettingsProps {
  onMenuClick?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onMenuClick }) => {
  const { language, setLanguage, t, translateMissingKeys, isTranslating } = useLocalization();
  const { user, updateUser } = useApp(); // Get user and update function

  // Initialize state from User Preferences or defaults
  const [darkMode, setDarkMode] = useState(user.preferences?.darkMode || false);
  const [notifications, setNotifications] = useState({
    email: user.preferences?.notifications ?? false, // Map generic 'notifications' bool to specific toggles if needed, or just use one
    push: true, // Mock for now if not in DB, or we can expand User Prefs
    sms: false,
    promos: false
  });

  // Note: 'integrations' are not yet in User type, keeping local state for now
  const [integrations, setIntegrations] = useState({
    googleCalendar: false,
    appleCalendar: false
  });

  // Check initial theme state from DOM (source of truth for UI) or User
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark !== darkMode) {
      setDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Persist to DB
    updateUser({
      ...user,
      preferences: {
        ...user.preferences,
        darkMode: newMode,
        notifications: user.preferences?.notifications || false,
        language: language || 'en'
      }
    });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);

    // Example: persist 'email' toggle as the main 'notifications' preference
    if (key === 'email') {
      updateUser({
        ...user,
        preferences: {
          ...user.preferences,
          darkMode: darkMode,
          notifications: newNotifs.email,
          language: language || 'en'
        }
      });
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    updateUser({
      ...user,
      preferences: {
        ...user.preferences,
        darkMode: darkMode,
        notifications: notifications.email,
        language: lang
      }
    });
  };

  const toggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => { })} title={t("Settings") || "Settings"} />
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">

        {/* Appearance Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
            <span className="material-icons-round text-primary">palette</span> {t("Appearance") || "Appearance"}
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-text-main-light dark:text-text-main-dark">{t("Dark Mode") || "Dark Mode"}</p>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{t("Adjust the appearance to reduce eye strain") || "Adjust the appearance to reduce eye strain"}</p>
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
              <p className="font-bold text-text-main-light dark:text-text-main-dark">{t("Language") || "Language"}</p>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{t("Select your preferred language") || "Select your preferred language"}</p>
            </div>
            <div className="flex items-center gap-2">
              {language !== 'en' && (
                <button
                  onClick={() => translateMissingKeys()}
                  className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                  disabled={false} // Would be nice to track loading state here
                >
                  Auto-Translate
                </button>
              )}
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 font-bold text-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
            <span className="material-icons-round text-primary">sync_alt</span> {t("Integrations") || "Integrations"}
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                  <span className="material-icons-round">calendar_today</span>
                </div>
                <div>
                  <p className="font-bold text-text-main-light dark:text-text-main-dark">{t("Google Calendar") || "Google Calendar"}</p>
                  <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{t("Sync appointments automatically") || "Sync appointments automatically"}</p>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration('googleCalendar')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${integrations.googleCalendar ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${integrations.googleCalendar ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
            <span className="material-icons-round text-primary">notifications</span> {t("Notifications") || "Notifications"}
          </h3>

          <div className="space-y-6">
            <ToggleItem
              label={t("Email Notifications") || "Email Notifications"}
              desc={t("Receive updates about your pet's health records") || "Receive updates about your pet's health records"}
              checked={notifications.email}
              onChange={() => toggleNotification('email')}
            />
            <ToggleItem
              label={t("Push Notifications") || "Push Notifications"}
              desc={t("Get reminders for appointments and meds on your device") || "Get reminders for appointments and meds on your device"}
              checked={notifications.push}
              onChange={() => toggleNotification('push')}
            />
          </div>
        </section>

        {/* Account Actions */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
            <span className="material-icons-round text-primary">manage_accounts</span> {t("Account Actions") || "Account Actions"}
          </h3>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left">
              <div>
                <p className="font-bold text-text-main-light dark:text-text-main-dark">{t("Export Data") || "Export Data"}</p>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">{t("Download a copy of all your pet's data") || "Download a copy of all your pet's data"}</p>
              </div>
              <span className="material-icons-round text-gray-400 group-hover:text-primary">download</span>
            </button>

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group text-left">
              <div>
                <p className="font-bold text-red-600 dark:text-red-400">{t("Delete Account") || "Delete Account"}</p>
                <p className="text-sm text-red-400/70 dark:text-red-400/60 mt-1">{t("Permanently remove your account and all data") || "Permanently remove your account and all data"}</p>
              </div>
              <span className="material-icons-round text-red-300 group-hover:text-red-500">delete_forever</span>
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
