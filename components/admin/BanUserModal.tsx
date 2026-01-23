
import React, { useState } from 'react';

interface BanUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (type: 'shadowban' | 'suspension' | 'hard_ban', reason: string, userReason: string, expiry?: Date) => void;
    userName: string;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    const [type, setType] = useState<'shadowban' | 'suspension' | 'hard_ban'>('suspension');
    const [reason, setReason] = useState('');
    const [userReason, setUserReason] = useState('');
    const [durationValues, setDuration] = useState('7'); // days

    if (!isOpen) return null;

    const handleSubmit = () => {
        let expiry: Date | undefined;
        if (type === 'suspension') {
            const days = parseInt(durationValues);
            expiry = new Date();
            expiry.setDate(expiry.getDate() + days);
        }
        onConfirm(type, reason, userReason, expiry);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-red-50 dark:bg-red-900/20">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <span className="material-icons-round">gavel</span>
                        Sanction User: {userName}
                    </h3>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sanction Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setType('suspension')}
                                className={`p-3 rounded-xl border text-sm font-bold ${type === 'suspension' ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                            >
                                Suspension
                            </button>
                            <button
                                onClick={() => setType('hard_ban')}
                                className={`p-3 rounded-xl border text-sm font-bold ${type === 'hard_ban' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                            >
                                Hard Ban
                            </button>
                            <button
                                onClick={() => setType('shadowban')}
                                className={`p-3 rounded-xl border text-sm font-bold ${type === 'shadowban' ? 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                            >
                                Shadowban
                            </button>
                        </div>
                    </div>

                    {type === 'suspension' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duration (Days)</label>
                            <select
                                value={durationValues}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                            >
                                <option value="1">24 Hours</option>
                                <option value="3">3 Days</option>
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Internal Reason (Admin Only)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Repeated spamming"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User-Facing Message</label>
                        <textarea
                            value={userReason}
                            onChange={e => setUserReason(e.target.value)}
                            placeholder="This message will be shown to the user..."
                            rows={3}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                    <button onClick={onClose} className="px-5 py-2.5 font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Sanction
                    </button>
                </div>
            </div>
        </div>
    );
};
