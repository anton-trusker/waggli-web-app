
import React, { useState, useRef } from 'react';
import { Pet, Document } from '../../types';
import { useApp } from '../../context/AppContext';
import { analyzeDocument } from '../../services/gemini';
import { uploadFile, deleteFile } from '../../services/storage';

interface DocumentsTabProps {
    pet: Pet;
    onViewDoc: (doc: Document) => void;
}

const DOC_TYPES = ['All', 'Medical', 'Lab Result', 'Insurance', 'RX', 'Imaging', 'Invoice'];

const DocumentsTab: React.FC<DocumentsTabProps> = ({ pet, onViewDoc }) => {
    const { documents, addDocument, deleteDocument } = useApp();
    const [docFilter, setDocFilter] = useState('All');
    const [docSearch, setDocSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const smartInputRef = useRef<HTMLInputElement>(null);

    const petDocs = documents.filter(d => d.petId === pet.id);
    const filteredDocs = petDocs.filter(doc => {
        const matchesType = docFilter === 'All' || doc.type === docFilter;
        const matchesSearch = doc.name.toLowerCase().includes(docSearch.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Upload to Supabase Storage
                // Use a default path if pet.id is missing (shouldn't happen here)
                const targetId = pet.id || 'temp';
                const { url, fullPath } = await uploadFile(file, `documents/${targetId}`);

                const newDoc: Document = {
                    id: Date.now().toString(),
                    petId: pet.id,
                    name: file.name,
                    type: 'Uploaded',
                    date: new Date().toLocaleDateString(),
                    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    icon: 'description',
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    url: url,
                    storagePath: fullPath
                };

                addDocument(newDoc);
            } catch (e) {
                console.error("Upload failed", e);
                // Fallback for demo if upload fails (e.g. offline)
                const newDoc: Document = {
                    id: Date.now().toString(),
                    petId: pet.id,
                    name: file.name,
                    type: 'Uploaded (Local)',
                    date: new Date().toLocaleDateString(),
                    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    icon: 'description',
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    url: URL.createObjectURL(file)
                };
                addDocument(newDoc);
            }
        }
    };

    const handleSmartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsScanning(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const result = await analyzeDocument(base64, file.type);

                // Also upload the file for smart scan
                let fileUrl = URL.createObjectURL(file);
                let storagePath = undefined;

                try {
                    const uploadRes = await uploadFile(file, `documents/${pet.id}`);
                    fileUrl = uploadRes.url;
                    storagePath = uploadRes.fullPath;
                } catch (e) { console.warn("Smart scan upload failed, using local URL"); }

                const newDoc: Document = {
                    id: Date.now().toString(),
                    petId: pet.id,
                    name: result.title || file.name,
                    type: result.type || 'Scanned',
                    date: result.date || new Date().toLocaleDateString(),
                    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    icon: 'auto_awesome',
                    iconBg: 'bg-purple-100',
                    iconColor: 'text-purple-600',
                    url: fileUrl,
                    storagePath: storagePath,
                    notes: result.notes
                };
                addDocument(newDoc);
                setIsScanning(false);
            };
        } catch (err) {
            setIsScanning(false);
        }
    };

    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

    const handleDelete = async (doc: Document) => {
        if (!confirm(`Delete ${doc.name}?`)) return;

        // Optimistic update handled by context, but we should also remove from storage if path exists
        try {
            if (doc.storagePath) {
                await deleteFile(doc.storagePath);
            }
            await deleteDocument(doc.id);
        } catch (e) {
            console.error("Delete failed", e);
            alert("Failed to delete document");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1 sm:w-64">
                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-400'}`}><span className="material-icons-round text-xl">grid_view</span></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-400'}`}><span className="material-icons-round text-xl">view_list</span></button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1">
                    {DOC_TYPES.map(type => (
                        <button key={type} onClick={() => setDocFilter(type)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${docFilter === type ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-surface-dark text-gray-500 border-gray-200 dark:border-gray-700'}`}>{type}</button>
                    ))}
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input type="file" ref={smartInputRef} className="hidden" accept="image/*,.pdf" onChange={handleSmartUpload} />
                    <button onClick={() => smartInputRef.current?.click()} disabled={isScanning} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
                        {isScanning ? <span className="material-icons-round animate-spin">refresh</span> : <span className="material-icons-round">auto_awesome</span>} Smart Scan
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl text-xs font-bold">
                        <span className="material-icons-round">upload_file</span> Upload
                    </button>
                </div>
            </div>

            {viewMode === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className="relative group bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col" onClick={() => setPreviewDoc(doc)}>
                            <div className={`aspect-[4/3] w-full flex items-center justify-center relative overflow-hidden ${doc.url ? 'bg-gray-100' : doc.iconBg}`}>
                                {doc.url && (doc.name.toLowerCase().endsWith('pdf') || doc.type === 'Invoice') ?
                                    <span className="material-icons-round text-5xl text-red-500">picture_as_pdf</span>
                                    : (doc.url ?
                                        <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                                        : <span className={`material-icons-round text-5xl ${doc.iconColor}`}>{doc.icon}</span>
                                    )}
                                {doc.type === 'Scanned' && <div className="absolute top-2 left-2 bg-purple-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-lg">AI Scanned</div>}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">{doc.name}</h4>
                                <div className="flex justify-between text-xs text-gray-500 mt-auto"><span>{doc.date}</span><span>{doc.size}</span></div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/50 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/50"><span className="material-icons-round text-sm">delete</span></button>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {filteredDocs.map((doc, i) => (
                        <div key={doc.id} className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${i !== filteredDocs.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`} onClick={() => setPreviewDoc(doc)}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.iconBg}`}>
                                <span className={`material-icons-round ${doc.iconColor}`}>{doc.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{doc.name}</h4>
                                <p className="text-xs text-gray-500">{doc.date} • {doc.type}</p>
                            </div>
                            <div className="text-xs font-bold text-gray-400">{doc.size}</div>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} className="p-2 text-gray-400 hover:text-red-500"><span className="material-icons-round">delete</span></button>
                        </div>
                    ))}
                    {filteredDocs.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No documents found.</div>}
                </div>
            )}

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setPreviewDoc(null)}>
                    <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col p-4" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPreviewDoc(null)} className="absolute -top-10 right-4 text-white hover:text-gray-300">
                            <span className="material-icons-round text-3xl">close</span>
                        </button>

                        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-surface-light dark:bg-surface-dark">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{previewDoc.name}</h3>
                                    <p className="text-xs text-gray-500">{previewDoc.type} • {previewDoc.date}</p>
                                </div>
                                <a href={previewDoc.url} download target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover">
                                    Download
                                </a>
                            </div>

                            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-black flex items-center justify-center p-4">
                                {previewDoc.url ? (
                                    previewDoc.name.toLowerCase().endsWith('.pdf') || previewDoc.type === 'Invoice' ? (
                                        <iframe src={previewDoc.url} className="w-full h-full min-h-[500px] rounded-lg" title="Document Preview"></iframe>
                                    ) : (
                                        <img src={previewDoc.url} className="max-w-full max-h-full object-contain rounded-lg shadow-md" alt="Preview" />
                                    )
                                ) : (
                                    <div className="text-center p-10">
                                        <span className="material-icons-round text-6xl text-gray-300 mb-4">description</span>
                                        <p className="text-gray-500">Preview not available for this file type.</p>
                                    </div>
                                )}
                            </div>

                            {previewDoc.notes && (
                                <div className="p-6 bg-purple-50 dark:bg-purple-900/10 border-t border-purple-100 dark:border-purple-900/30">
                                    <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                                        <span className="material-icons-round text-base">auto_awesome</span> AI Analysis
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{previewDoc.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsTab;
