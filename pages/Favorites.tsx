import React from 'react';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Favorites: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { favoriteServiceIds, toggleServiceFavorite, services } = useApp();
  const navigate = useNavigate();

  const favoriteServices = services.filter(service => favoriteServiceIds.includes(service.id));

  const handleCardClick = (id: string) => {
      navigate(`/service/${id}`);
  };

  return (
    <>
      <Header onMenuClick={onMenuClick || (() => {})} title="My Favorites" />
      <div className="p-6 md:p-10 max-w-7xl mx-auto h-full">
        {favoriteServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {favoriteServices.map(service => (
                    <div 
                        key={service.id}
                        onClick={() => handleCardClick(service.id)}
                        className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group flex flex-col cursor-pointer"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img src={service.image} alt={service.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 dark:text-white border border-white/20">
                                {service.distance}
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleServiceFavorite(service.id); }}
                                className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full transition-colors text-red-500"
                            >
                                <span className="material-icons-round text-lg">favorite</span>
                            </button>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-1 inline-block ${
                                        service.category === 'Vet' ? 'bg-red-100 text-red-600' :
                                        service.category === 'Grooming' ? 'bg-purple-100 text-purple-600' :
                                        service.category === 'Store' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {service.category}
                                    </span>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{service.name}</h3>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                    <span className="material-icons-round text-yellow-500 text-sm">star</span>
                                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{service.rating}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                                    <span className="material-icons-round text-base mt-0.5 shrink-0 opacity-70">location_on</span>
                                    {service.address}
                                </p>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button className="w-full py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-6">
                    <span className="material-icons-round text-4xl">favorite_border</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Favorites Yet</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                    Save your favorite veterinarians, groomers, and pet stores here for quick access.
                </p>
                <button 
                    onClick={() => navigate('/discover')}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
                >
                    Explore Services
                </button>
            </div>
        )}
      </div>
    </>
  );
};

export default Favorites;