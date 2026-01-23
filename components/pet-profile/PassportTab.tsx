
import React, { useState } from 'react';
import { Pet, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { PassportField } from './Shared';

interface PassportTabProps {
    pet: Pet;
}

const PassportTab: React.FC<PassportTabProps> = ({ pet }) => {
    const { user, updatePet } = useApp();
    const [isEditingPassport, setIsEditingPassport] = useState(false);
    const [passportData, setPassportData] = useState<any>({
        passportNumber: pet.passportNumber || '',
        microchipId: pet.microchipId || '',
        microchipType: pet.microchipType || 'Chip',
        passportIssuer: pet.passportIssuer || '',
        passportDate: pet.passportDate || '',
        registrationNumber: pet.registrationNumber || '',
        veterinarian: pet.veterinarian || '',
        veterinarianContact: pet.veterinarianContact || '',
        breedNotes: pet.breedNotes || '',
        color: pet.color || '',
        weight: pet.weight || '',
        distinguishingMarks: pet.distinguishingMarks || '',
        coatType: pet.coatType || '',
        tailType: pet.tailType || '',
        earType: pet.earType || '',
        eyeColor: pet.eyeColor || '',
        bloodType: pet.bloodType || '',
        neutered: pet.neutered || false
    });

    const handleSavePassport = () => {
        updatePet({ ...pet, ...passportData });
        setIsEditingPassport(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OFFICIAL DIGITAL PASSPORT CARD */}
                <div className="relative w-full perspective-1000 h-full">
                    <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl shadow-2xl overflow-hidden text-white relative h-full min-h-[340px] transition-transform hover:scale-[1.01] border-t border-white/20 flex flex-col">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.4) 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                            <span className="material-icons-round text-[200px]">pets</span>
                        </div>

                        <div className="relative z-10 p-6 flex justify-between items-start border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="material-icons-round text-3xl text-yellow-400">verified</span>
                                <div>
                                    <h2 className="text-lg font-bold tracking-widest uppercase">Pet Passport</h2>
                                    <p className="text-[10px] text-gray-300 tracking-wider">OFFICIAL DOCUMENT</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase">Passport No.</p>
                                <p className="font-mono font-bold text-lg tracking-wider">{pet.passportNumber || '---'}</p>
                            </div>
                        </div>

                        <div className="relative z-10 p-6 flex gap-6 flex-1 items-center">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-white/10 border-2 border-white/30 overflow-hidden shrink-0">
                                <img src={pet.image} alt="Pet" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 content-center text-xs sm:text-sm">
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Name</p>
                                    <p className="font-bold truncate">{pet.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Breed</p>
                                    <p className="font-semibold truncate">{pet.breed}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Sex / DOB</p>
                                    <p className="font-semibold">{pet.gender} {pet.neutered && `(${pet.gender === 'Female' ? 'Spayed' : 'Neutered'})`} • {pet.birthday || 'Unk'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Reg. No</p>
                                    <p className="font-mono">{pet.registrationNumber || '---'}</p>
                                </div>
                                <div className="sm:col-span-2 pt-2 border-t border-white/10 mt-1">
                                    <p className="text-[9px] text-gray-400 uppercase">{pet.microchipType || 'Microchip'} ID</p>
                                    <p className="font-mono text-sm tracking-wider">{pet.microchipId || 'Not Registered'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VETERINARY & ISSUER DETAILS */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-icons-round text-primary">medical_services</span> Medical & Issuer
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                                <span className="material-icons-round">local_hospital</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Veterinarian</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{pet.veterinarian || 'Not assigned'}</p>
                                <p className="text-xs text-gray-500">{pet.veterinarianContact}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                                <span className="material-icons-round">account_balance</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Issued By</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{pet.passportIssuer || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{pet.passportDate ? `Date: ${pet.passportDate}` : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                                <span className="material-icons-round">event_available</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                <p className="font-semibold text-gray-900 dark:text-white">Active / Valid</p>
                                <p className="text-xs text-gray-500">Next checkup likely needed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: OWNER INFO & PHYSICAL TRAITS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Owner Details */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                        <span className="material-icons-round text-primary">person</span> Owner Information
                    </h3>
                    <div className="flex items-start gap-4">
                        <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700" />
                        <div className="space-y-3 flex-1">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{user.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.email}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{user.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PHYSICAL TRAITS (Editable) */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">pets</span> Physical Traits
                        </h3>
                        {isEditingPassport ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingPassport(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                                <button onClick={handleSavePassport} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600">Save Changes</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditingPassport(true)} className="flex items-center gap-1 text-primary text-sm font-bold hover:text-primary-hover px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                                <span className="material-icons-round text-lg">edit</span> Edit
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        <PassportField label="Registration No." value={isEditingPassport ? passportData.registrationNumber : pet.registrationNumber} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, registrationNumber: v })} />

                        <div className="col-span-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Neutered/Spayed</p>
                            {isEditingPassport ? (
                                <button
                                    onClick={() => setPassportData({ ...passportData, neutered: !passportData.neutered })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${passportData.neutered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {passportData.neutered ? 'Yes, Neutered' : 'No, Intact'}
                                </button>
                            ) : (
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{pet.neutered ? 'Yes' : 'No'}</p>
                            )}
                        </div>

                        <PassportField label="Weight" value={isEditingPassport ? passportData.weight : pet.weight} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, weight: v })} />
                        <PassportField label="Blood Type" value={isEditingPassport ? passportData.bloodType : pet.bloodType} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, bloodType: v })} />

                        <PassportField label="Color" value={isEditingPassport ? passportData.color : pet.color} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, color: v })} />
                        <PassportField label="Eye Color" value={isEditingPassport ? passportData.eyeColor : pet.eyeColor} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, eyeColor: v })} />

                        <PassportField label="Coat Type" value={isEditingPassport ? passportData.coatType : pet.coatType} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, coatType: v })} />
                        <PassportField label="Tail Type" value={isEditingPassport ? passportData.tailType : pet.tailType} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, tailType: v })} />

                        <div className="col-span-2">
                            <PassportField label="Distinguishing Marks" value={isEditingPassport ? passportData.distinguishingMarks : pet.distinguishingMarks} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, distinguishingMarks: v })} fullWidth />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PassportTab;
