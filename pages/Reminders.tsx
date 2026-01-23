import React, { useState } from 'react';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { Reminder } from '../types';

interface RemindersProps {
    onMenuClick?: () => void;
}

const Reminders: React.FC<RemindersProps> = ({ onMenuClick }) => {
    const { reminders, pets, addReminder, updateReminder, deleteReminder } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Reminder>>({
        title: '',
        petId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        priority: 'Medium',
        repeat: 'Never',
        category: 'General',
        notes: '',
        completed: false
    });

    const activeReminders = reminders.filter(r => !r.completed);
    const completedReminders = reminders.filter(r => r.completed);

    const getPetName = (id?: string) => pets.find(p => p.id === id)?.name || 'General';

    const handleEdit = (reminder: Reminder) => {
        setFormData(reminder);
        setEditingId(reminder.id);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({
            title: '',
            petId: pets[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            priority: 'Medium',
            repeat: 'Never',
            category: 'General',
            notes: '',
            completed: false
        });
        setEditingId(null);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const reminderData = {
            ...formData,
            id: editingId || Date.now().toString(),
        } as Reminder;

        if (editingId) {
            updateReminder(reminderData);
        } else {
            addReminder(reminderData);
        }
        setShowModal(false);
    };

    const toggleComplete = (reminder: Reminder) => {
        updateReminder({ ...reminder, completed: !reminder.completed });
    };

    return (
        <>
            <Header onMenuClick={onMenuClick || (() => { })} title="Reminders" />
            <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">To-Do List</h2>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Manage daily tasks and care schedules.</p>
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <span className="material-icons-round text-xl">add_task</span> Add Task
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Active Tasks */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">pending_actions</span> Active Tasks
                        </h3>
                        {activeReminders.length === 0 && (
                            <div className="text-center p-8 bg-surface-light dark:bg-surface-dark rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
                                No active tasks.
                            </div>
                        )}
                        {activeReminders.map(reminder => (
                            <ReminderItem key={reminder.id} reminder={reminder} getPetName={getPetName} onToggle={() => toggleComplete(reminder)} onEdit={() => handleEdit(reminder)} />
                        ))}
                    </div>

                    {/* Completed Tasks */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 opacity-70">
                            <span className="material-icons-round text-green-500">task_alt</span> Completed
                        </h3>
                        {completedReminders.length === 0 && (
                            <div className="text-center p-8 bg-surface-light dark:bg-surface-dark rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 opacity-70">
                                No completed tasks recently.
                            </div>
                        )}
                        {completedReminders.map(reminder => (
                            <ReminderItem key={reminder.id} reminder={reminder} getPetName={getPetName} onToggle={() => toggleComplete(reminder)} onEdit={() => handleEdit(reminder)} isCompleted />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Task' : 'New Task'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Task Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                                    placeholder="e.g. Buy Food"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign to Pet</label>
                                <select
                                    value={formData.petId}
                                    onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white appearance-none"
                                >
                                    <option value="">General (No specific pet)</option>
                                    {pets.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select
                                    value={formData.category || 'General'}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white appearance-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Medication">Medication</option>
                                    <option value="Appointment">Appointment</option>
                                    <option value="Grooming">Grooming</option>
                                    <option value="Vaccination">Vaccination</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Repeat</label>
                                    <select
                                        value={formData.repeat}
                                        onChange={(e) => setFormData({ ...formData, repeat: e.target.value as any })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                                    >
                                        <option>Never</option>
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add details..."
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary h-20 resize-none dark:text-white"
                                />
                            </div>

                            <div className="pt-4 flex justify-between gap-3">
                                {editingId && (
                                    <button type="button" onClick={() => { deleteReminder(editingId); setShowModal(false); }} className="px-4 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">Delete</button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md text-sm">Save</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

const ReminderItem = ({ reminder, getPetName, onToggle, onEdit, isCompleted }: any) => (
    <div className={`group bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border transition-all hover:shadow-md flex items-center gap-4 ${isCompleted ? 'border-transparent opacity-60' : 'border-gray-100 dark:border-gray-800'}`}>
        <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                }`}
        >
            {isCompleted && <span className="material-icons-round text-sm">check</span>}
        </button>

        <div className="flex-1 cursor-pointer" onClick={onEdit}>
            <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-bold text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{reminder.title}</h4>
                {reminder.priority === 'High' && !isCompleted && <span className="w-2 h-2 rounded-full bg-red-500" title="High Priority"></span>}
                {reminder.repeat !== 'Never' && <span className="material-icons-round text-gray-400 text-[14px]">autorenew</span>}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-medium">{getPetName(reminder.petId)}</span>
                <span className="flex items-center gap-1"><span className="material-icons-round text-[12px]">event</span> {reminder.date}</span>
                {reminder.time && <span>{reminder.time}</span>}
            </div>
        </div>

        <button onClick={onEdit} className="text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-icons-round">edit</span>
        </button>
    </div>
);

export default Reminders;
