
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Theme } from '../types';
import AuthModal from './AuthModal';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'signup' }>({ open: false, mode: 'login' });
  const location = useLocation();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  if (isLoggedIn) {
    navLinks.push({ name: 'Library', path: '/library' });
  }

  const isActive = (path: string) => location.pathname === path;

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModal({ open: true, mode });
    setIsOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <i className="fa-solid fa-image text-white text-xl"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">
                Lama<span className="text-primary-500">Image</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-8 pr-6 border-r border-slate-200 dark:border-slate-800">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-bold transition-all relative group/link ${
                      isActive(link.path)
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-300'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-500 transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover/link:w-full'}`}></span>
                  </Link>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:rotate-12 active:scale-90"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <i className="fa-solid fa-moon text-lg"></i>
                  ) : (
                    <i className="fa-solid fa-sun text-lg"></i>
                  )}
                </button>

                {isLoggedIn ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary-500 shadow-inner group cursor-pointer hover:border-primary-400 transition-all">
                      <i className="fa-solid fa-user text-sm group-hover:scale-110 transition-transform"></i>
                    </div>
                    <button 
                      onClick={logout}
                      className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:scale-105 transition-all active:scale-95"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => openAuth('login')}
                      className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-all hover:translate-y-[-1px] active:scale-95 px-2"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => openAuth('signup')}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:scale-95"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
               <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
              >
                {theme === 'light' ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-all active:scale-90"
              >
                <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-200">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-4 rounded-lg text-base font-medium transition-all active:bg-slate-100 ${
                    isActive(link.path)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-500'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 space-y-3 px-3">
                {isLoggedIn ? (
                  <button 
                    onClick={logout}
                    className="w-full py-4 text-center font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => openAuth('login')}
                      className="w-full py-4 text-center font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => openAuth('signup')}
                      className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
                    >
                      Sign Up Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        initialMode={authModal.mode} 
      />
    </>
  );
};

export default Header;
