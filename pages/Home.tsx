
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImageCompressor from '../components/ImageCompressor';
import ImageEnhancer from '../components/ImageEnhancer';
import { Feature, Testimonial } from '../types';

const Home: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'none' | 'compress' | 'enhance'>('none');
  const [searchParams] = useSearchParams();
  const toolRef = useRef<HTMLDivElement>(null);

  // Handle deep-linking from URL parameters (e.g., /?tool=compress)
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (toolParam === 'compress' || toolParam === 'enhance') {
      setActiveTool(toolParam as 'compress' | 'enhance');
      // Delay slightly to ensure the component has rendered the tool area before scrolling
      setTimeout(() => {
        toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams]);

  const scrollToTool = (tool: 'compress' | 'enhance') => {
    setActiveTool(tool);
    setTimeout(() => {
      toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const features: Feature[] = [
    { id: '1', title: 'Fast AI Processing', description: 'Advanced algorithms handle your images in milliseconds, not minutes.', icon: 'fa-bolt-lightning' },
    { id: '2', title: 'High Quality Output', description: 'Zero compromise on quality. Our AI preserves every vital detail.', icon: 'fa-gem' },
    { id: '3', title: 'Mobile Friendly', description: 'Process images on the go from any smartphone or tablet browser.', icon: 'fa-mobile-screen' },
    { id: '4', title: 'Privacy Focused', description: 'Your images are processed locally or deleted immediately after.', icon: 'fa-shield-halved' },
  ];

  const testimonials: Testimonial[] = [
    { id: '1', name: 'Sarah Jenkins', role: 'Photographer', content: 'LamaImage has completely replaced my expensive desktop tools for quick web exports. The compression is magic!', avatar: 'https://picsum.photos/100/100?random=1' },
    { id: '2', name: 'Mark Wu', role: 'Web Dev', content: 'I needed a quick way to optimize assets for a client site. This tool saved me hours and the results were flawless.', avatar: 'https://picsum.photos/100/100?random=2' },
    { id: '3', name: 'Elena Rodriguez', role: 'Content Creator', content: 'The AI enhancer actually works! I recovered a blurry shot that I thought was unusable. Amazing service.', avatar: 'https://picsum.photos/100/100?random=3' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 bg-white dark:bg-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100 dark:bg-primary-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100 dark:bg-sky-900/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 dark:text-slate-400 text-xs font-bold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
            <span>Next-gen AI Image Processing Engine</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-8">
            Transform Your Images <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-sky-400">In Seconds</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
            Shrink, sharpen, and enhance your images instantly — no signup required, fully free, and incredibly fast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button 
              onClick={() => scrollToTool('compress')}
              className="group w-full sm:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-compress mr-2 opacity-80 group-hover:opacity-100"></i> Compress Image
            </button>
            <button 
              onClick={() => scrollToTool('enhance')}
              className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-2xl shadow-sm flex items-center justify-center transition-all hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-2 text-amber-500"></i> AI Enhancer
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Tool Area */}
      {activeTool !== 'none' && (
        <section ref={toolRef} className="pb-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-10">
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] inline-flex border border-slate-200 dark:border-slate-700 shadow-inner">
                <button 
                  onClick={() => setActiveTool('compress')}
                  className={`px-8 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeTool === 'compress' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}
                >
                  Compress
                </button>
                <button 
                  onClick={() => setActiveTool('enhance')}
                  className={`px-8 py-2.5 rounded-[18px] text-sm font-bold transition-all ${activeTool === 'enhance' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500'}`}
                >
                  Enhance
                </button>
              </div>
            </div>
            {activeTool === 'compress' ? <ImageCompressor /> : <ImageEnhancer />}
          </div>
        </section>
      )}

      {/* How it Works - Ultimate Professional Aesthetic */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">How It Works</h2>
            <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-lg">
              Experience professional-grade image processing in three simple steps.
              Fast, intuitive, and designed for high-performance workflows.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-0 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Upload Image', desc: 'Drag and drop your photos directly into our processing tool.', icon: 'fa-cloud-arrow-up' },
              { step: '02', title: 'Compress or Enhance', desc: 'Select between high-ratio compression or AI-powered detail enhancement.', icon: 'fa-gears' },
              { step: '03', title: 'Download Image', desc: 'Download your optimized image in seconds with zero loss in quality.', icon: 'fa-circle-down' },
            ].map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative mb-10 group">
                    {/* Icon Squircle Container */}
                    <div className="w-32 h-32 bg-primary-50/50 dark:bg-primary-900/10 rounded-[38px] flex items-center justify-center border border-primary-100/50 dark:border-primary-800/20 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:bg-primary-100/60">
                      <i className={`fa-solid ${item.icon} text-4xl text-primary-600 dark:text-primary-400`}></i>
                    </div>
                    {/* Step Badge */}
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-xl flex items-center justify-center">
                      <span className="text-sm font-black text-slate-400">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] text-sm lg:text-base">
                    {item.desc}
                  </p>
                </div>
                
                {/* Connecting Arrow */}
                {idx < 2 && (
                  <div className="hidden lg:flex items-center justify-center h-32 px-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300">
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Text Focused Professional Layout */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
            Built for Professionals, <br />
            <span className="text-primary-500">Free for Everyone.</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-slate-500 dark:text-slate-400 mb-16 leading-relaxed">
            We believe in keeping the internet fast. LamaImage provides the essential tools you need to optimize your digital footprint without any friction.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {features.map((feature) => (
              <div key={feature.id} className="p-8 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-6">
                  <i className={`fa-solid ${feature.icon} text-primary-500 text-xl`}></i>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Loved by Professionals</h2>
            <p className="text-slate-500">Join thousands of creatives using LamaImage daily.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[32px] border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all">
                <div className="flex items-center space-x-1 mb-8 text-amber-400">
                  <i className="fa-solid fa-star text-sm"></i>
                  <i className="fa-solid fa-star text-sm"></i>
                  <i className="fa-solid fa-star text-sm"></i>
                  <i className="fa-solid fa-star text-sm"></i>
                  <i className="fa-solid fa-star text-sm"></i>
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic mb-10 leading-relaxed font-serif text-lg">"{t.content}"</p>
                <div className="flex items-center space-x-4">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full border-2 border-primary-100" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white leading-tight">{t.name}</h5>
                    <p className="text-sm text-slate-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
