
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Post3: React.FC = () => {
  useEffect(() => {
    document.title = "Why File Size Matters | LamaImage";
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="bg-white dark:bg-slate-900 min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center text-sm font-bold text-primary-600 mb-10 hover:translate-x-[-4px] transition-transform">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back to Blog
        </Link>
        
        <div className="mb-12">
          <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600">SEO STRATEGY</span>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-white mt-6 mb-4">Why File Size Matters for Web & Social Media</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Published March 15, 2026 • 4 min read</p>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
          alt="Web Performance" 
          className="w-full aspect-video object-cover rounded-[40px] shadow-2xl mb-16"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-8">
          <p className="text-xl font-medium leading-relaxed">
            A 5MB image might look great, but if it takes 3 seconds to load, half your audience is already gone. Efficiency is the ultimate feature of modern design.
          </p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">SEO and Core Web Vitals</h2>
          <p>
            Google's ranking algorithms prioritize page speed. Images are typically the largest payload on a web page. By optimizing your assets, you directly improve your Largest Contentful Paint (LCP) and boost your search rankings.
          </p>
          <h2 className="Social Media Algorithms">Social Media Algorithms</h2>
          <p>
            Platforms like Instagram and Facebook apply their own heavy-handed compression. If you upload a massive file, their algorithm might butcher it. Uploading an already optimized file ensures *your* quality settings stay in control.
          </p>
        </div>

        <div className="mt-20 p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 text-center">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Don't let slow images kill your reach.</h3>
          <Link to="/" className="inline-flex items-center px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:scale-105 transition-all">
            Optimize Now <i className="fa-solid fa-rocket ml-3"></i>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Post3;
