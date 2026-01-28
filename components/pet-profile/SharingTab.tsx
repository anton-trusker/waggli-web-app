
import React, { useState } from 'react';
import { useSharing } from '../../hooks/useSharing';
import { Pet } from '../../types';

interface SharingTabProps {
    pet: Pet;
}

const SharingTab: React.FC<SharingTabProps> = ({ pet }) => {
    const { coOwners, invitations, loading, inviteUser, removeOwner, cancelInvitation } = useSharing(pet.id);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'editor' | 'viewer'>('editor');
    const [isInviting, setIsInviting] = useState(false);

    // Public Share State (Mocked or Real)
    // Ideally useSharing should return publicShare info too
    const [publicLink, setPublicLink] = useState<string | null>(null);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsInviting(true);
        try {
            await inviteUser(email, role);
            setEmail('');
            alert('Invitation sent!');
        } catch (error: any) {
            alert('Error sending invitation: ' + error.message);
        } finally {
            setIsInviting(false);
        }
    };

    const confirmRemove = (id: string, name: string) => {
        if (confirm(`Remove access for ${name}?`)) {
            removeOwner(id);
        }
    };

    const togglePublicLink = () => {
        // Logic to create/delete row in public_shares
        if (publicLink) {
            if (confirm("Disable public link? access will be revoked.")) setPublicLink(null);
        } else {
            // Generate link
            setPublicLink(`https://waggly.app/share/${pet.id}-${Math.random().toString(36).substr(2, 9)}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Public Sharing Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-12 -translate-y-12 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons-round text-2xl bg-white/20 p-2 rounded-lg">public</span>
                            <h3 className="text-xl font-bold">Public Profile Link</h3>
                        </div>
                        <p className="text-indigo-100 text-sm max-w-md">
                            Share a read-only version of {pet.name}'s profile with sitters, vets, or family. You control what information is visible.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <label className="flex items-center cursor-pointer gap-3 bg-black/20 px-4 py-2 rounded-xl hover:bg-black/30 transition-colors">
                            <span className="text-sm font-bold">{publicLink ? 'Link Active' : 'Enable Link'}</span>
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={!!publicLink} onChange={togglePublicLink} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${publicLink ? 'bg-green-400' : 'bg-gray-400/50'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${publicLink ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {publicLink && (
                    <div className="mt-6 bg-white/10 rounded-xl p-4 flex items-center gap-3 border border-white/20">
                        <span className="material-icons-round text-indigo-200">link</span>
                        <input
                            readOnly
                            value={publicLink}
                            className="bg-transparent border-none text-white text-sm w-full focus:ring-0 placeholder-indigo-300 font-mono"
                        />
                        <button
                            onClick={() => { navigator.clipboard.writeText(publicLink); alert('Copied!'); }}
                            className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-100 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                )}
            </div>

            {/* Invite Section */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-primary">person_add</span> Invite Co-Owner
                </h3>
                <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary dark:text-white"
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary dark:text-white"
                    >
                        <option value="editor">Editor (Can edit)</option>
                        <option value="viewer">Viewer (Read only)</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isInviting}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isInviting ? <span className="material-icons-round animate-spin">refresh</span> : <span className="material-icons-round">send</span>}
                        Invite
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Owners */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Team Members</h3>
                    <div className="space-y-4">
                        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : coOwners.length === 0 ? <p className="text-gray-400 text-sm">No co-owners yet.</p> : coOwners.map(owner => (
                            <div key={owner.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        {owner.profile?.avatar_url ? (
                                            <img src={owner.profile.avatar_url} alt={owner.profile.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                                                {owner.profile?.full_name?.[0] || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{owner.profile?.full_name || 'Unknown User'}</p>
                                        <p className="text-xs text-gray-500">{owner.role} • {owner.profile?.email}</p>
                                    </div>
                                </div>
                                {owner.role !== 'owner' && (
                                    <button onClick={() => confirmRemove(owner.id, owner.profile?.full_name || '')} className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <span className="material-icons-round">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Invites */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Pending Invitations</h3>
                    <div className="space-y-4">
                        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : invitations.length === 0 ? <p className="text-gray-400 text-sm">No pending invites.</p> : invitations.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{invite.email}</p>
                                    <p className="text-xs text-gray-500">Invited as {invite.role}</p>
                                </div>
                                <button onClick={() => cancelInvitation(invite.id)} className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                    Cancel
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharingTab;
