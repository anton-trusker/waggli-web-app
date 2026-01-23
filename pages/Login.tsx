
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { supabase } from '../services/supabase';
import { updateUserProfileDB } from '../services/db';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
    const { login } = useApp();
    const { t } = useLocalization();
    const navigate = useNavigate();
    const [email, setEmail] = useState('demo@waggli.com');
    const [password, setPassword] = useState('password');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            const message = err.message || 'Unknown error';
            if (message.includes('Invalid login credentials')) {
                toast.error('Invalid email or password.');
            } else if (message.includes('Email not confirmed')) {
                toast.error('Please confirm your email address.');
            } else {
                toast.error('Login failed: ' + message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-surface-light dark:bg-background-dark">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-accent relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                            <span className="material-icons-round text-3xl">pets</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Pawzly</h1>
                    </div>
                    <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                        {t('login_hero_title') || 'The smartest way to care for your pets.'}
                    </h2>
                    <p className="text-lg opacity-90 leading-relaxed">
                        {t('login_hero_subtitle') || 'Join thousands of pet parents who use Pawzly to track health records, appointments, and get AI-powered insights for their furry friends.'}
                    </p>

                    <div className="mt-12 flex gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-gray-300 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                <span className="material-icons-round text-base">star</span>
                                <span className="material-icons-round text-base">star</span>
                                <span className="material-icons-round text-base">star</span>
                                <span className="material-icons-round text-base">star</span>
                                <span className="material-icons-round text-base">star</span>
                            </div>
                            <span className="text-xs font-bold opacity-80">Trusted by 10,000+ owners</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <span className="material-icons-round text-5xl text-primary">pets</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('welcome_back') || 'Welcome back'}</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('login_instructions') || 'Please enter your details to sign in.'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('email_label') || 'Email Address'}</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                    placeholder="name@example.com"
                                />
                                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('password_label') || 'Password'}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                    placeholder="••••••••"
                                />
                                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <span className="material-icons-round">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('remember_me') || 'Remember me'}</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-bold text-primary hover:text-primary-hover">
                                {t('forgot_password') || 'Forgot password?'}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                t('sign_in_button') || 'Sign In'
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-4 bg-surface-light dark:bg-background-dark text-gray-500 font-medium">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Google</span>
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-icons-round text-gray-900 dark:text-white text-xl">apple</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Apple</span>
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {t('no_account') || "Don't have an account?"}{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline">
                            {t('sign_up_link') || 'Sign up for free'}
                        </Link>
                    </p>
                </div>

                <div className="absolute bottom-6 text-xs text-gray-400">
                    © 2024 Pawzly Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
