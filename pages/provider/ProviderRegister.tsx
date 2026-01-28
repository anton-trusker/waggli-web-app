import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import { registerProvider } from '../../services/providers';
import GooglePlacesInput from '../../components/GooglePlacesInput';

const ProviderRegister = () => {
    const { user, register } = useApp(); // Reuse main register for Auth
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Vet',
        customType: '',
        address: '',
        phone: '',
        email: '',
        password: '',
        description: '',
        googlePlaceId: ''
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create Auth User (if not logged in)
            let userId = user?.id;
            if (!userId) {
                // Simplified: Assuming register returns user or auto-logins
                // In real code we'd handle the auth flow carefully
                await register(formData.name, formData.email, formData.password);
                // After register, user might be updated async.
                // For now assuming we proceed or need to wait for auth state
                return;
            }

            // 2. Create Provider Profile
            const typeDisplay = formData.type === 'Other' && formData.customType
                ? formData.customType
                : formData.type;

            await registerProvider({
                name: formData.name,
                type: typeDisplay,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                description: formData.description,
                googlePlaceId: formData.googlePlaceId
            }, userId);

            navigate('/provider/dashboard');
        } catch (error) {
            console.error(error);
            alert("Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-surface-dark rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Register Business</h2>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Business Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 p-3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Service Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 p-3"
                            >
                                {['Vet', 'Groomer', 'Boarding', 'Trainer', 'Walker', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {formData.type === 'Other' && (
                                <input
                                    value={formData.customType}
                                    onChange={e => setFormData({ ...formData, customType: e.target.value })}
                                    className="mt-3 w-full rounded-xl border-gray-200 dark:border-gray-700 p-3"
                                    placeholder="Enter service type"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Location</label>
                        <div className="relative">
                            <GooglePlacesInput
                                onSelect={(place) => setFormData({ ...formData, address: place.address, googlePlaceId: place.placeId })}
                                defaultValue={formData.address}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 p-3 pl-10"
                            />
                            <span className="material-icons-round absolute left-3 top-3.5 text-gray-400">location_on</span>
                        </div>
                    </div>

                    {/* ... Other fields (Phone, Email, Password if new user) ... */}

                    <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg">
                        Create Business Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProviderRegister;
