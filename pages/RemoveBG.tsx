
import React from 'react';
import BackgroundRemover from '../components/BackgroundRemover';

const RemoveBG: React.FC = () => {
  return (
    <main className="min-h-screen py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-white mb-4">
            AI Background Remover
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Instantly remove backgrounds from images with pixel-perfect precision. 
            Powered by high-performance neural subject extraction.
          </p>
        </div>
        <BackgroundRemover />
      </div>
    </main>
  );
};

export default RemoveBG;
