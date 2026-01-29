
import React, { useState } from 'react';
import { Pet, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { PassportField } from './Shared';
import { useColors } from '../../hooks/useColors';

interface PassportTabProps {
    pet: Pet;
}

const PassportTab: React.FC<PassportTabProps> = ({ pet }) => {
    const { user, updatePet, vaccines, medications } = useApp();
    const { colors, loading: loadingColors } = useColors();
    const [isEditingPassport, setIsEditingPassport] = useState(false);
    const [passportData, setPassportData] = useState<any>({
        // Core Identity
        name: pet.name || '',
        breed: pet.breed || '',
        gender: pet.gender || 'Male',
        birthday: pet.birthday || '',

        // Passport Specifics
        passportNumber: pet.passportNumber || '',
        microchipId: pet.microchipId || '',
        microchipType: pet.microchipType || 'Chip',
        passportIssuer: pet.passportIssuer || '',
        passportDate: pet.passportDate || '',
        registrationNumber: pet.registrationNumber || '',

        // Medical / Vitals
        veterinarian: pet.veterinarian || '',
        veterinarianContact: pet.veterinarianContact || '',

        // Physical Traits
        breedNotes: pet.breedNotes || '',
        color: pet.color || '',
        weight: pet.weight || '',
        distinguishingMarks: pet.distinguishingMarks || '',
        coatType: pet.coatType || '',
        tailType: pet.tailType || '',
        earType: pet.earType || '',
        eyeColor: pet.eyeColor || '',
        bloodType: pet.bloodType || '',
        neutered: pet.neutered || false,
        allergies: pet.allergies || []
    });

    const handleSavePassport = () => {
        updatePet({ ...pet, ...passportData });
        setIsEditingPassport(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                {isEditingPassport ? (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditingPassport(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                        <button onClick={handleSavePassport} className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95">Save Changes</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditingPassport(true)} className="flex items-center gap-2 text-primary hover:text-white px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary transition-all text-sm font-bold">
                        <span className="material-icons-round text-lg">edit</span> Edit Passport
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OFFICIAL DIGITAL PASSPORT CARD */}
                <div className="relative w-full perspective-1000 h-full">
                    <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl shadow-2xl overflow-hidden text-white relative h-full min-h-[340px] transition-transform border-t border-white/20 flex flex-col">
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
                                {isEditingPassport ? (
                                    <input
                                        value={passportData.passportNumber}
                                        onChange={(e) => setPassportData({ ...passportData, passportNumber: e.target.value })}
                                        className="bg-white/10 border border-white/30 rounded px-2 py-1 text-right font-mono font-bold text-sm w-32 focus:outline-none focus:bg-white/20"
                                    />
                                ) : (
                                    <p className="font-mono font-bold text-lg tracking-wider">{pet.passportNumber || '---'}</p>
                                )}
                            </div>
                        </div>

                        <div className="relative z-10 p-6 flex gap-6 flex-1 items-center">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-white/10 border-2 border-white/30 overflow-hidden shrink-0">
                                <img src={pet.image} alt="Pet" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 content-center text-xs sm:text-sm">
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Name</p>
                                    {isEditingPassport ? (
                                        <input
                                            value={passportData.name}
                                            onChange={(e) => setPassportData({ ...passportData, name: e.target.value })}
                                            className="bg-white/10 border border-white/30 rounded px-2 py-1 font-bold w-full focus:outline-none focus:bg-white/20"
                                        />
                                    ) : (
                                        <p className="font-bold truncate">{pet.name}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Breed</p>
                                    {isEditingPassport ? (
                                        <input
                                            value={passportData.breed}
                                            onChange={(e) => setPassportData({ ...passportData, breed: e.target.value })}
                                            className="bg-white/10 border border-white/30 rounded px-2 py-1 font-semibold w-full focus:outline-none focus:bg-white/20"
                                        />
                                    ) : (
                                        <p className="font-semibold truncate">{pet.breed}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Sex / DOB</p>
                                    {isEditingPassport ? (
                                        <div className="flex gap-1">
                                            <select
                                                value={passportData.gender}
                                                onChange={(e) => setPassportData({ ...passportData, gender: e.target.value })}
                                                className="bg-white/10 border border-white/30 rounded px-1 py-1 text-xs focus:outline-none focus:bg-white/20 text-white"
                                            >
                                                <option value="Male" className="text-black">Male</option>
                                                <option value="Female" className="text-black">Female</option>
                                            </select>
                                            <input
                                                type="date"
                                                value={passportData.birthday}
                                                onChange={(e) => setPassportData({ ...passportData, birthday: e.target.value })}
                                                className="bg-white/10 border border-white/30 rounded px-1 py-1 text-xs w-full focus:outline-none focus:bg-white/20 text-white"
                                            />
                                        </div>
                                    ) : (
                                        <p className="font-semibold">{pet.gender} {pet.neutered && `(${pet.gender === 'Female' ? 'Spayed' : 'Neutered'})`} • {pet.birthday || 'Unk'}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Reg. No</p>
                                    {isEditingPassport ? (
                                        <input
                                            value={passportData.registrationNumber}
                                            onChange={(e) => setPassportData({ ...passportData, registrationNumber: e.target.value })}
                                            className="bg-white/10 border border-white/30 rounded px-2 py-1 font-mono w-full focus:outline-none focus:bg-white/20"
                                        />
                                    ) : (
                                        <p className="font-mono">{pet.registrationNumber || '---'}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2 pt-2 border-t border-white/10 mt-1">
                                    <p className="text-[9px] text-gray-400 uppercase">{pet.microchipType || 'Microchip'} ID</p>
                                    {isEditingPassport ? (
                                        <input
                                            value={passportData.microchipId}
                                            onChange={(e) => setPassportData({ ...passportData, microchipId: e.target.value })}
                                            className="bg-white/10 border border-white/30 rounded px-2 py-1 font-mono text-sm tracking-wider w-full focus:outline-none focus:bg-white/20"
                                        />
                                    ) : (
                                        <p className="font-mono text-sm tracking-wider">{pet.microchipId || 'Not Registered'}</p>
                                    )}
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
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Veterinarian</p>
                                {isEditingPassport ? (
                                    <div className="space-y-2">
                                        <input
                                            placeholder="Vet Name"
                                            value={passportData.veterinarian}
                                            onChange={(e) => setPassportData({ ...passportData, veterinarian: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm font-semibold"
                                        />
                                        <input
                                            placeholder="Contact (Phone/Email)"
                                            value={passportData.veterinarianContact}
                                            onChange={(e) => setPassportData({ ...passportData, veterinarianContact: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-semibold text-gray-900 dark:text-white">{pet.veterinarian || 'Not assigned'}</p>
                                        <p className="text-xs text-gray-500">{pet.veterinarianContact}</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                                <span className="material-icons-round">account_balance</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Issued By</p>
                                {isEditingPassport ? (
                                    <div className="space-y-2">
                                        <input
                                            placeholder="Authority Name"
                                            value={passportData.passportIssuer}
                                            onChange={(e) => setPassportData({ ...passportData, passportIssuer: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm font-semibold"
                                        />
                                        <input
                                            type="date"
                                            value={passportData.passportDate}
                                            onChange={(e) => setPassportData({ ...passportData, passportDate: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-semibold text-gray-900 dark:text-white">{pet.passportIssuer || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">{pet.passportDate ? `Date: ${pet.passportDate}` : ''}</p>
                                    </>
                                )}
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

                {/* DIGITAL PASSPORT CARD - PREMIUM REDESIGN */}
                <div className="perspective-1000">
                    <div
                        className="relative group bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white shadow-2xl overflow-hidden transition-all duration-500 hover:rotate-x-1 hover:rotate-y-1 hover:scale-[1.01]"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Shimmer / Holographic Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl group-hover:bg-indigo-300/30 transition-colors duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                        <span className="material-icons-round text-4xl">pets</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                            PET PASSPORT
                                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-white/30">Official</span>
                                        </h3>
                                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Waggly Universal ID</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none">Record No.</p>
                                    <p className="text-lg font-mono font-bold tracking-tighter">WGL-{pet.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-6">
                                    <PassportField label="Full Name" value={pet.name} isEditing={isEditing} onChange={(val: string) => setFormData({ ...formData, name: val })} />
                                    <PassportField label="Species / Breed" value={`${pet.species} • ${pet.breed}`} isEditing={isEditing} onChange={(val: string) => {
                                        const [s, b] = val.split(' • ');
                                        setFormData({ ...formData, species: s, breed: b });
                                    }} />
                                    <PassportField label="Birth Date" value={pet.birthday || 'Not Recorded'} isEditing={isEditing} onChange={(val: string) => setFormData({ ...formData, birthday: val })} />
                                </div>
                                <div className="space-y-6">
                                    <PassportField label="Microchip ID" value={pet.microchipId || 'None'} isEditing={isEditing} onChange={(val: string) => setFormData({ ...formData, microchipId: val })} />
                                    <PassportField label="Registry No." value={pet.registryId || 'None'} isEditing={isEditing} onChange={(val: string) => setFormData({ ...formData, registryId: val })} />
                                    <PassportField label="Blood Type" value={pet.bloodType || 'Unknown'} isEditing={isEditing} onChange={(val: string) => setFormData({ ...formData, bloodType: val })} />
                                </div>
                                <div className="flex flex-col items-center justify-center md:items-end">
                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg text-center w-full md:w-max group-hover:border-white/40 transition-colors">
                                        <div className="w-24 h-24 bg-white p-2 rounded-xl mb-2 mx-auto">
                                            {/* Mock QR-like icon */}
                                            <div className="w-full h-full bg-indigo-900/10 rounded flex items-center justify-center border-2 border-dashed border-indigo-900/20">
                                                <span className="material-icons-round text-indigo-900/30 text-4xl">qr_code_2</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Scan for Medical Summary</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                                    <span className="material-icons-round text-green-400 text-sm">verified</span>
                                    <span className="text-xs font-bold tracking-wide">Blockchain Verified Identity</span>
                                </div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-2 bg-white text-indigo-600 rounded-xl text-sm font-black shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                                >
                                    {isEditing ? 'Save Changes' : 'Edit Passport'}
                                </button>
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

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</label>
                            {isEditingPassport ? (
                                <select
                                    value={passportData.color}
                                    onChange={(e) => setPassportData({ ...passportData, color: e.target.value })}
                                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="">Select Color</option>
                                    {loadingColors ? <option>Loading...</option> : colors.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{pet.color || '---'}</p>
                            )}
                        </div>
                        <PassportField label="Eye Color" value={isEditingPassport ? passportData.eyeColor : pet.eyeColor} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, eyeColor: v })} />

                        <PassportField label="Coat Type" value={isEditingPassport ? passportData.coatType : pet.coatType} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, coatType: v })} />
                        <PassportField label="Tail Type" value={isEditingPassport ? passportData.tailType : pet.tailType} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, tailType: v })} />

                        <div className="col-span-2">
                            <PassportField label="Distinguishing Marks" value={isEditingPassport ? passportData.distinguishingMarks : pet.distinguishingMarks} isEditing={isEditingPassport} onChange={(v: string) => setPassportData({ ...passportData, distinguishingMarks: v })} fullWidth />
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3: MEDICAL RECORDS (Vaccinations, Meds, Allergies) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

                {/* Vaccinations */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">vaccines</span> Immunization Record
                        </h3>
                        {isEditingPassport && (
                            <button className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20">+ Add</button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {vaccines.filter(v => v.petId === pet.id).length > 0 ? (
                            vaccines.filter(v => v.petId === pet.id).map(v => (
                                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{v.type}</p>
                                        <p className="text-xs text-gray-500">Given: {v.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${v.status === 'Valid' ? 'bg-green-100 text-green-700' :
                                                v.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {v.status}
                                            </span>
                                            <p className="text-[10px] text-gray-400">Expires: {v.nextDueDate || 'N/A'}</p>
                                        </div>
                                        {isEditingPassport && (
                                            <button className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors">
                                                <span className="material-icons-round text-xs">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic py-2">No vaccination records found.</p>
                        )}
                    </div>
                </div>

                {/* Medications & Allergies */}
                <div className="space-y-6">
                    {/* Medications */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-icons-round text-primary">medication</span> Medications
                        </h3>
                        <div className="space-y-3">
                            {medications.filter(m => m.petId === pet.id).length > 0 ? (
                                medications.filter(m => m.petId === pet.id).map(m => (
                                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                            <span className="material-icons-round text-sm">pill</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{m.name}</p>
                                            <p className="text-xs text-gray-500">{m.frequency} • {m.active ? 'Active' : 'Past'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic py-2">No medication records found.</p>
                            )}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-icons-round text-red-500">no_food</span> Allergies
                        </h3>
                        {isEditingPassport ? (
                            <div className="space-y-2">
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24"
                                    placeholder="Enter allergies separated by commas (e.g. Chicken, Pollen, Bee Stings)"
                                    value={Array.isArray(passportData.allergies) ? passportData.allergies.join(', ') : passportData.allergies}
                                    onChange={(e) => setPassportData({ ...passportData, allergies: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                                />
                                <p className="text-xs text-gray-500">Separate multiple allergies with commas.</p>
                            </div>
                        ) : (
                            pet.allergies && pet.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {pet.allergies.map((allergy, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-300 rounded-lg text-sm font-bold border border-red-100 dark:border-red-900/30">
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No known allergies.</p>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PassportTab;
