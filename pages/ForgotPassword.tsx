import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API
    setTimeout(() => {
        setIsSubmitted(true);
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark p-4 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 relative z-10 text-center">
        
        {!isSubmitted ? (
            <>
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                    <span className="material-icons-round text-3xl">lock_reset</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                    No worries! Enter your email and we'll send you reset instructions.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-left">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm font-medium"
                            placeholder="name@example.com"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center"
                    >
                        {isLoading ? <span className="material-icons-round animate-spin">refresh</span> : 'Send Reset Link'}
                    </button>
                </form>
            </>
        ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <span className="material-icons-round text-3xl">mark_email_read</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                    We've sent a password reset link to <span className="font-bold text-gray-800 dark:text-gray-200">{email}</span>
                </p>
                <button 
                    onClick={() => setIsSubmitted(false)}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    Resend Email
                </button>
            </div>
        )}

        <div className="mt-8">
            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center gap-2 transition-colors">
                <span className="material-icons-round text-base">arrow_back</span> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;