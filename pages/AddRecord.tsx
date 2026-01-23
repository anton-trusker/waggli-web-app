
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { analyzeDocument, parseNaturalLanguageRecord } from '../services/gemini';
import { useApp } from '../context/AppContext';
import { VaccineRecord, Medication, Activity, Document } from '../types';
import { uploadFile } from '../services/storage';
import ProviderSelector from '../components/ProviderSelector';

const AddRecord: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { pets } = useApp();

    // Parse query params for initial type
    const searchParams = new URLSearchParams(location.search);
    const initialType = searchParams.get('type');

    const [recordType, setRecordType] = useState<string | null>(initialType);
    const [ocrData, setOcrData] = useState<any>(null);
    const [scannedImage, setScannedImage] = useState<string | null>(null);

    // State for selected pet, defaulting to URL param or first pet
    const [selectedPetId, setSelectedPetId] = useState<string>(id || pets[0]?.id);

    const selectedPet = pets.find(p => p.id === selectedPetId) || pets[0];

    const closeModal = () => navigate(-1);

    // Update recordType if URL changes (e.g. navigation between types)
    useEffect(() => {
        const type = new URLSearchParams(location.search).get('type');
        setRecordType(type);
    }, [location.search]);

    // Handle Smart Scan / NLP Result
    const handleDataComplete = (data: any, imageUrl?: string) => {
        setOcrData(data);
        if (imageUrl) setScannedImage(imageUrl);

        if (data.type) {
            const typeMap: any = {
                'vaccination': 'vaccination',
                'medication': 'medication',
                'vitals': 'vitals',
                'invoice': 'documents',
                'checkup': 'checkup',
                'other': 'medical-note',
                'checkup': 'checkup',
                'other': 'medical-note',
                'medical-note': 'medical-note',
                'allergy': 'allergy'
            };
            setRecordType(typeMap[data.type.toLowerCase()] || 'medical-note');
        }
    };

    const resetForm = () => {
        setRecordType(null);
        setOcrData(null);
        setScannedImage(null);
        // Optional: Clear URL param if resetting to grid
        navigate(location.pathname, { replace: true });
    };

    if (pets.length === 0) {
        return <div className="p-8 text-center">No pets found. Please add a pet first.</div>;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 animate-in fade-in duration-200">
            {/* Background with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

            <div className="relative z-10 w-full md:max-w-2xl bg-surface-light dark:bg-surface-dark rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] transition-all transform animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        {recordType && (
                            <button onClick={resetForm} className="p-1.5 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                                <span className="material-icons-round text-xl">arrow_back</span>
                            </button>
                        )}
                        <h2 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                            {recordType ? `Add ${getRecordTitle(recordType)}` : 'New Health Record'}
                        </h2>
                    </div>
                    <button
                        onClick={closeModal}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-icons-round text-lg">close</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                    {/* Pet Selection - Always Visible but Compact */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-full border border-gray-100 dark:border-gray-800 shadow-inner overflow-x-auto max-w-full">
                            {pets.map(p => {
                                const isSelected = selectedPetId === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPetId(p.id)}
                                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isSelected
                                            ? 'bg-white dark:bg-surface-dark shadow-md ring-1 ring-black/5 dark:ring-white/10 pr-4'
                                            : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className={`rounded-full object-cover transition-all ${isSelected ? 'w-8 h-8' : 'w-6 h-6 grayscale group-hover:grayscale-0'}`}
                                        />
                                        <span className={`text-xs font-bold whitespace-nowrap ${isSelected ? 'text-gray-900 dark:text-white' : 'hidden sm:block'}`}>
                                            {p.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {!recordType ? (
                        <SelectionGrid pet={selectedPet} onSelect={setRecordType} onDataReady={handleDataComplete} />
                    ) : (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <RecordForm
                                type={recordType}
                                pet={selectedPet}
                                onCancel={closeModal}
                                initialData={ocrData}
                                initialImage={scannedImage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ... (Sub-components SelectionGrid, RecordForm, etc. remain unchanged)
const SelectionGrid = ({ pet, onSelect, onDataReady }: { pet: any, onSelect: (type: string) => void, onDataReady: (data: any, imageUrl?: string) => void }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [quickText, setQuickText] = useState('');
    const [isProcessingText, setIsProcessingText] = useState(false);

    // Handle OCR
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const result = await analyzeDocument(base64, file.type);
                onDataReady(result, URL.createObjectURL(file));
            };
        } catch (err) {
            console.error(err);
            alert("Failed to analyze document.");
        } finally {
            setIsScanning(false);
        }
    };

    // Handle NLP Quick Add
    const handleQuickAdd = async () => {
        if (!quickText.trim()) return;
        setIsProcessingText(true);
        try {
            const result = await parseNaturalLanguageRecord(quickText);
            onDataReady(result);
        } catch (error) {
            console.error("Quick Add Failed", error);
            alert("Could not process text.");
        } finally {
            setIsProcessingText(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Features Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Smart Scan */}
                <label className={`relative overflow-hidden cursor-pointer rounded-2xl p-5 border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 hover:border-primary/40 transition-all group flex flex-col justify-between min-h-[140px] ${isScanning ? 'opacity-70 pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-white dark:bg-surface-dark rounded-xl text-primary shadow-sm group-hover:scale-110 transition-transform">
                            {isScanning ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">document_scanner</span>}
                        </div>
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AI</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Smart Scan</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Extract data from receipts or documents instantly.</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>

                {/* Quick NLP */}
                <div className="relative overflow-hidden rounded-2xl p-5 border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/20 flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2.5 bg-white dark:bg-surface-dark rounded-xl text-purple-600 shadow-sm">
                            {isProcessingText ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">auto_awesome</span>}
                        </div>
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AI</span>
                    </div>
                    <div className="mt-auto">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Quick Add</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={quickText}
                                onChange={(e) => setQuickText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                                placeholder="e.g. Max got Rabies vax"
                                className="flex-1 min-w-0 bg-white dark:bg-surface-dark/50 border border-transparent focus:border-purple-400 rounded-lg px-2.5 py-1.5 text-xs focus:ring-0"
                            />
                            <button
                                onClick={handleQuickAdd}
                                disabled={!quickText.trim()}
                                className="bg-purple-600 text-white rounded-lg px-2 flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 transition-colors"
                            >
                                <span className="material-icons-round text-sm">arrow_upward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manual Entry</span>
                <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { id: 'vaccination', label: 'Vaccination', icon: 'vaccines', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { id: 'medication', label: 'Medication', icon: 'medication', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { id: 'vitals', label: 'Vitals', icon: 'monitor_weight', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { id: 'checkup', label: 'Checkup', icon: 'medical_services', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { id: 'documents', label: 'Document', icon: 'description', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { id: 'checkup', label: 'Checkup', icon: 'medical_services', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { id: 'documents', label: 'Document', icon: 'description', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { id: 'medical-note', label: 'Note', icon: 'note_add', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
                    { id: 'allergy', label: 'Allergy', icon: 'warning', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                        <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const RecordForm = ({ type, pet, onCancel, initialData, initialImage }: { type: string, pet: any, onCancel: () => void, initialData?: any, initialImage?: string | null }) => {
    const FormComponent = {
        vaccination: VaccinationForm,
        medication: MedicationForm,
        vitals: VitalsForm,
        documents: DocumentForm,
        vitals: VitalsForm,
        documents: DocumentForm,
        'medical-note': MedicalNoteForm,
        allergy: AllergyForm,
        checkup: CheckupForm,
    }[type];

    if (!FormComponent) return null;

    return <FormComponent onCancel={onCancel} initialData={initialData} petId={pet.id} initialImage={initialImage} />;
};

// ... (Specific Form Components: VaccinationForm, MedicationForm, etc. - ensure they are imported or defined below. Assuming they are part of the file as per original structure, just ensuring no mock data usage)

// [KEEP ALL SUB-FORMS: VaccinationForm, MedicationForm, VitalsForm, DocumentForm, MedicalNoteForm, CheckupForm]
// ... (Specific Form Components)

const AllergyForm = ({ onCancel, initialData, petId }: { onCancel: () => void, initialData?: any, petId: string, initialImage?: string | null }) => {
    const { addActivity, pets, updatePet } = useApp(); // Ideally use addAllergy if exists, else addActivity + updatePet
    const [formData, setFormData] = useState({
        name: initialData?.title || '',
        severity: 'Mild',
        category: 'Food',
        reaction: '',
        emergencyPlan: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Add to Pet's Allergy List (Simple array in current User/Pet model, or new Allergy model)
        // Since we updated types.ts to have Allergy interface, we should ideally have addAllergy in context.
        // For now, we'll update the Pet's allergies array AND add an Activity log.

        const currentPet = pets.find(p => p.id === petId);
        if (currentPet) {
            const newAllergies = [...(currentPet.allergies || []), `${formData.name} (${formData.severity})`];
            updatePet({ ...currentPet, allergies: newAllergies });
        }

        // 2. Add Activity Log
        addActivity({
            id: Date.now().toString(),
            petId,
            type: 'allergy',
            title: `Allergy: ${formData.name}`,
            date: new Date().toISOString().split('T')[0],
            description: `Severity: ${formData.severity}. Reaction: ${formData.reaction}. Plan: ${formData.emergencyPlan}`,
            icon: 'warning',
            colorClass: 'bg-red-100 text-red-600'
        });

        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Allergen Name</label>
                <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder="e.g. Chicken, Pollen, Penicillin"
                    type="text"
                    required
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    >
                        <option>Food</option>
                        <option>Environmental</option>
                        <option>Medication</option>
                        <option>Insect</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity</label>
                    <select
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    >
                        <option>Mild</option>
                        <option>Moderate</option>
                        <option>Severe</option>
                        <option>Anaphylaxis</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reaction Symptoms</label>
                <input
                    value={formData.reaction}
                    onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder="e.g. Itching, Hives, Vomiting"
                    type="text"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Emergency Plan (Optional)</label>
                <textarea
                    value={formData.emergencyPlan}
                    onChange={(e) => setFormData({ ...formData, emergencyPlan: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white h-20 resize-none"
                    placeholder="e.g. Administer Benadryl, Call Vet immediately"
                />
            </div>

            {/* Warning for Severe */}
            {(formData.severity === 'Severe' || formData.severity === 'Anaphylaxis') && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-xl flex items-start gap-3">
                    <span className="material-icons-round text-red-500">warning</span>
                    <p className="text-xs text-red-600 dark:text-red-300">High severity allergies will be pinned to the top of your pet's profile for visibility.</p>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md text-sm transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span> Save Alert
                </button>
            </div>
        </form>
    );
};

// ...
const VaccinationForm = ({ onCancel, initialData, petId, initialImage }: { onCancel: () => void, initialData?: any, petId: string, initialImage?: string | null }) => {
    const { addVaccine, addDocument } = useApp();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        expiryDate: initialData?.expiryDate || '',
        manufacturer: initialData?.manufacturer || '',
        batchNo: initialData?.batchNo || '',
        doctor: initialData?.doctor || '',
        providerId: '',
        providerAddress: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newVax: VaccineRecord = {
            id: Date.now().toString(),
            petId,
            type: formData.title,
            date: formData.date,
            expiryDate: formData.expiryDate || 'N/A',
            manufacturer: formData.manufacturer,
            batchNo: formData.batchNo,
            status: 'Valid',
            providerName: formData.doctor,
            providerId: formData.providerId,
            providerAddress: formData.providerAddress
        };
        providerId: formData.providerId,
            providerAddress: formData.providerAddress,
                notes: formData.notes
    };
    addVaccine(newVax);

    if (formData.setReminder && formData.expiryDate) {
        addReminder({
            id: Date.now().toString(),
            petId,
            title: `${formData.title} Vaccine Due`,
            date: formData.expiryDate,
            time: '09:00',
            priority: 'High',
            repeat: 'Never',
            completed: false
        });
    }
    onCancel();
};

return (
    <form onSubmit={handleSubmit} className="space-y-5">
        {/* ... (Existing JSX) ... */}
        {initialData && (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-xl border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-xs font-medium">
                    <span className="material-icons-round text-base">auto_awesome</span>
                    <span>Data extracted by AI</span>
                </div>
                {initialImage && (
                    <a href={initialImage} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-green-600 hover:underline flex items-center gap-1">
                        <span className="material-icons-round text-sm">visibility</span> Source
                    </a>
                )}
            </div>
        )}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vaccine Name</label>
            <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                placeholder="e.g. Rabies"
                type="text"
                autoFocus
                required
            />
        </div>
        {/* ... Rest of form ... */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date Given</label>
                <input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    type="date"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Next Due</label>
                <input
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    type="date"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Manufacturer</label>
                <input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder="Optional"
                    type="text"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Batch #</label>
                <input
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder="Optional"
                    type="text"
                />
            </div>
        </div>

        <ProviderSelector
            label="Clinic / Provider"
            initialName={formData.doctor}
            onSelect={(name, address, id) => setFormData({ ...formData, doctor: name, providerAddress: address, providerId: id || '' })}
        />

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
            <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white h-20 resize-none"
                placeholder="Side effects, reactions, etc."
            />
        </div>

        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
            <input
                type="checkbox"
                checked={formData.setReminder}
                onChange={(e) => setFormData({ ...formData, setReminder: e.target.checked })}
                className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer"
                id="vaxReminder"
            />
            <label htmlFor="vaxReminder" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                Set reminder for next dose?
            </label>
        </div>

        {/* File Upload */}
        <div className={`border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors ${file ? 'bg-primary/5 border-primary' : ''}`} onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            {file ? (
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="material-icons-round">description</span> {file.name}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <span className="material-icons-round">upload_file</span>
                    <span className="text-xs font-bold uppercase">Attach Certificate / Image</span>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={isUploading} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md text-sm transition-all flex items-center gap-2 disabled:opacity-70">
                {isUploading ? <span className="material-icons-round animate-spin">refresh</span> : <span className="material-icons-round text-lg">check</span>}
                {isUploading ? 'Uploading...' : 'Save'}
            </button>
        </div>
    </form>
);
};

const MedicationForm = ({ onCancel, initialData, petId, initialImage }: { onCancel: () => void, initialData?: any, petId: string, initialImage?: string | null }) => {
    const { addMedication, addDocument } = useApp();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        category: initialData?.category?.toLowerCase() || 'pill',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate || '',
        frequency: initialData?.frequency || '',
        instructions: '',
        notes: '',
        setReminder: false
    });
    const { addReminder } = useApp();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newMed: Medication = {
            id: Date.now().toString(),
            petId,
            name: formData.title,
            category: formData.category,
            startDate: formData.date,
            endDate: formData.endDate,
            frequency: formData.frequency,
            active: !formData.endDate || new Date(formData.endDate) > new Date()
        };
        active: !formData.endDate || new Date(formData.endDate) > new Date(),
            instructions: formData.instructions,
                notes: formData.notes
    };
    addMedication(newMed);

});
        }

// Upload Proof if exists
if (file) {
    setIsUploading(true);
    uploadFile(file, `documents/${petId}`).then(({ url, fullPath }) => {
        addDocument({
            id: Date.now().toString(),
            petId,
            name: `${formData.title} RX`,
            type: 'RX',
            date: formData.date,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            url: url,
            storagePath: fullPath,
            icon: 'prescriptions',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            notes: 'Attached to medication record'
        });
        onCancel();
    }).catch(err => {
        console.error("Upload failed", err);
        onCancel();
    });
} else {
    onCancel();
}
    };

return (
    <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medication Name</label>
            <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                placeholder="e.g. Heartgard"
                type="text"
                autoFocus
                required
            />
        </div>
        {/* ... Rest of Med Form ... */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
                {['Pill', 'Liquid', 'Injection', 'Topical'].map(cat => (
                    <label key={cat} className="cursor-pointer">
                        <input
                            className="peer sr-only"
                            name="category"
                            type="radio"
                            value={cat.toLowerCase()}
                            checked={formData.category === cat.toLowerCase()}
                            onChange={() => setFormData({ ...formData, category: cat.toLowerCase() })}
                        />
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center h-16">
                            <span className="material-symbols-outlined text-xl mb-1 text-gray-400 peer-checked:text-primary">
                                {cat === 'Pill' ? 'pill' : cat === 'Liquid' ? 'water_drop' : cat === 'Injection' ? 'syringe' : 'healing'}
                            </span>
                            <span className="text-[10px] font-bold">{cat}</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    type="date"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    type="date"
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequency</label>
            <input
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                placeholder="e.g. Twice Daily"
                type="text"
            />
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions</label>
            <input
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                placeholder="e.g. With food"
                type="text"
            />
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
            <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white h-20 resize-none"
                placeholder="Additional details..."
            />
        </div>

        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
            <input
                type="checkbox"
                checked={formData.setReminder}
                onChange={(e) => setFormData({ ...formData, setReminder: e.target.checked })}
                className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer"
                id="medReminder"
            />
            <label htmlFor="medReminder" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                Set daily reminder?
            </label>
        </div>

        {/* File Upload */}
        <div className={`border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors ${file ? 'bg-primary/5 border-primary' : ''}`} onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            {file ? (
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="material-icons-round">description</span> {file.name}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <span className="material-icons-round">upload_file</span>
                    <span className="text-xs font-bold uppercase">Attach RX / Image</span>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={isUploading} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md text-sm transition-all flex items-center gap-2 disabled:opacity-70">
                {isUploading ? <span className="material-icons-round animate-spin">refresh</span> : <span className="material-icons-round text-lg">check</span>}
                {isUploading ? 'Uploading...' : 'Save'}
            </button>
        </div>
    </form>
);
};

const VitalsForm = ({ onCancel, initialData, petId, initialImage }: { onCancel: () => void, initialData?: any, petId: string, initialImage?: string | null }) => {
    const { addActivity, updatePet, pets } = useApp();
    const [vitals, setVitals] = useState({
        weight: initialData?.weight || '',
        height: initialData?.height || '',
        temp: initialData?.temperature || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 1. Add History Record
        const newActivity: Activity = {
            id: Date.now().toString(),
            petId,
            type: 'vitals',
            title: 'Vitals Logged',
            date: new Date().toISOString().split('T')[0],
            description: `Weight: ${vitals.weight || 'N/A'}, Height: ${vitals.height || 'N/A'}, Temp: ${vitals.temp || 'N/A'}`,
            icon: 'monitor_weight',
            colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        };
        addActivity(newActivity);

        // 2. Update Pet Profile if weight changed
        if (vitals.weight || vitals.height) {
            const currentPet = pets.find(p => p.id === petId);
            if (currentPet) {
                updatePet({
                    ...currentPet,
                    weight: vitals.weight || currentPet.weight,
                    height: vitals.height || currentPet.height
                });
            }
        }
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... Form UI ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-gray-500">
                        <span className="material-symbols-outlined text-primary text-lg">monitor_weight</span>
                        <span className="font-bold text-xs uppercase tracking-wide">Weight</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            value={vitals.weight}
                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                            className="bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-0 p-0 text-xl font-bold text-gray-900 dark:text-white w-full placeholder-gray-300"
                            placeholder="0.0"
                            type="text"
                        />
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-gray-500">
                        <span className="material-symbols-outlined text-primary text-lg">straighten</span>
                        <span className="font-bold text-xs uppercase tracking-wide">Height</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            value={vitals.height}
                            onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                            className="bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-0 p-0 text-xl font-bold text-gray-900 dark:text-white w-full placeholder-gray-300"
                            placeholder="0.0"
                            type="text"
                        />
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-gray-500">
                        <span className="material-symbols-outlined text-primary text-lg">device_thermostat</span>
                        <span className="font-bold text-xs uppercase tracking-wide">Temp</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            value={vitals.temp}
                            onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                            className="bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-0 p-0 text-xl font-bold text-gray-900 dark:text-white w-full placeholder-gray-300"
                            placeholder="0.0"
                            type="text"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md text-sm transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span> Save Log
                </button>
            </div>
        </form>
    );
};

const DocumentForm = ({ onCancel, initialData, petId, initialImage }: { onCancel: () => void, initialData?: any, petId: string, initialImage?: string | null }) => {
    const { addDocument } = useApp();
    const [docType, setDocType] = useState('Medical');
    const [docName, setDocName] = useState(initialData?.title || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scanInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!docName) setDocName(selectedFile.name);
            // Create preview if image
            if (selectedFile.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleSmartScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setFile(file); // Set file as the one being uploaded
        setPreviewUrl(URL.createObjectURL(file)); // Show preview immediately

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const result = await analyzeDocument(base64, file.type);

                if (result) {
                    if (result.title) setDocName(result.title);
                    if (result.date) setDate(result.date);
                    // Auto-select type if detected
                    if (result.type) {
                        const typeMap: any = { 'invoice': 'Invoice', 'prescription': 'RX', 'lab': 'Lab Results', 'medical': 'Medical' };
                        if (typeMap[result.type]) setDocType(typeMap[result.type]);
                    }
                }
                setIsScanning(false);
            };
        } catch (err) {
            console.error("Internal Scan Error", err);
            setIsScanning(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newDoc: Document = {
            id: Date.now().toString(),
            petId,
            name: docName || 'Untitled Document',
            type: docType,
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            size: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '0 KB',
            icon: docType === 'Medical' ? 'medical_services' : docType === 'Lab Results' ? 'biotech' : 'description',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            url: previewUrl || undefined,
            notes: 'Uploaded via Add Record'
        };
        addDocument(newDoc);
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* File Upload Zone */}
            <div className="relative">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    {(file || previewUrl) ? (
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-icons-round text-3xl text-gray-400">description</span>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{file ? file.name : 'Scanned Document'}</p>
                                <p className="text-xs text-gray-500">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Image Data'}</p>
                            </div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }} className="p-2 text-gray-400 hover:text-red-500">
                                <span className="material-icons-round">delete</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-icons-round text-2xl">upload_file</span>
                            </div>
                            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">Click to upload document</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                        </>
                    )}
                </div>

                {/* Smart Scan Overlay Button */}
                {!file && !previewUrl && (
                    <div className="absolute bottom-4 right-4">
                        <input type="file" ref={scanInputRef} className="hidden" accept="image/*" onChange={handleSmartScan} />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); scanInputRef.current?.click(); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
                        >
                            {isScanning ? <span className="material-icons-round animate-spin text-sm">refresh</span> : <span className="material-icons-round text-sm">auto_awesome</span>}
                            {isScanning ? 'Scanning...' : 'Smart Scan'}
                        </button>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Document Type</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {['Medical', 'Lab Results', 'RX', 'Invoice', 'Insurance'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setDocType(type)}
                            className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${docType === type
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl mb-1">
                                {type === 'Lab Results' ? 'biotech' : type === 'RX' ? 'prescriptions' : type === 'Medical' ? 'medical_services' : type === 'Invoice' ? 'receipt' : 'verified_user'}
                            </span>
                            <span className="text-[10px] font-bold">{type}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document Name</label>
                    <input
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                        placeholder="e.g. Blood Test Result"
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md text-sm transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span> Save
                </button>
            </div>
        </form>
    );
};

const MedicalNoteForm = ({ onCancel, initialData, petId, initialImage }: { onCancel: () => void, initialData?: any, petId: string, initialImage?: string | null }) => {
    const { addActivity } = useApp();
    const [formData, setFormData] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        title: initialData?.title || '',
        details: initialData?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newActivity: Activity = {
            id: Date.now().toString(),
            petId,
            type: 'medical',
            title: formData.title || 'Medical Note',
            date: formData.date,
            description: formData.details,
            icon: 'note_add',
            colorClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
        };
        addActivity(newActivity);
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... Form UI ... */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                        type="date"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                    <input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                        placeholder="e.g. Limping on left leg"
                        type="text"
                        autoFocus
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Details</label>
                <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full p-4 h-32 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-primary dark:text-white resize-none"
                    placeholder="Describe symptoms, behavior changes, etc."
                    required
                ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md text-sm transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span> Save
                </button>
            </div>
        </form>
    );
};

const CheckupForm = ({ onCancel, initialData, petId, initialImage }: { onCancel: () => void, initialData?: any, petId: string, initialImage?: string | null }) => {
    const { addActivity } = useApp();
    const [formData, setFormData] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        doctor: initialData?.doctor || '',
        notes: initialData?.notes || '',
        providerId: '',
        providerAddress: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newActivity: Activity = {
            id: Date.now().toString(),
            petId,
            type: 'checkup',
            title: `Vet Visit: ${formData.doctor || 'General Checkup'}`,
            date: formData.date,
            description: formData.notes,
            icon: 'medical_services',
            colorClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            providerName: formData.doctor,
            providerId: formData.providerId,
            providerAddress: formData.providerAddress
        };
        addActivity(newActivity);
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... Form UI ... */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    type="date"
                    required
                />
            </div>

            <ProviderSelector
                label="Clinic / Doctor"
                initialName={formData.doctor}
                onSelect={(name, address, id) => setFormData({ ...formData, doctor: name, providerAddress: address, providerId: id || '' })}
            />

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes & Results</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full h-24 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white resize-none"
                    placeholder="Doctor's comments, diagnosis, etc."
                ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md text-sm transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check</span> Save
                </button>
            </div>
        </form>
    );
};

const getRecordTitle = (type: string) => {
    switch (type) {
        case 'vaccination': return 'Vaccination';
        case 'medication': return 'Medication';
        case 'vitals': return 'Health & Vitals';
        case 'documents': return 'Document';
        case 'medical-note': return 'Note';
        case 'checkup': return 'Checkup';
        default: return 'Record';
    }
}

export default AddRecord;
