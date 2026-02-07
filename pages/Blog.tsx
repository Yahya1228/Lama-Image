
import React from 'react';
import BlogCard from '../components/BlogCard';
import { BlogPost } from '../types';

const Blog: React.FC = () => {
  const posts: BlogPost[] = [
    {
      id: '1',
      title: 'How to Compress Images Without Losing Quality',
      excerpt: 'Master the art of reducing file size while maintaining pixel-perfect clarity using our advanced AI-driven compression algorithms.',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
      date: 'March 24, 2026',
      category: 'TUTORIAL',
      path: '/blog/how-to-compress'
    },
    {
      id: '2',
      title: 'Top AI Techniques to Enhance Blurry Photos',
      excerpt: 'Stop deleting blurry shots. Learn how neural detail recovery can reconstruct lost textures and sharpen your edges instantly.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
      date: 'March 20, 2026',
      category: 'AI TECHNOLOGY',
      path: '/blog/top-ai-techniques'
    },
    {
      id: '3',
      title: 'Why File Size Matters: Optimize Images for Web & Social Media',
      excerpt: 'Page speed is a major ranking factor. Discover why choosing the right optimization level can boost your SEO and engagement.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      date: 'March 15, 2026',
      category: 'SEO STRATEGY',
      path: '/blog/why-file-size-matters'
    },
    {
      id: '4',
      title: 'Beginner Guide: When to Compress & When to Enhance Your Image',
      excerpt: 'Not every image needs the same treatment. We break down the workflow to help you decide which tool to use for the best results.',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
      date: 'March 10, 2026',
      category: 'GUIDE',
      path: '/blog/compress-vs-enhance'
    },
    {
      id: '5',
      title: '5 Reasons Your Images Look Low Quality (And How to Fix Them)',
      excerpt: 'From artifacts to poor lighting, identify the common issues that ruin photos and how to restore them with professional tools.',
      image: 'https://images.unsplash.com/photo-1527335932348-4dbe0d4e3aa5?auto=format&fit=crop&q=80&w=800',
      date: 'March 05, 2026',
      category: 'TIPS',
      path: '/blog/low-quality-fix'
    },
    {
      id: '6',
      title: 'The Power of AI: Transform Your Images in Seconds',
      excerpt: 'Go behind the scenes of LamaImage to see how we use next-gen processing engines to deliver high-performance visual results.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
      date: 'February 28, 2026',
      category: 'INSIGHTS',
      path: '/blog/power-of-ai'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Blog Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-50 dark:border-slate-800">
        <div className="absolute inset-0 -z-10 opacity-40 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 right-0 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-50 dark:bg-sky-900/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 rounded-full text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
            Official Knowledge Hub
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            LamaImage Blog — <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-sky-400">
              Improve Your Images with Smart Techniques
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Deep dives into image optimization, the future of AI restoration, and professional tips to make your visual content shine on any platform.
          </p>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <BlogCard post={post} />
              </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-24 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[48px] p-12 lg:p-20 border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
               <i className="fa-solid fa-wand-magic-sparkles text-2xl text-primary-500"></i>
             </div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Ready to optimize?</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-lg mx-auto font-medium text-lg">
               Take what you've learned and apply it to your images instantly using our professional tools.
             </p>
             <a 
               href="/" 
               className="inline-flex items-center px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-2xl shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
             >
               Start Processing Now
               <i className="fa-solid fa-arrow-right ml-3"></i>
             </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
