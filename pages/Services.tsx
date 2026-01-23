import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useLocalization } from '../context/LocalizationContext';
import { getServiceProviders } from '../services/providers';
import { ServiceProvider } from '../types';
import ProviderSelector from '../components/ProviderSelector';
import GooglePlacesInput from '../components/GooglePlacesInput';
import { Link } from 'react-router-dom';

const Services = ({ defaultCategory = 'All' }: { defaultCategory?: string }) => {
    const { t } = useLocalization();
    const [category, setCategory] = useState(defaultCategory);
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Vet', 'Groomer', 'Boarding', 'Training', 'Walker'];

    useEffect(() => {
        const fetchProviders = async () => {
            setLoading(true);
            try {
                const data = await getServiceProviders(category === 'All' ? undefined : category);
                setProviders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, [category]);

    const handleLocationSelect = (place: any) => {
        console.log("Location selected:", place);
        // In a real app we would sort/filter providers by distance to this location
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <Header />
            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

                {/* Search & Filter Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('services_title') || 'Pet Services'}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Find trusted professionals near you</p>
                    </div>
                    <div className="w-full md:w-96">
                        <GooglePlacesInput
                            onSelect={handleLocationSelect}
                            placeholder="Search location..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${category === cat
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {t(`service_category_${cat.toLowerCase()}`) || cat}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : providers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {providers.map(provider => (
                            <Link to={`/service/${provider.id}`} key={provider.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col h-full">
                                <div className="relative h-40 w-full mb-4 overflow-hidden rounded-xl bg-gray-100">
                                    <img src={provider.image} alt={provider.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <span className="material-icons-round text-yellow-400 text-sm">star</span>
                                        {provider.rating} ({provider.reviews})
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">{provider.name}</h3>
                                            <p className="text-xs text-primary font-bold uppercase tracking-wide">{provider.type}</p>
                                        </div>
                                        {provider.isVerified && <span className="material-icons-round text-blue-500" title="Verified">verified</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{provider.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span className="material-icons-round text-sm">location_on</span>
                                        <span className="truncate">{provider.address}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <span className="material-icons-round text-4xl text-gray-300 mb-2">store_mall_directory</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Providers Found</h3>
                        <p className="text-gray-500">Try changing your filters or location.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Services;
