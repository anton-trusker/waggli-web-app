
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAdmin } from '../../hooks/useAdmin';

interface AdminUsersProps {
  onMenuClick?: () => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { users, updateUserStatus, deleteUser, loading } = useAdmin();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredUsers = users.filter(u => {
      const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      // For real data, check role array or single role string depending on data model normalization
      const roleStr = Array.isArray(u.roles) ? u.roles[0] : u.role || 'user';
      const statusStr = u.status || 'Active';
      
      const matchesFilter = filter === 'All' || roleStr.toLowerCase() === filter.toLowerCase() || statusStr === filter;
      return matchesSearch && matchesFilter;
  });

  const handleRowClick = (id: string) => {
      navigate(`/admin/users/${id}`);
  };

  const handleActionClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActiveActionId(activeActionId === id ? null : id);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(filteredUsers.map(u => u.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleSelectRow = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(i => i !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  // Close dropdown when clicking elsewhere
  React.useEffect(() => {
      const closeMenu = () => setActiveActionId(null);
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleStatusChange = (e: React.MouseEvent, id: string, status: any) => {
      e.stopPropagation();
      updateUserStatus(id, status);
      setActiveActionId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm("Are you sure you want to delete this user?")) {
          deleteUser(id);
      }
      setActiveActionId(null);
  };

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => {})} title="User Management" />
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            {selectedIds.length > 0 ? (
                <div className="flex items-center gap-4 flex-1 animate-in fade-in slide-in-from-left-2">
                    <span className="font-bold text-gray-900 dark:text-white px-2">{selectedIds.length} Selected</span>
                    <button className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                        Delete Selected
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                        Suspend Selected
                    </button>
                    <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-auto">
                        Cancel
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative flex-1 max-w-md">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'User', 'Vet', 'Active', 'Suspended'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    filter === f 
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>

        {/* Users Table */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-visible">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Subscription</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading && <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading users...</td></tr>}
                        {!loading && filteredUsers.map((u) => {
                            const role = Array.isArray(u.roles) ? u.roles[0] : u.role || 'user';
                            return (
                            <tr 
                                key={u.id} 
                                onClick={() => handleRowClick(u.id)}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group relative ${selectedIds.includes(u.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                            >
                                <td className="px-6 py-4" onClick={(e) => handleSelectRow(e, u.id)}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(u.id)}
                                        readOnly
                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            {u.image ? (
                                                <img src={u.image} className="w-full h-full object-cover" alt={u.name || 'User'} />
                                            ) : (
                                                (u.name || u.email).charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{u.name || 'No Name'}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                                        role === 'vet' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        <span className="material-icons-round text-sm">{role === 'vet' ? 'medical_services' : 'person'}</span>
                                        {role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                        u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Suspended' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        {u.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 dark:text-white text-xs">{u.plan || 'Free'}</span>
                                        <span className="text-[10px] text-gray-400">{u.plan === 'Free' ? '$0/mo' : u.plan === 'Premium' ? '$4.99/mo' : '$19.99/mo'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={(e) => handleActionClick(e, u.id)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <span className="material-icons-round">more_vert</span>
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {activeActionId === u.id && (
                                        <div className="absolute right-8 top-8 w-40 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                                <span className="material-icons-round text-sm">visibility</span> View Details
                                            </button>
                                            {u.status !== 'Suspended' ? (
                                                <button onClick={(e) => handleStatusChange(e, u.id, 'Suspended')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2">
                                                    <span className="material-icons-round text-sm">block</span> Suspend
                                                </button>
                                            ) : (
                                                <button onClick={(e) => handleStatusChange(e, u.id, 'Active')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2">
                                                    <span className="material-icons-round text-sm">check_circle</span> Activate
                                                </button>
                                            )}
                                            <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
                                            <button onClick={(e) => handleDelete(e, u.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                <span className="material-icons-round text-sm">delete</span> Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
