
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CountrySelector from '../components/CountrySelector';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const Onboarding: React.FC = () => {
    const { completeOnboarding, user } = useApp();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        phone: '',
        country: '',
        city: '',
        gender: '',
        birthDate: '',
        profileImage: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.country) {
            toast.error('Country is required');
            return;
        }

        setIsLoading(true);

        try {
            await completeOnboarding({
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone || undefined,
                country: formData.country,
                city: formData.city || undefined,
                gender: formData.gender || undefined,
                birthDate: formData.birthDate || undefined,
                image: formData.profileImage || undefined,
                bio: `Started using Pawzly on ${new Date().toLocaleDateString()}`
            });
            toast.success('Profile completed!');
            navigate('/');
        } catch (error) {
            console.error("Onboarding failed", error);
            toast.error('Failed to complete profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const update = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, profileImage: publicUrl }));
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark p-6">
            <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Pawzly!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Let's get to know you better to personalize your experience.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Image Upload */}
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Profile Picture (Optional)</label>
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-icons-round text-5xl text-gray-400">person</span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all">
                                <span className="material-icons-round text-white text-xl">add_a_photo</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Max 5MB</p>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                            <input required type="text" value={formData.firstName} onChange={e => update('firstName', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
                            <input required type="text" value={formData.lastName} onChange={e => update('lastName', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary dark:text-white" />
                        </div>
                    </div>

                    {/* Phone Number (Optional) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number (Optional)</label>
                        <input type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary dark:text-white" placeholder="+1 (555) 000-0000" />
                    </div>

                    {/* Country and City on same row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country *</label>
                            <CountrySelector
                                value={formData.country}
                                onChange={(country) => update('country', country)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City (Optional)</label>
                            <input type="text" value={formData.city} onChange={e => update('city', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary dark:text-white" placeholder="Your city" />
                        </div>
                    </div>

                    {/* Gender and Birth Date (Optional) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender (Optional)</label>
                            <select value={formData.gender} onChange={e => update('gender', e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary dark:text-white">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth (Optional)</label>
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={e => update('birthDate', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? <span className="material-icons-round animate-spin">refresh</span> : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
