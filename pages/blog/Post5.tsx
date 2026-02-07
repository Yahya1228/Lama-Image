
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Post5: React.FC = () => {
  useEffect(() => {
    document.title = "5 Reasons Your Images Look Low Quality | LamaImage";
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="bg-white dark:bg-slate-900 min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center text-sm font-bold text-primary-600 mb-10 hover:translate-x-[-4px] transition-transform">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back to Blog
        </Link>
        
        <div className="mb-12">
          <span className="px-4 py-1.5 bg-red-50 dark:bg-red-900/30 rounded-full text-[10px] font-black uppercase tracking-widest text-red-600">TIPS</span>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-white mt-6 mb-4">5 Reasons Your Images Look Low Quality</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Published March 05, 2026 • 6 min read</p>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1527335932348-4dbe0d4e3aa5?auto=format&fit=crop&q=80&w=1200" 
          alt="Quality Tips" 
          className="w-full aspect-video object-cover rounded-[40px] shadow-2xl mb-16"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-8">
          <p className="text-xl font-medium leading-relaxed">
            Not all bad photos are bad photography. Often, technical hurdles degrade your best work. Let's fix them.
          </p>
          <ul className="list-decimal list-inside space-y-4 font-bold text-slate-800 dark:text-white">
            <li className="text-xl">Oversimplified Compression</li>
            <li className="text-xl">Low Resolution Upscaling</li>
            <li className="text-xl">Digital Noise and ISO Grain</li>
            <li className="text-xl">Aggressive Social Media Filters</li>
            <li className="text-xl">Inconsistent Light Ratios</li>
          </ul>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">The AI Fix</h2>
          <p>
            Most of these issues stem from "lost information." AI doesn't just clean what's there; it references a vast library of "perfect" pixels to intelligently fill in the blanks, effectively reversing the damage of low resolution and bad compression.
          </p>
        </div>

        <div className="mt-20 p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 text-center">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Stop settling for "okay" quality.</h3>
          <Link to="/" className="inline-flex items-center px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:scale-105 transition-all">
            Fix My Image <i className="fa-solid fa-magic ml-3"></i>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Post5;
