import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';

const ProviderAuth = () => {
    const { login } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // This is a stub for provider-specific login logic
    // Real app would verify 'is_provider' flag
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            // Check if provider profile exists, if not redirect to register
            navigate('/provider/dashboard');
        } catch (error) {
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-surface-dark rounded-3xl shadow-xl">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
                        <span className="material-icons-round text-3xl text-primary">storefront</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Provider Portal</h2>
                    <p className="text-gray-500">Manage your business on Waggly</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 p-3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 p-3"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-500">Don't have an account?</p>
                    <Link to="/provider/register" className="font-bold text-primary hover:underline">Register your business</Link>
                </div>
            </div>
        </div>
    );
};

export default ProviderAuth;
