
import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import { usePlatform } from '../../context/PlatformContext';
import { useLocalization } from '../../context/LocalizationContext';
import { updatePlatformSettings, getAllLanguages, updateLanguageStatus, getTranslations, saveTranslation } from '../../services/db';
import { uploadFile } from '../../services/storage';
import { generateBulkTranslations } from '../../services/gemini';
import { TranslationItem, SupportedLanguage } from '../../types';
import { AuditLogViewer } from '../../components/admin/AuditLogViewer';

const AdminSettings: React.FC = () => {
    const { settings, updateLocalSettings } = usePlatform();
    const { refreshTranslations } = useLocalization();
    const [activeTab, setActiveTab] = useState<'Branding' | 'Localization' | 'Modules' | 'Audit Logs'>('Branding');
    const [loading, setLoading] = useState(false);

    // Branding State
    const [brandForm, setBrandForm] = useState(settings);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const iconInputRef = useRef<HTMLInputElement>(null);
    const aiIconInputRef = useRef<HTMLInputElement>(null);

    // Localization State
    const [allLanguages, setAllLanguages] = useState<SupportedLanguage[]>([]);
    const [translationList, setTranslationList] = useState<TranslationItem[]>([]);
    const [newKey, setNewKey] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (activeTab === 'Branding') setBrandForm(settings);
        if (activeTab === 'Localization') loadLocalizationData();
    }, [activeTab, settings]);

    const loadLocalizationData = async () => {
        const langs = await getAllLanguages();
        setAllLanguages(langs);
        const trans = await getTranslations();
        setTranslationList(Object.values(trans));
    };

    // --- BRANDING HANDLERS ---
    const handleBrandSave = async () => {
        setLoading(true);
        await updatePlatformSettings(brandForm);
        updateLocalSettings(brandForm);
        setLoading(false);
        alert("Branding settings updated!");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url' | 'icon_url' | 'ai_icon_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const { url } = await uploadFile(file, `platform/${field}`);
            setBrandForm(prev => ({ ...prev, [field]: url }));
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // --- LOCALIZATION HANDLERS ---
    const toggleLanguage = async (code: string, currentStatus: boolean) => {
        await updateLanguageStatus(code, !currentStatus);
        loadLocalizationData();
        refreshTranslations();
    };

    const handleAddTranslation = async () => {
        if (!newKey) return;
        setIsTranslating(true);

        // Get active target languages (exclude English)
        const targets = allLanguages.filter(l => l.isActive && l.code !== 'en').map(l => l.code);

        // AI Translate
        const aiResults = await generateBulkTranslations(newKey, targets);

        const newEntry = {
            en: newKey,
            ...aiResults
        };

        await saveTranslation(newKey, newEntry);
        setNewKey('');
        loadLocalizationData();
        setIsTranslating(false);
        refreshTranslations();
    };

    return (
        <>
            <Header onMenuClick={() => { }} title="Global Settings" />
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
                    {['Branding', 'Localization', 'Modules', 'Audit Logs'].map(tab => (
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

                {activeTab === 'Branding' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visual Identity</h3>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Platform Name</label>
                                <input
                                    type="text"
                                    value={brandForm.platformName}
                                    onChange={(e) => setBrandForm({ ...brandForm, platformName: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={brandForm.primaryColor}
                                        onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                                        className="h-10 w-20 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={brandForm.primaryColor}
                                        onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo</label>
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-gray-800"
                                    >
                                        {brandForm.logo_url ? <img src={brandForm.logo_url} className="h-16 object-contain" /> : <span className="text-gray-400 text-xs">Upload</span>}
                                    </div>
                                    <input type="file" ref={logoInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">App Icon</label>
                                    <div
                                        onClick={() => iconInputRef.current?.click()}
                                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-gray-800"
                                    >
                                        {brandForm.favicon_url ? <img src={brandForm.favicon_url} className="h-12 w-12 object-contain" /> : <span className="text-gray-400 text-xs">Upload</span>}
                                    </div>
                                    <input type="file" ref={iconInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'favicon_url')} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">AI Icon</label>
                                    <div
                                        onClick={() => aiIconInputRef.current?.click()}
                                        className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-gray-800"
                                    >
                                        {brandForm.ai_icon_url ? <img src={brandForm.ai_icon_url} className="h-12 w-12 object-contain rounded-full" /> : <span className="material-icons-round text-primary text-3xl">smart_toy</span>}
                                    </div>
                                    <input type="file" ref={aiIconInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'ai_icon_url')} />
                                </div>
                            </div>

                            <button onClick={handleBrandSave} disabled={loading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-100 dark:bg-black/20 p-8 rounded-3xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-[300px] h-[500px] bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl border-4 border-gray-200 dark:border-gray-700 overflow-hidden relative flex flex-col">
                                <div className="bg-surface-light dark:bg-surface-dark border-b p-4 flex items-center gap-3">
                                    <img src={brandForm.logo_url || brandForm.favicon_url} className="w-8 h-8 object-contain" />
                                    <span className="font-bold text-gray-900 dark:text-white" style={{ color: brandForm.primaryColor }}>{brandForm.platformName}</span>
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
                                    <div className="h-32 rounded-2xl mb-4 opacity-50" style={{ backgroundColor: brandForm.primaryColor }}></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Localization' && (
                    <div className="space-y-8 animate-in fade-in">

                        {/* Language Toggles */}
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Supported Languages</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {allLanguages.map(lang => (
                                    <div key={lang.code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{lang.flag}</span>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{lang.name}</p>
                                                <p className="text-xs text-gray-500 uppercase">{lang.code}</p>
                                            </div>
                                        </div>
                                        {!lang.isDefault && (
                                            <button
                                                onClick={() => toggleLanguage(lang.code, lang.isActive)}
                                                className={`w-10 h-6 rounded-full p-1 transition-colors ${lang.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${lang.isActive ? 'translate-x-4' : ''}`}></div>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Translation Manager */}
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Translations</h3>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Enter text (English)..."
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        className="flex-1 md:w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        onClick={handleAddTranslation}
                                        disabled={!newKey || isTranslating}
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isTranslating ? <span className="material-icons-round animate-spin">refresh</span> : <span className="material-icons-round">auto_awesome</span>}
                                        {isTranslating ? 'Translating...' : 'Add & Translate'}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase font-bold text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Key (English)</th>
                                            {allLanguages.filter(l => l.isActive && l.code !== 'en').map(l => (
                                                <th key={l.code} className="px-6 py-3">{l.name}</th>
                                            ))}
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {translationList.map((item) => (
                                            <tr key={item.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/20">
                                                <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{item.key}</td>
                                                {allLanguages.filter(l => l.isActive && l.code !== 'en').map(l => (
                                                    <td key={l.code} className="px-6 py-3 text-gray-600 dark:text-gray-300">
                                                        {item.translations[l.code] || '-'}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-3 text-right">
                                                    <button className="text-primary hover:underline font-bold text-xs">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {translationList.length === 0 && (
                                            <tr><td colSpan={10} className="text-center py-8 text-gray-400">No translations found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {/* --- MODULES TAB --- */}
                {activeTab === 'Modules' && (
                    <div className="animate-in fade-in space-y-8">
                        <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Feature Modules</h3>
                                    <p className="text-sm text-gray-500 mt-1">Enable or disable core platform features globally.</p>
                                </div>
                                <button onClick={handleBrandSave} disabled={loading} className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {brandForm.modules && Object.entries(brandForm.modules).map(([key, isEnabled]: [string, any]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                                <span className="material-icons-round text-xl">
                                                    {key.includes('ai') ? 'smart_toy' :
                                                        key.includes('pro') ? 'verified_user' :
                                                            key.includes('sub') ? 'card_membership' :
                                                                key.includes('com') ? 'forum' : 'apps'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white capitalize">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-gray-500">Global Feature</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setBrandForm(prev => ({
                                                ...prev,
                                                modules: { ...prev.modules, [key]: !isEnabled }
                                            }))}
                                            className={`w-12 h-7 rounded-full p-1 transition-colors ${isEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-5' : ''}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                                <span className="material-icons-round text-yellow-500">info</span>
                                <p>Disabling a module will hide it from the navigation menu and prevent access for all users immediately.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- AUDIT LOGS TAB --- */}
                {activeTab === 'Audit Logs' && (
                    <div className="animate-in fade-in">
                        <AuditLogViewer />
                    </div>
                )}

            </div>
        </>
    );
};

export default AdminSettings;
