import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

interface MyPetsProps {
  onMenuClick?: () => void;
}

const MyPets: React.FC<MyPetsProps> = ({ onMenuClick }) => {
  const { pets, deletePet } = useApp();
  const [petToDelete, setPetToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setPetToDelete(id);
  };

  const confirmDelete = () => {
    if (petToDelete) {
      deletePet(petToDelete);
      setPetToDelete(null);
    }
  };

  const cancelDelete = () => {
    setPetToDelete(null);
  };

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => {})} title="My Pets" />
      <div className="p-4 md:p-10 max-w-7xl mx-auto pb-24">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
                <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Your Companions</h2>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Manage profiles, health records, and settings.</p>
            </div>
            <Link to="/add-pet" className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all transform active:scale-95">
                <span className="material-icons-round text-xl">add</span> Add New Pet
            </Link>
        </div>

        {/* Pets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {pets.map(pet => (
                <div key={pet.id} className="group bg-surface-light dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-4 md:p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                    {/* Decorative bg */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 group-hover:bg-primary/5"></div>

                    <div className="relative flex items-start justify-between mb-4 md:mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-sm border-2 border-white dark:border-gray-700">
                            <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                        </div>
                        <span className={`px-2.5 py-1 md:px-3 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            pet.status === 'Healthy' 
                            ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                            : 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'
                        }`}>
                            {pet.status}
                        </span>
                    </div>

                    <div className="relative mb-4 md:mb-6">
                        <h3 className="text-xl md:text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-1">{pet.name}</h3>
                        <p className="text-xs md:text-sm font-medium text-text-muted-light dark:text-text-muted-dark flex items-center gap-2">
                           {pet.breed} 
                           <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span> 
                           {pet.gender}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 text-center">
                            <span className="block text-[9px] md:text-[10px] uppercase font-bold text-gray-400 mb-1">Age</span>
                            <span className="block text-xs md:text-sm font-bold text-text-main-light dark:text-white">{pet.age}</span>
                        </div>
                         <div className="p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 text-center">
                            <span className="block text-[9px] md:text-[10px] uppercase font-bold text-gray-400 mb-1">Weight</span>
                            <span className="block text-xs md:text-sm font-bold text-text-main-light dark:text-white">{pet.weight}</span>
                        </div>
                         <div className="p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 text-center">
                            <span className="block text-[9px] md:text-[10px] uppercase font-bold text-gray-400 mb-1">Sex</span>
                            <span className="block text-xs md:text-sm font-bold text-text-main-light dark:text-white text-center flex justify-center">
                                <span className="material-symbols-outlined text-base">
                                    {pet.gender === 'Male' ? 'male' : 'female'}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 md:gap-3">
                        <Link to={`/pet/${pet.id}`} className="flex-1 py-2.5 md:py-3 bg-primary text-white rounded-xl font-bold text-xs md:text-sm text-center shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl transition-all">
                            View Profile
                        </Link>
                         <Link to={`/pet/${pet.id}/edit`} className="p-2.5 md:p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                             <span className="material-icons-round text-lg md:text-xl">edit</span>
                        </Link>
                        <button onClick={() => handleDeleteClick(pet.id)} className="p-2.5 md:p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                             <span className="material-icons-round text-lg md:text-xl">delete</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {petToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <span className="material-icons-round text-3xl">warning</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Pet?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Are you sure you want to remove this pet? This action cannot be undone and all health records will be lost.
                </p>
                <div className="flex gap-3">
                    <button onClick={cancelDelete} className="flex-1 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 transition-colors">Delete</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default MyPets;