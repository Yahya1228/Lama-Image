
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ImageCompressor from '../components/ImageCompressor';
import ImageEnhancer from '../components/ImageEnhancer';
import BackgroundRemover from '../components/BackgroundRemover';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import { Feature, Review } from '../types';
import { supabase } from '../lib/supabase';

const Home: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'none' | 'compress' | 'enhance' | 'remove-bg'>('none');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchParams] = useSearchParams();
  const toolRef = useRef<HTMLDivElement>(null);

  const curatedReviews: Review[] = [
    { id: 'c1', name: 'Sarah Jenkins', rating: 5, comment: 'LamaImage has completely replaced my expensive desktop tools for quick web exports. The compression is magic!', approved: true, created_at: new Date().toISOString() },
    { id: 'c2', name: 'Mark Wu', rating: 5, comment: 'I needed a quick way to optimize assets for a client site. This tool saved me hours and the results were flawless.', approved: true, created_at: new Date().toISOString() },
    { id: 'c3', name: 'Elena Rodriguez', rating: 5, comment: 'The AI enhancer actually works! I recovered a blurry shot that I thought was unusable. Amazing service.', approved: true, created_at: new Date().toISOString() },
  ];

  const fetchApprovedReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        setReviews(data as Review[]);
      } else {
        setReviews(curatedReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews(curatedReviews);
    }
  };

  useEffect(() => {
    fetchApprovedReviews();

    const channel = supabase
      .channel('public:reviews')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reviews' }, 
        (payload) => {
          fetchApprovedReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (toolParam === 'compress' || toolParam === 'enhance' || toolParam === 'remove-bg') {
      setActiveTool(toolParam as 'compress' | 'enhance' | 'remove-bg');
      setTimeout(() => {
        toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams]);

  const handleNewReview = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev].slice(0, 6));
    const reviewsSection = document.getElementById('reviews-section');
    reviewsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTool = (tool: 'compress' | 'enhance' | 'remove-bg') => {
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
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>Next-gen AI Subject Extraction Engine</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-8">
            Professional AI Tools <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-primary-400">For Every Pixel</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
            Shrink, sharpen, and remove backgrounds instantly — no signup required, fully free, and incredibly fast.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button 
              onClick={() => scrollToTool('compress')}
              className="group w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <i className="fa-solid fa-compress mr-2"></i> Compress
            </button>
            <button 
              onClick={() => scrollToTool('enhance')}
              className="group w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-black rounded-2xl shadow-sm hover:shadow-xl flex items-center justify-center transition-all hover:bg-slate-50 dark:hover:bg-slate-750 hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-2 text-amber-500"></i> AI Enhancer
            </button>
            <button 
              onClick={() => scrollToTool('remove-bg')}
              className="group w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-scissors mr-2"></i> Remove BG
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Tool Area */}
      {activeTool !== 'none' && (
        <section ref={toolRef} className="pb-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-10">
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] inline-flex border border-slate-200 dark:border-slate-700 shadow-inner overflow-x-auto max-w-full">
                <button 
                  onClick={() => setActiveTool('compress')}
                  className={`px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all whitespace-nowrap ${activeTool === 'compress' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Compress
                </button>
                <button 
                  onClick={() => setActiveTool('enhance')}
                  className={`px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all whitespace-nowrap ${activeTool === 'enhance' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Enhance
                </button>
                <button 
                  onClick={() => setActiveTool('remove-bg')}
                  className={`px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all whitespace-nowrap ${activeTool === 'remove-bg' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Remove BG
                </button>
              </div>
            </div>
            {activeTool === 'compress' ? <ImageCompressor /> : activeTool === 'enhance' ? <ImageEnhancer /> : <BackgroundRemover />}
          </div>
        </section>
      )}

      {/* How it Works Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">How It Works</h2>
            <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-lg">
              Experience professional-grade image processing in three simple steps.
              Fast, intuitive, and designed for high-performance workflows.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-0 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Upload Image', desc: 'Drag and drop your photos directly into our processing tool.', icon: 'fa-cloud-arrow-up' },
              { step: '02', title: 'AI Process', desc: 'Select between high-ratio compression or AI-powered detail enhancement.', icon: 'fa-gears' },
              { step: '03', title: 'Done!', desc: 'Download your optimized image in seconds with zero loss in quality.', icon: 'fa-circle-down' },
            ].map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative mb-10 group">
                    <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-[38px] flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary-500/10">
                      <i className={`fa-solid ${item.icon} text-4xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform`}></i>
                    </div>
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary-600 rounded-full border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center">
                      <span className="text-sm font-black text-white">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] text-sm lg:text-base">
                    {item.desc}
                  </p>
                </div>
                {idx < 2 && (
                  <div className="hidden lg:flex items-center justify-center h-32 px-4 opacity-20">
                    <div className="w-16 h-1 border-t-4 border-dotted border-slate-400"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Professionals Section (Centered & Modern) */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
              Built for Professionals, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-sky-400">Free for Everyone.</span>
            </h2>
            <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed mx-auto max-w-2xl">
              LamaImage provides enterprise-grade AI tools without the enterprise price tag. 
              Everything you need to optimize your digital assets in one place.
            </p>
            <Link 
              to="/about" 
              className="inline-flex items-center px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-750 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              Learn Our Mission <i className="fa-solid fa-arrow-right ml-3 text-xs opacity-50"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.id}
                className="group p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform text-primary-500">
                  <i className={`fa-solid ${feature.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (Dynamic & Manageable) */}
      <section id="reviews-section" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Loved by Professionals</h2>
            <p className="text-slate-500 dark:text-slate-400">Real feedback from our global community of creators.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
             <ReviewForm onReviewSubmitted={handleNewReview} />
          </div>

          <div className="mt-20 text-center">
            <Link 
              to="/?tool=compress"
              className="group inline-flex items-center px-10 py-5 bg-primary-600 text-white font-black rounded-2xl shadow-2xl shadow-primary-500/30 hover:scale-105 transition-all overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              Optimize Your Images Now <i className="fa-solid fa-bolt-lightning ml-3"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
