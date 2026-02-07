
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name }
          }
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setIsSuccess(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
              <i className="fa-solid fa-image text-white text-lg"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {mode === 'login' ? 'Log in to access your saved images' : 'Start processing images like a pro for free'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-check text-3xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Success!</h3>
              <p className="text-slate-500 dark:text-slate-400">Redirecting you to the dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  {mode === 'login' && (
                    <button type="button" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Forgot?</button>
                  )}
                </div>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                />
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-70 mt-4 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Login' : 'Sign Up Free'}</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={toggleMode}
                className="ml-2 text-primary-600 dark:text-primary-400 font-black hover:underline"
              >
                {mode === 'login' ? 'Create Account' : 'Login instead'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
