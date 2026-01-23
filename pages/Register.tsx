
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const { register } = useApp();
    const { t } = useLocalization();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register('', email, password);
            toast.success('Account created! Welcome to Pawzly.');
            navigate('/onboarding');
        } catch (err: any) {
            toast.error(err.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                        <span className="material-icons-round text-white text-3xl">pets</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('create_account') || 'Create Account'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('register_subtitle') || 'Start your pet care journey with Pawzly.'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('email_label') || 'Email Address'}</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm font-medium"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('password_label') || 'Password'}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <span className="material-icons-round">{showPassword ? 'visibility' : 'visibility_off'}</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('repeat_password') || 'Repeat Password'}</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <span className="material-icons-round">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? <span className="material-icons-round animate-spin">refresh</span> : t('sign_up_button') || 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-8">
                    {t('already_have_account') || 'Already have an account? '}{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        {t('sign_in_link') || 'Sign in'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
