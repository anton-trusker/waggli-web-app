
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VaccineRecord, Medication, Activity } from '../../types';
import { useReferenceVaccines } from '../../hooks/useReferenceVaccines';
import { useReferenceMedications } from '../../hooks/useReferenceMedications';

interface EditRecordModalProps {
    type: 'vaccine' | 'medication' | 'activity';
    data: any;
    petId: string;
    onClose: () => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({ type, data, petId, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit {type === 'vaccine' ? 'Vaccination' : type === 'medication' ? 'Medication' : 'Record'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {type === 'vaccine' && <EditVaccineForm data={data} petId={petId} onClose={onClose} />}
                {type === 'medication' && <EditMedicationForm data={data} petId={petId} onClose={onClose} />}
                {type === 'activity' && <div className="text-center p-4 text-gray-500">Editing for this type is not yet implemented.</div>}
            </div>
        </div>
    );
};

const EditVaccineForm = ({ data, petId, onClose }: { data: VaccineRecord, petId: string, onClose: () => void }) => {
    const { updateVaccine, pets } = useApp();
    const pet = pets.find(p => p.id === petId);
    const { vaccines: refVaccines } = useReferenceVaccines(pet?.species_id);

    const [formData, setFormData] = useState({
        title: data.type || '',
        date: data.date || '',
        expiryDate: data.expiryDate || '',
        manufacturer: data.manufacturer || '',
        batchNo: data.batchNo || '',
        doctor: data.providerName || '',
        notes: data.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateVaccine({
            ...data,
            type: formData.title,
            date: formData.date,
            expiryDate: formData.expiryDate,
            manufacturer: formData.manufacturer,
            batchNo: formData.batchNo,
            providerName: formData.doctor,
            notes: formData.notes
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vaccine Name</label>
                <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    list="vaxList"
                    required
                />
                <datalist id="vaxList">
                    {refVaccines.map(v => (
                        <option key={v.id} value={v.name}>{v.vaccine_type} - {v.name}</option>
                    ))}
                </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date Given</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Next Due</label>
                    <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
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
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Provider</label>
                    <input
                        value={formData.doctor}
                        onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white h-20 resize-none"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Save Changes</button>
            </div>
        </form>
    );
};

const EditMedicationForm = ({ data, petId, onClose }: { data: Medication, petId: string, onClose: () => void }) => {
    const { updateMedication, pets } = useApp();
    const pet = pets.find(p => p.id === petId);
    const { medications: refMeds } = useReferenceMedications(pet?.species_id);

    const [formData, setFormData] = useState({
        name: data.name || '',
        category: data.category || 'pill',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        frequency: data.frequency || '',
        instructions: data.instructions || '',
        notes: data.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMedication({
            ...data,
            name: formData.name,
            category: formData.category,
            startDate: formData.startDate,
            endDate: formData.endDate,
            frequency: formData.frequency,
            instructions: formData.instructions,
            notes: formData.notes
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medication Name</label>
                <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    list="medList"
                    required
                />
                <datalist id="medList">
                    {refMeds.map(m => <option key={m.id} value={m.name}>{m.category} - {m.name}</option>)}
                </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequency</label>
                <input
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder="e.g. Daily, 2x a day"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white h-20 resize-none"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Save Changes</button>
            </div>
        </form>
    );
};

export default EditRecordModal;
