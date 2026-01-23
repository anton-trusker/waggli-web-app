import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getProviderById } from '../services/providers';
import { ServiceProvider } from '../types';

const ServiceDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [provider, setProvider] = useState<ServiceProvider | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!id) return;
            setLoading(true);
            const data = await getProviderById(id);
            setProvider(data);
            setLoading(false);
        };
        fetch();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!provider) return <div className="p-10 text-center">Provider not found</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
            <Header />
            <div className="relative h-64 md:h-80 bg-gray-200">
                <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
                <button onClick={() => navigate(-1)} className="absolute top-24 left-6 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <span className="material-icons-round">arrow_back</span>
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{provider.name}</h1>
                                {provider.isVerified && <span className="material-icons-round text-blue-500 text-xl">verified</span>}
                            </div>
                            <p className="text-primary font-bold uppercase tracking-wide text-sm">{provider.type}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <span className="material-icons-round text-yellow-400">star</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{provider.rating}</span>
                                    <span>({provider.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-icons-round">location_on</span>
                                    {provider.address}
                                </div>
                            </div>
                        </div>
                        <button className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-transform active:scale-95">
                            Book Appointment
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-lg font-bold mb-3 border-b pb-2 dark:border-gray-700">About</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{provider.description}</p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold mb-3 border-b pb-2 dark:border-gray-700">Services</h3>
                                <div className="space-y-3">
                                    {provider.services?.map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-colors cursor-pointer group">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{s.name}</h4>
                                                <p className="text-xs text-gray-500">{s.description}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1">{s.duration} min</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-lg">${s.price}</span>
                                                <button className="text-xs text-primary font-bold hover:underline">Book</button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!provider.services || provider.services.length === 0) && <p className="text-gray-400 italic">No services listed.</p>}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold mb-4">Contact</h3>
                                <ul className="space-y-3 text-sm">
                                    {provider.phone && (
                                        <li className="flex gap-3">
                                            <span className="material-icons-round text-gray-400">phone</span>
                                            <a href={`tel:${provider.phone}`} className="hover:text-primary transition-colors">{provider.phone}</a>
                                        </li>
                                    )}
                                    {provider.email && (
                                        <li className="flex gap-3">
                                            <span className="material-icons-round text-gray-400">email</span>
                                            <a href={`mailto:${provider.email}`} className="hover:text-primary transition-colors">{provider.email}</a>
                                        </li>
                                    )}
                                    {provider.website && (
                                        <li className="flex gap-3">
                                            <span className="material-icons-round text-gray-400">language</span>
                                            <a href={provider.website} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors truncate">{provider.website}</a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
