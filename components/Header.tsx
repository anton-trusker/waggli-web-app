
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePlatform } from '../context/PlatformContext';
import { useLocalization } from '../context/LocalizationContext';

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title, subtitle }) => {
    const { user, notifications, markAllNotificationsRead, markNotificationRead, isAdminMode, toggleAdminMode } = useApp();
    const { settings } = usePlatform();
    const { t } = useLocalization();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAdminToggle = () => {
        toggleAdminMode();
        // Redirect to appropriate dashboard on toggle
        if (!isAdminMode) {
            navigate('/admin');
        } else {
            navigate('/');
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-24 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 md:px-8 transition-colors duration-200">
            <div className="flex items-center gap-6">
                {/* Logo Section */}
                <Link to={isAdminMode ? "/admin" : "/"} className="flex items-center gap-3 group mr-4 lg:w-52">
                    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                        {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
                        ) : (
                            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="header_brand_gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                        <stop stopColor={isAdminMode ? "#1F2937" : "#3B82F6"} />
                                        <stop offset="1" stopColor={isAdminMode ? "#4B5563" : "#14B8A6"} />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M8 16L16 36L24 20L32 36L40 16"
                                    stroke="url(#header_brand_gradient)"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none group-hover:text-primary transition-colors font-sans">
                            {isAdminMode ? `${settings.platformName} Admin` : settings.platformName}
                        </h1>
                    </div>
                </Link>

                {/* Title Section - Hidden on small mobile, visible on tablet/desktop */}
                <div className="hidden md:block">
                    {title ? (
                        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                            {title}
                        </h2>
                    ) : (
                        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                            {isAdminMode ? t('Platform Overview') : `${t('Welcome back')}, ${user.name.split(' ')[0]}!`}
                            <span className="text-2xl">{isAdminMode ? '📊' : '👋'}</span>
                        </h2>
                    )}
                    {subtitle && <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">{subtitle}</p>}
                    {!title && !subtitle && <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
                        {isAdminMode ? t('Manage users, subscriptions, and platform settings.') : t("Here's what's happening today")}
                    </p>}
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 ml-4">

                {/* Admin Switcher */}
                <button
                    onClick={handleAdminToggle}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${isAdminMode
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900'
                            : 'bg-white dark:bg-surface-dark text-gray-500 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
                        }`}
                    title={isAdminMode ? "Switch to User View" : "Switch to Admin Panel"}
                >
                    <span className="material-icons-round text-lg">{isAdminMode ? 'dashboard' : 'admin_panel_settings'}</span>
                    <span className="text-xs font-bold hidden sm:inline">{isAdminMode ? t('Exit Admin') : t('Admin Panel')}</span>
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-xl transition-colors ${showNotifications ? 'bg-gray-100 dark:bg-gray-700 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <span className="material-icons-round">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-surface-dark"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">{t('Notifications')}</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllNotificationsRead} className="text-xs font-bold text-primary hover:text-primary-hover">
                                        {t('Mark all read')}
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(note => (
                                        <div
                                            key={note.id}
                                            onClick={() => markNotificationRead(note.id)}
                                            className={`p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${!note.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!note.read ? 'bg-primary' : 'bg-transparent'}`}></div>
                                                <div>
                                                    <h4 className={`text-sm font-bold ${!note.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{note.title}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{note.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">{note.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400">{t('No notifications.')}</div>
                                )}
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-center">
                                <Link to="/settings" className="text-xs font-bold text-gray-500 hover:text-primary transition-colors">{t('Settings')}</Link>
                            </div>
                        </div>
                    )}
                </div>

                {!isAdminMode && (
                    <Link to="/appointments" className="hidden lg:block p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <span className="material-icons-round">calendar_today</span>
                    </Link>
                )}

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
                    <img
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary transition-all"
                        src={user.image}
                    />
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">{isAdminMode ? t('Administrator') : t('Pet Parent')}</p>
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Header;
