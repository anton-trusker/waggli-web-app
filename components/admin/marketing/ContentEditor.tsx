
import React, { useState } from 'react';
import { generateMarketingContent } from '../../../services/marketing';
import { uploadFile } from '../../../services/storage';

interface ContentEditorProps {
    type: 'banner' | 'email' | 'notification' | 'post' | 'popup';
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ type, initialData, onSave, onCancel }) => {
    const [data, setData] = useState(initialData || {
        title: '',
        body: '',
        cta_text: '',
        cta_link: '',
        media_url: '',
        placement_zone: 'default'
    });
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateMarketingContent(aiPrompt, type, 'Professional');
            setData(prev => ({ ...prev, title: result.title, body: result.body }));
        } catch (e) {
            alert('AI Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const { url } = await uploadFile(file, 'marketing');
            setData(prev => ({ ...prev, media_url: url }));
        } catch (e) {
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold mb-6 capitalize">Design {type}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* EDITOR */}
                <div className="space-y-4">
                    {/* AI Generator */}
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 mb-6">
                        <label className="text-xs font-bold text-purple-600 uppercase mb-2 block">✨ AI Magic Writer</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="e.g. Summer sale for dog toys..."
                                className="flex-1 p-2 rounded-lg border border-purple-200 text-sm"
                            />
                            <button
                                onClick={handleAiGenerate}
                                disabled={isGenerating || !aiPrompt}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                                {isGenerating ? 'Writing...' : 'Generate'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Headline / Subject</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => setData({ ...data, title: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Body Content</label>
                        <textarea
                            rows={type === 'email' ? 8 : 3}
                            value={data.body}
                            onChange={e => setData({ ...data, body: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200 outline-none resize-none"
                        ></textarea>
                    </div>

                    {(type === 'banner' || type === 'post' || type === 'popup') && (
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Media Image</label>
                            <div className="flex items-center gap-4">
                                <input type="file" onChange={handleFileUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                {isUploading && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">CTA Text</label>
                            <input type="text" value={data.cta_text} onChange={e => setData({ ...data, cta_text: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">CTA Link</label>
                            <input type="text" value={data.cta_link} onChange={e => setData({ ...data, cta_link: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200 outline-none" />
                        </div>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="bg-gray-100 dark:bg-black/50 rounded-2xl p-6 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-full max-w-sm">
                        <p className="text-center text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Live Preview ({type})</p>

                        {type === 'banner' && (
                            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden">
                                {data.media_url && <img src={data.media_url} className="w-full h-32 object-cover" />}
                                <div className="p-4">
                                    <h4 className="font-bold text-lg mb-1">{data.title || 'Your Headline'}</h4>
                                    <p className="text-sm text-gray-500 mb-3">{data.body || 'Your body text goes here...'}</p>
                                    {data.cta_text && (
                                        <button className="w-full py-2 bg-primary text-white font-bold rounded-lg text-sm">{data.cta_text}</button>
                                    )}
                                </div>
                            </div>
                        )}

                        {type === 'notification' && (
                            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-md p-3 flex gap-3 items-start border-l-4 border-primary">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><span className="material-icons-round text-sm">notifications</span></div>
                                <div>
                                    <h4 className="font-bold text-sm">{data.title || 'Notification Title'}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">{data.body || 'Notification body text...'}</p>
                                </div>
                            </div>
                        )}

                        {type === 'email' && (
                            <div className="bg-white rounded-none shadow-sm border border-gray-200 p-6">
                                <div className="border-b pb-4 mb-4 text-center">
                                    <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2"></div>
                                    <h2 className="font-serif text-xl text-gray-900">{data.title || 'Email Subject Line'}</h2>
                                </div>
                                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {data.body || 'Dear user,\n\nWrites something amazing here...'}
                                </div>
                                {data.cta_text && (
                                    <div className="mt-6 text-center">
                                        <button className="px-6 py-2 bg-primary text-white font-bold rounded-full text-sm">{data.cta_text}</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button onClick={onCancel} className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button onClick={() => onSave(data)} className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg">Save Creative</button>
            </div>
        </div>
    );
};
