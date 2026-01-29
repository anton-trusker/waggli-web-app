
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Pet, VaccineRecord, Medication, PetDocument } from '../types';
import { generatePetAvatar } from '../services/gemini';
import { uploadFile } from '../services/storage';
import { supabase } from '../services/supabase';
import { useBreeds } from '../hooks/useBreeds';
import { useColors } from '../hooks/useColors';
import { useSpecies } from '../hooks/useSpecies';


// --- Constants & Options ---
const BLOOD_TYPES: any = {
    Dog: ['DEA 1.1 Negative', 'DEA 1.1 Positive', 'DEA 1.2', 'DEA 3', 'DEA 4', 'DEA 5', 'DEA 7', 'Unknown'],
    Cat: ['Type A', 'Type B', 'Type AB', 'Unknown'],
    Other: ['Unknown']
};

const COAT_TYPES = ['Short / Smooth', 'Long / Silky', 'Long / Wavy', 'Double Coat', 'Wirehaired', 'Curly / Wool', 'Hairless'];
const TAIL_TYPES = ['Long', 'Short/Docked', 'Curled', 'Bobtail', 'None'];
const EAR_TYPES = ['Prick/Upright', 'Floppy/Drop', 'Button', 'Rose', 'Cropped'];
const EYE_COLORS = ['Brown', 'Amber', 'Blue', 'Green', 'Hazel', 'Heterochromia (Different Colors)'];
const ALERT_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF', border: true },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Golden', hex: '#FFD700' },
    { name: 'Grey', hex: '#808080' },
    { name: 'Cream', hex: '#FFFDD0', border: true },
    { name: 'Red', hex: '#B22222' },
    { name: 'Tricolor', gradient: 'linear-gradient(135deg, #000 33%, #8B4513 33%, #8B4513 66%, #fff 66%)' },
    { name: 'Merle', gradient: 'repeating-linear-gradient(45deg, #808080, #808080 10px, #000 10px, #000 20px)' },
    { name: 'Spotted', radial: 'radial-gradient(circle, #000 20%, #fff 20%)', border: true }
];

interface FormData {
    type: string;
    customType?: string;
    name: string;
    gender: string;
    breed: string;
    color: string;
    birthDate: string;
    microchipId: string;
    microchipType: 'Chip' | 'Tattoo';
    weight: string;
    weightUnit: 'kg' | 'lb';
    height: string;
    heightUnit: 'cm' | 'in';
    bloodType: string;
    neutered: boolean;
    allergies: string[];
    personality: string[];
    image: string;
    coatType: string;
    tailType: string;
    earType: string;
    eyeColor: string;
    passportNumber: string;
    passportIssuer: string;
    registrationNumber: string;
    veterinarian: string;
    veterinarianContact: string;
    distinguishingMarks: string;
    passportDate: string;
    notes: string;
}

const AddPet: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addPet, updatePet, addVaccine, addMedication, addDocument, pets, staticData, user } = useApp();
    const isEditMode = Boolean(id);
    const petToEdit = isEditMode ? pets.find(p => p.id === id) : null;

    const [step, setStep] = useState(1);
    const totalSteps = 4;
    const [isGenerating, setIsGenerating] = useState(false);

    // Pending records to be added after pet creation
    const [newVaccines, setNewVaccines] = useState<Partial<VaccineRecord>[]>([]);
    const [newMeds, setNewMeds] = useState<Partial<Medication>[]>([]);
    const [newDocs, setNewDocs] = useState<Partial<PetDocument>[]>([]);

    // Hooks
    const { species: speciesList, loading: loadingSpecies } = useSpecies();
    const { colors: colorList, loading: loadingColors } = useColors();
    // We defer breed loading until we render the field to depend on selected species

    // Initialize Data
    const [formData, setFormData] = useState<FormData>(() => {
        if (petToEdit) {
            return {
                type: petToEdit.type.toLowerCase(),
                customType: '',
                name: petToEdit.name,
                gender: petToEdit.gender?.toLowerCase() || 'male',
                breed: petToEdit.breed,
                color: petToEdit.color || '',
                birthDate: petToEdit.birthday ? new Date(petToEdit.birthday).toISOString().split('T')[0] : '',
                microchipId: petToEdit.microchipId || '',
                microchipType: 'Chip', // Default or infer?
                weight: petToEdit.weight.replace(/[^\d.]/g, ''),
                weightUnit: petToEdit.weight.includes('kg') ? 'kg' : 'lb',
                height: petToEdit.height?.replace(/[^\d.]/g, '') || '',
                heightUnit: 'cm',
                bloodType: petToEdit.bloodType || '',
                neutered: petToEdit.neutered || false,
                allergies: petToEdit.allergies || [],
                personality: petToEdit.personality || [],
                image: petToEdit.image,
                coatType: petToEdit.coatType || '',
                tailType: petToEdit.tailType || '',
                earType: petToEdit.earType || '',
                eyeColor: petToEdit.eyeColor || '',
                passportNumber: petToEdit.passportNumber || '',
                passportIssuer: petToEdit.passportIssuer || '',
                registrationNumber: petToEdit.registrationNumber || '',
                veterinarian: petToEdit.veterinarian || '',
                veterinarianContact: petToEdit.veterinarianContact || '',
                distinguishingMarks: petToEdit.distinguishingMarks || '',
                passportDate: petToEdit.passportDate || '',
                notes: petToEdit.breedNotes || ''
            };
        }
        return {
            type: 'dog',
            customType: '',
            name: '',
            gender: 'male',
            breed: '',
            color: '',
            birthDate: '',
            microchipId: '',
            microchipType: 'Chip',
            weight: '',
            weightUnit: 'kg',
            height: '',
            heightUnit: 'cm',
            bloodType: '',
            neutered: false,
            allergies: [],
            personality: [],
            image: '',
            coatType: '',
            tailType: '',
            earType: '',
            eyeColor: '',
            passportNumber: '',
            passportIssuer: '',
            registrationNumber: '',
            veterinarian: '',
            veterinarianContact: '',
            distinguishingMarks: '',
            passportDate: '',
            notes: ''
        };
    });

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleFinish = async () => {
        setIsGenerating(true);

        try {
            // 1. Handle Image
            let finalImage = formData.image;
            if (!finalImage) {
                const typeStr = formData.type === 'other' ? formData.customType : formData.type;
                const desc = `A cute ${formData.color} ${formData.breed} ${typeStr} named ${formData.name}, style 3d render avatar`;
                try {
                    const aiImage = await generatePetAvatar(desc);
                    if (aiImage) finalImage = aiImage;
                } catch (e) {
                    console.error("Avatar Gen Error", e);
                    // Use fallback image if AI generation fails
                    finalImage = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300';
                }
            }

            // 2. Prepare Pet Object with all required fields
            const typeDisplay = formData.type === 'other' && formData.customType
                ? formData.customType
                : formData.type.charAt(0).toUpperCase() + formData.type.slice(1);

            // Determine species_id from type
            const selectedSpecies = speciesList?.find((s: any) => s.code === formData.type);
            const speciesId = selectedSpecies?.id;

            const petObj: Partial<Pet> = {
                name: formData.name || 'Unnamed Pet',
                breed: formData.breed || 'Unknown',
                type: typeDisplay,
                species_id: speciesId, // New Field
                weight: formData.weight ? `${formData.weight} ${formData.weightUnit}` : 'Unknown',
                image: finalImage || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300',
                status: 'Healthy',
                color: formData.color || 'Unknown',
                gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
                birthday: formData.birthDate || undefined,
                microchipId: formData.microchipId || undefined,
                bloodType: formData.bloodType || undefined,
                allergies: formData.allergies || [],
                personality: formData.personality || [],
                coatType: formData.coatType || undefined,
                tailType: formData.tailType || undefined,
                earType: formData.earType || undefined,
                eyeColor: formData.eyeColor || undefined,
                height: formData.height ? `${formData.height} ${formData.heightUnit}` : undefined,
                passportNumber: formData.passportNumber || undefined,
                passportIssuer: formData.passportIssuer || undefined,
                passportDate: formData.passportDate || undefined,
                registrationNumber: formData.registrationNumber || undefined,
                veterinarian: formData.veterinarian || undefined,
                veterinarianContact: formData.veterinarianContact || undefined,
                distinguishingMarks: formData.distinguishingMarks || undefined,
                microchipType: formData.microchipType || 'Chip',
                neutered: formData.neutered || false
            };

            // 3. Save Pet
            let savedPet: Pet | null = null;

            if (isEditMode && id) {
                await updatePet({ ...petObj, id } as Pet);
                savedPet = { ...petObj, id } as Pet;
            } else {
                const created = await addPet(petObj as Pet);
                savedPet = created ?? null;
            }

            const savedPetId = savedPet?.id;

            // 4. Save Pending Records
            if (savedPetId) {
                // Save Vaccines
                for (const v of newVaccines) {
                    if (v.type && v.date) {
                        await addVaccine({ ...v, petId: savedPetId, ownerId: user?.id } as VaccineRecord);
                    }
                }

                // Save Meds
                for (const m of newMeds) {
                    if (m.name) {
                        await addMedication({ ...m, petId: savedPetId, ownerId: user?.id } as Medication);
                    }
                }

                // Save Documents
                for (const d of newDocs) {
                    await addDocument({ ...d, petId: savedPetId } as PetDocument);
                }
            }

            // 5. Navigate to pets page on success
            navigate('/pets');
        } catch (error) {
            console.error('Error saving pet:', error);
            // Show error message to user
            alert('There was an error saving your pet. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };



    const getAgeFromDate = (dateStr: string) => {
        if (!dateStr) return 'Unknown';
        const today = new Date();
        const birthDate = new Date(dateStr);
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }
        return years > 0 ? `${years} yr ${months > 0 ? `${months} mo` : ''}` : `${months} mo`;
    };

    const progressPercentage = (step / totalSteps) * 100;

    const props = {
        formData,
        update: updateFormData,
        newVaccines, setNewVaccines,
        newMeds, setNewMeds,
        newDocs, setNewDocs,
        petId: isEditMode ? id : 'temp',
        speciesList,
        colorList
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Header */}
            <header className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-icons-round text-gray-500 dark:text-gray-400">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{isEditMode ? 'Edit Profile' : 'Add New Pet'}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Step {step} of {totalSteps}</span>
                            <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => navigate('/')}>
                    Cancel
                </button>
            </header>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden justify-center bg-gray-50 dark:bg-black/20">
                <div className="w-full max-w-3xl overflow-y-auto custom-scrollbar p-6 md:p-8 pb-32">
                    <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        {step === 1 && <StepIdentity {...props} />}
                        {step === 2 && <StepAppearance {...props} />}
                        {step === 3 && <StepHealth {...props} />}
                        {step === 4 && <StepMedical {...props} formData={formData} staticData={staticData} />}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 flex justify-between items-center z-20 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    <span className="material-icons-round">arrow_back</span> Back
                </button>

                {step < totalSteps ? (
                    <button
                        onClick={handleNext}
                        disabled={!formData.name || !formData.breed}
                        className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none transform active:scale-95"
                    >
                        Next Step <span className="material-icons-round">arrow_forward</span>
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-10 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/30 transition-all transform active:scale-95 disabled:opacity-70"
                    >
                        {isGenerating ? <span className="material-icons-round animate-spin">refresh</span> : <span className="material-icons-round">check</span>}
                        {isGenerating ? 'Saving...' : 'Finish & Save'}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- STEP 1: IDENTITY ---
const StepIdentity = ({ formData, update, speciesList }: any) => {
    // Determine species ID from selected type code
    const selectedSpecies = speciesList?.find((s: any) => s.code === formData.type);
    const speciesId = selectedSpecies?.id;

    // Use Hook for Breeds
    const { breeds: dbBreeds, loading: loadingBreeds } = useBreeds(speciesId);

    const availableBreeds = dbBreeds.map(b => b.name);



    return (
        <div className="space-y-8">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Who is this cutie?</h2>
                <p className="text-gray-500 dark:text-gray-400">Let's start with the basics.</p>
            </div>

            {/* Pet Type Icons */}
            <div className="grid grid-cols-3 gap-4">
                {speciesList?.slice(0, 3).map((s: any) => (
                    <button
                        key={s.code}
                        onClick={() => update('type', s.code)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 group ${formData.type === s.code
                            ? 'border-primary bg-primary/5 text-primary shadow-md transform scale-105'
                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark text-gray-400 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <span className={`text-4xl mb-3 transition-transform group-hover:scale-110`}>{s.icon_emoji}</span>
                        <span className="font-bold capitalize">{s.name_key.split('.')[1]}</span>
                    </button>
                ))}
            </div>

            {/* Custom Type Input if not common */}
            {!speciesList?.find((s: any) => s.code === formData.type) && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specify Type</label>
                    <input
                        type="text"
                        value={formData.customType}
                        onChange={(e) => update('customType', e.target.value)}
                        placeholder="e.g. Rabbit, Hamster"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            )}

            {/* Name & Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pet's Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="e.g. Luna"
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary font-bold text-lg outline-none shadow-sm hover:border-gray-300 transition-colors placeholder-gray-400"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['male', 'female'].map(g => (
                            <button
                                key={g}
                                onClick={() => update('gender', g)}
                                className={`h-14 rounded-2xl border-2 flex items-center justify-center transition-all font-bold text-lg ${formData.gender === g
                                    ? g === 'male' ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 shadow-md' : 'border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-900/20 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300'
                                    }`}
                            >
                                <span className="material-icons-round text-2xl">{g}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breed Selector */}
            {formData.type !== 'other' && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Breed <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input
                            list="breedList"
                            type="text"
                            value={formData.breed}
                            onChange={(e) => update('breed', e.target.value)}
                            placeholder="Search breeds..."
                            className="w-full h-14 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary font-medium outline-none shadow-sm hover:border-gray-300 transition-colors"
                        />
                        <datalist id="breedList">
                            {availableBreeds.map((b: string) => <option key={b} value={b} />)}
                        </datalist>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <span className="material-icons-round">search</span>
                        </div>
                    </div>
                </div>
            )}
            {formData.type === 'other' && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Species / Breed</label>
                    <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) => update('breed', e.target.value)}
                        placeholder="Enter breed"
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary font-medium outline-none shadow-sm hover:border-gray-300 transition-colors"
                    />
                </div>
            )}
        </div>
    );
};

// --- STEP 2: APPEARANCE ---
const StepAppearance = ({ formData, update, colorList }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => update('image', reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unique Features</h2>
                <p className="text-gray-500 dark:text-gray-400">Describe what they look like.</p>
            </div>

            {/* Photo & Color Row */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Photo Upload */}
                <div className="shrink-0 flex flex-col items-center">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary cursor-pointer group relative overflow-hidden bg-gray-50 dark:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                    >
                        {formData.image ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                <span className="material-icons-round text-4xl mb-2">add_a_photo</span>
                                <span className="text-xs font-bold uppercase">Upload</span>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    {!formData.image && <p className="text-xs text-gray-400 mt-3 text-center w-40">No photo? We'll generate an AI avatar for you!</p>}
                </div>

                <div className="flex-1 space-y-6">
                    {/* Visual Color Picker */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Coat Color</label>
                        <div className="flex flex-wrap gap-3">
                            {colorList?.map((c: any) => (
                                <button
                                    key={c.name}
                                    onClick={() => update('color', c.name)}
                                    className={`w-10 h-10 rounded-full shadow-sm relative transition-transform hover:scale-110 ${formData.color === c.name ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 scale-110' : ''}`}
                                    style={{ background: c.hex_code || c.name, border: c.hex_code === '#FFFFFF' ? '1px solid #e5e7eb' : 'none' }}
                                    title={c.name}
                                >
                                    {formData.color === c.name && <span className="material-icons-round text-white text-lg drop-shadow-md">check</span>}
                                </button>
                            ))}
                        </div>
                        {/* Custom Color Input Backup */}
                        <div className="mt-3">
                            <input
                                type="text"
                                placeholder="Or type a custom color..."
                                value={formData.color}
                                onChange={e => update('color', e.target.value)}
                                className="text-sm border-b border-gray-200 dark:border-gray-700 bg-transparent py-1 w-full focus:border-primary outline-none text-gray-600 dark:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coat Type</label>
                            <select value={formData.coatType} onChange={e => update('coatType', e.target.value)} className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Select</option>
                                {COAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Eye Color</label>
                            <select value={formData.eyeColor} onChange={e => update('eyeColor', e.target.value)} className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Select</option>
                                {EYE_COLORS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tail Type</label>
                            <select value={formData.tailType} onChange={e => update('tailType', e.target.value)} className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Select</option>
                                {TAIL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ear Type</label>
                            <select value={formData.earType} onChange={e => update('earType', e.target.value)} className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Select</option>
                                {EAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STEP 3: HEALTH & BIO ---
const StepHealth = ({ formData, update }: any) => {
    const typeKey = formData.type ? formData.type.charAt(0).toUpperCase() + formData.type.slice(1) : 'Dog';
    const availableBloodTypes = BLOOD_TYPES[typeKey] || BLOOD_TYPES['Other'] || ['Unknown'];

    const formatDisplayDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const parseEUDate = (value: string) => {
        const parts = value.split(/[\/.-]/);
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
            return iso;
        }
        return value;
    };

    const [tagInput, setTagInput] = useState('');

    const addAllergy = () => {
        if (tagInput.trim() && !formData.allergies.includes(tagInput.trim())) {
            update('allergies', [...formData.allergies, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeAllergy = (a: string) => {
        update('allergies', formData.allergies.filter((x: string) => x !== a));
    };

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Health & ID</h2>
                <p className="text-gray-500 dark:text-gray-400">Important medical details.</p>
            </div>

            <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth (DD/MM/YYYY)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="dd/mm/yyyy"
                            value={formatDisplayDate(formData.birthDate)}
                            onChange={(e) => update('birthDate', parseEUDate(e.target.value))}
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-300 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.weight}
                                onChange={(e) => update('weight', e.target.value)}
                                placeholder="0.0"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary font-bold"
                            />
                            <button onClick={() => update('weightUnit', formData.weightUnit === 'kg' ? 'lb' : 'kg')} className="absolute right-2 top-2 bottom-2 px-3 bg-white dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-500 shadow-sm border border-gray-100 dark:border-gray-600">{formData.weightUnit.toUpperCase()}</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blood Type</label>
                        <select
                            value={formData.bloodType}
                            onChange={(e) => update('bloodType', e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <option value="">Select blood type</option>
                            {BLOOD_TYPES[typeKey].map((t: string) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

                {/* Microchip */}
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Type</label>
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            {['Chip', 'Tattoo'].map(t => (
                                <button key={t} onClick={() => update('microchipType', t)} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${formData.microchipType === t ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{formData.microchipType} Number</label>
                        <input
                            type="text"
                            value={formData.microchipId}
                            onChange={(e) => update('microchipId', e.target.value)}
                            placeholder={formData.microchipType === 'Chip' ? '15-digit ISO code' : 'Tattoo ID'}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary font-mono tracking-wide"
                        />
                    </div>
                </div>

                {/* Passport & Registration */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary">badge</span> Documents & Registration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passport Number</label>
                            <input
                                type="text"
                                value={formData.passportNumber}
                                onChange={(e) => update('passportNumber', e.target.value)}
                                placeholder="EU-XX-XXXXXX"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passport Issuer</label>
                            <input
                                type="text"
                                value={formData.passportIssuer}
                                onChange={(e) => update('passportIssuer', e.target.value)}
                                placeholder="e.g. Dr. Smith"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passport Date</label>
                            <input
                                type="date"
                                value={formData.passportDate}
                                onChange={(e) => update('passportDate', e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Registration No.</label>
                            <input
                                type="text"
                                value={formData.registrationNumber}
                                onChange={(e) => update('registrationNumber', e.target.value)}
                                placeholder="Local Council / KC Reg"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

                {/* Veterinarian Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary">medical_services</span> Primary Veterinarian
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vet Clinic / Name</label>
                            <input
                                type="text"
                                value={formData.veterinarian}
                                onChange={(e) => update('veterinarian', e.target.value)}
                                placeholder="e.g. City Paws Clinic"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact (Phone/Email)</label>
                            <input
                                type="text"
                                value={formData.veterinarianContact}
                                onChange={(e) => update('veterinarianContact', e.target.value)}
                                placeholder="+1 234 567 8900"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Spayed / Neutered?</span>
                        <button
                            onClick={() => update('neutered', !formData.neutered)}
                            className={`w-12 h-7 rounded-full transition-colors relative ${formData.neutered ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.neutered ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                        <span className="text-xs font-bold text-gray-500">{formData.neutered ? 'Yes' : 'No'}</span>
                    </div>
                </div>

                {/* Allergies */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Allergies</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.allergies.map((a: string) => (
                            <span key={a} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-100">
                                {a}
                                <button onClick={() => removeAllergy(a)} className="hover:text-red-800"><span className="material-icons-round text-sm">close</span></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addAllergy()}
                            placeholder="Type allergy and press Enter..."
                            className="flex-1 h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button onClick={addAllergy} className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-500 transition-colors">Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STEP 4: MEDICAL & DOCS ---
const StepMedical = ({ newVaccines, setNewVaccines, newMeds, setNewMeds, newDocs, setNewDocs, petId, formData, staticData }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [vaxData, setVaxData] = useState({ name: '', date: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [dbVaccines, setDbVaccines] = useState<any[]>([]);

    // Fetch vaccines from database based on pet type
    useEffect(() => {
        const fetchVaccines = async () => {
            if (!formData.type || formData.type === 'other') {
                setDbVaccines([]);
                return;
            }

            const species = formData.type.charAt(0).toUpperCase() + formData.type.slice(1);

            try {
                const { data, error } = await supabase
                    .from('reference_vaccines')
                    .select('*')
                    .eq('species', species)
                    .order('name');

                if (error) {
                    console.error('Error fetching vaccines:', error);
                    setDbVaccines([]);
                } else if (data && data.length > 0) {
                    setDbVaccines(data);
                } else {
                    setDbVaccines([]);
                }
            } catch (error) {
                console.error('Error fetching vaccines:', error);
                setDbVaccines([]);
            }
        };

        fetchVaccines();
    }, [formData.type]);

    // Use DB vaccines or fallback to static data
    const vaccineOptions = dbVaccines.length > 0 ? dbVaccines : (staticData?.vaccines?.[formData.type.charAt(0).toUpperCase() + formData.type.slice(1)] || []);

    const handleAddVax = () => {
        if (vaxData.name && vaxData.date) {
            // Find reference vaccine details
            const selectedRef = dbVaccines.find((v: any) => v.name === vaxData.name);

            setNewVaccines([...newVaccines, {
                id: Date.now().toString(),
                referenceVaccineId: selectedRef?.id,
                name: vaxData.name,
                type: selectedRef?.vaccine_type || 'Core', // Use DB type or default
                date: vaxData.date,
                status: 'Valid'
            }]);
            setVaxData({ name: '', date: '' });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const addedDocs: Partial<PetDocument>[] = [];

        try {
            // Process all files in parallel
            await Promise.all(Array.from(files).map(async (file) => {
                const targetPath = petId === 'temp' ? `temp` : `documents/${petId}`;
                const { url, fullPath } = await uploadFile(file, targetPath);

                addedDocs.push({
                    id: Date.now().toString() + Math.random().toString(16).slice(2),
                    name: file.name,
                    type: 'Medical',
                    date: new Date().toISOString().split('T')[0],
                    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    url: url,
                    storagePath: fullPath,
                    icon: 'description',
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-500'
                });
            }));

            setNewDocs([...newDocs, ...addedDocs]);
        } catch (e) {
            console.error("Upload failed", e);
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (e.target) e.target.value = '';
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Medical History</h2>
                <p className="text-gray-500 dark:text-gray-400">Add existing records (Optional).</p>
            </div>

            {/* Quick Add Vaccines */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-blue-500">vaccines</span> Vaccines
                    </h3>
                </div>
                <div className="flex gap-2 mb-4">
                    <select
                        value={vaxData.name}
                        onChange={e => setVaxData({ ...vaxData, name: e.target.value })}
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="">Select vaccine</option>
                        {vaccineOptions.map((v: any) => (
                            <option key={v.name || v} value={v.name || v}>
                                {v.name || v} {v.type ? `(${v.type})` : v.frequency ? `- ${v.frequency}` : ''}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={vaxData.date} onChange={e => setVaxData({ ...vaxData, date: e.target.value })}
                        className="w-40 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button onClick={handleAddVax} className="bg-primary text-white p-2.5 rounded-xl shadow-md hover:bg-primary-hover transition-colors">
                        <span className="material-icons-round">add</span>
                    </button>
                </div>
                {newVaccines.length > 0 ? (
                    <div className="space-y-2">
                        {newVaccines.map((v: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{v.name} <span className="text-gray-400 font-normal text-xs ml-1">({v.type}) on {v.date}</span></span>
                                <button onClick={() => setNewVaccines(newVaccines.filter((_: any, idx: number) => idx !== i))} className="text-red-400 hover:text-red-500"><span className="material-icons-round text-sm">close</span></button>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-gray-400 italic">No vaccines added yet.</p>}
            </div>

            {/* Quick Add Medications */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-purple-500">medication</span> Medications
                    </h3>
                </div>
                {/* Note: In a full implementation, we would toggle an 'Add Medication' form here similar to vaccines, 
                    but simpler for now just to show the list placeholder or minimal add */}
                <p className="text-xs text-gray-400 italic mb-2">Medication management is available in the pet profile after creation.</p>
                {/* 
                   For now, we will skip the detailed add-medication inputs here to keep the wizard simple 
                   unless we strictly need it. The user flow often involves adding basics then details later.
                   But if we want to allow it:
                */}
            </div>

            {/* Document Uploads */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-orange-500">folder_open</span> Documents
                    </h3>
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition-all mb-4"
                >
                    {isUploading ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                            <span className="material-icons-round animate-spin">refresh</span> Uploading...
                        </div>
                    ) : (
                        <div className="text-gray-400">
                            <span className="material-icons-round text-3xl mb-1">upload_file</span>
                            <p className="text-xs font-bold uppercase">Click to Upload PDF / Image</p>
                            <p className="text-[10px] text-gray-300">Multiple files allowed</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                </div>

                {newDocs.length > 0 && (
                    <div className="space-y-2">
                        {newDocs.map((d: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="material-icons-round text-gray-400">description</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{d.name}</p>
                                    <p className="text-xs text-gray-500">{d.size}</p>
                                </div>
                                <button onClick={() => setNewDocs(newDocs.filter((_: any, idx: number) => idx !== i))} className="text-red-400 hover:text-red-500"><span className="material-icons-round text-sm">close</span></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddPet;
