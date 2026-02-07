
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <h1 className="text-9xl font-black text-slate-100 dark:text-slate-800">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-4xl font-black text-primary-600">Lost?</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-1"
        >
          <i className="fa-solid fa-house mr-2"></i> Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
