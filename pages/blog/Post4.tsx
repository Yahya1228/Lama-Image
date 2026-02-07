
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Post4: React.FC = () => {
  useEffect(() => {
    document.title = "When to Compress & When to Enhance | LamaImage";
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="bg-white dark:bg-slate-900 min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center text-sm font-bold text-primary-600 mb-10 hover:translate-x-[-4px] transition-transform">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back to Blog
        </Link>
        
        <div className="mb-12">
          <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-full text-[10px] font-black uppercase tracking-widest text-green-600">GUIDE</span>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-white mt-6 mb-4">When to Compress & When to Enhance</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Published March 10, 2026 • 5 min read</p>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200" 
          alt="Choice Guide" 
          className="w-full aspect-video object-cover rounded-[40px] shadow-2xl mb-16"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-8">
          <p className="text-xl font-medium leading-relaxed">
            One shrinks your file, the other grows its quality. Knowing which path to take is the difference between a functional asset and a stunning visual.
          </p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Choose Compression When...</h2>
          <p>
            You have a high-resolution photo that is simply too heavy for the web. If your photo is already clear and sharp but weighs 10MB, the Compressor is your best friend. It maintains the look while stripping the weight.
          </p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Choose Enhancement When...</h2>
          <p>
            Your image is small, pixelated, or blurry. If you've downloaded a low-res thumbnail or have a shaky smartphone shot, the Enhancer uses AI to "fill in the gaps," upscaling the resolution and recovering lost details.
          </p>
        </div>

        <div className="mt-20 p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 text-center">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">The choice is yours. Both are free.</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-black rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 transition-all">
              Compress <i className="fa-solid fa-compress ml-3"></i>
            </Link>
            <Link to="/" className="inline-flex items-center px-8 py-3 bg-amber-500 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">
              Enhance <i className="fa-solid fa-wand-magic-sparkles ml-3"></i>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Post4;
