
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ImageEnhancer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intensity, setIntensity] = useState(50);
  const [isDone, setIsDone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Sync login state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsDone(false);
      setProgress(0);
      setIsSaved(false);
    }
  };

  const handleEnhance = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    
    const speed = 100 + (intensity / 2);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsDone(true);
          return 100;
        }
        return prev + 5;
      });
    }, speed);
  };

  const handleSaveToLibrary = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsSaving(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error("You must be logged in to save images.");
      }

      const user = session.user;

      // 1. Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_enhanced_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // 3. Save reference in Database
      const { error: dbError } = await supabase.from('images').insert([{
        user_id: user.id,
        name: selectedFile.name,
        url: publicUrl,
        type: 'enhanced',
        date: new Date().toISOString(),
        size: 'High Res'
      }]);

      if (dbError) {
        await supabase.storage.from('images').remove([filePath]);
        throw new Error(`Database save failed: ${dbError.message}. Make sure you ran the SQL policy fix.`);
      }

      setIsSaved(true);
    } catch (err: any) {
      console.error('Save failed details:', err);
      alert(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const clear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDone(false);
    setProgress(0);
    setIsSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIntensityLabel = (val: number) => {
    if (val < 30) return 'Subtle';
    if (val < 70) return 'Balanced';
    return 'Maximum';
  };

  const visualStyle = useMemo(() => {
    if (!selectedFile) return {};
    const blurVal = Math.max(0, (30 - intensity) / 10);
    const contrastVal = 1 + (intensity / 300);
    const saturateVal = 1 + (intensity / 400);
    const sharpnessVal = intensity > 70 ? 'drop-shadow(0 0 1px rgba(0,0,0,0.1))' : 'none';

    return {
      filter: `blur(${blurVal}px) contrast(${contrastVal}) saturate(${saturateVal}) ${sharpnessVal}`,
      transition: 'filter 0.3s ease-out'
    };
  }, [intensity, selectedFile]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-3 text-amber-600">
             <i className="fa-solid fa-sparkles text-sm"></i>
          </div>
          AI Image Enhancer
        </h3>
        {selectedFile && (
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800">
            Live Pixel Inspect
          </span>
        )}
      </div>

      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-16 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-all group relative overflow-hidden"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
            <i className="fa-solid fa-wand-magic-sparkles text-amber-500 text-3xl"></i>
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-300 font-black mb-2">Enhance low-res photos</p>
          <p className="text-slate-400 text-sm font-medium">PNG, JPG, WEBP • Deep Learning Restoration</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 aspect-video flex items-center justify-center">
            {isProcessing && (
               <div className="absolute inset-0 flex items-center justify-center z-30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
                  <div className="w-20 h-20 border-8 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
               </div>
            )}
            
            <img 
              src={previewUrl!} 
              alt="Preview" 
              style={visualStyle}
              className={`max-w-full max-h-full object-contain p-4 ${isDone ? 'scale-[1.02]' : ''}`} 
            />

            {(isProcessing || isDone) && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-20">
                <div className="absolute top-0 w-4 h-full bg-white/30 shadow-[0_0_40px_white] animate-[scan_2.5s_linear_infinite]"></div>
              </div>
            )}
            
            <button 
              onClick={clear}
              className="absolute top-4 right-4 z-40 w-11 h-11 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-xl border border-slate-100 dark:border-slate-700"
            >
              <i className="fa-solid fa-trash-can text-lg"></i>
            </button>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none z-30">
               <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[10px] font-black text-amber-600 shadow-xl uppercase tracking-widest">
                  {isDone ? 'RESTORATION COMPLETE' : `Intensity: ${getIntensityLabel(intensity)}`}
               </div>
               <div className="bg-amber-500 px-4 py-2 rounded-xl text-[10px] font-black text-white shadow-xl shadow-amber-500/30 uppercase tracking-widest">
                  {intensity}% AI RECOVERY
               </div>
            </div>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[32px] border border-amber-100/50 dark:border-amber-900/20 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                Detail Intensity
              </label>
              <span className="text-sm font-black text-amber-600 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                {intensity}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={intensity} 
              onChange={(e) => {
                setIntensity(parseInt(e.target.value));
                setIsDone(false);
              }}
              disabled={isProcessing}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500 transition-all"
            />
            <div className="flex justify-between mt-4 text-[11px] text-slate-400 font-black uppercase tracking-widest">
              <span>Natural</span>
              <span>Balanced</span>
              <span>Ultra-HD</span>
            </div>
          </div>

          {!isDone && !isProcessing && (
            <button 
              onClick={handleEnhance}
              className="group w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-sm group-hover:rotate-12 transition-transform"></i>
              <span>Process High-Res Enhancement</span>
            </button>
          )}

          {isProcessing && (
            <div className="space-y-6 py-4">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-300 relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-[length:20px_20px] bg-gradient-to-r from-white/20 to-transparent animate-[shimmer_1s_infinite]"></div>
                </div>
              </div>
              <p className="text-sm font-black text-center text-amber-600 tracking-wide uppercase animate-pulse">
                Running Neural Detail Recovery... {progress}%
              </p>
            </div>
          )}

          {isDone && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-[40px] p-10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center text-green-700 dark:text-green-400 font-black text-xl">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-xl shadow-green-500/20">
                    <i className="fa-solid fa-check text-lg"></i>
                  </div>
                  Ready for Download
                </div>
                <div className="text-sm font-black px-6 py-2.5 bg-green-500 text-white rounded-2xl shadow-xl shadow-green-500/30">
                  AI Enhanced
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-green-100 dark:border-green-900/20 shadow-sm transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] uppercase text-slate-400 font-black mb-2 tracking-widest">Original Pixels</p>
                  <p className="text-xl font-black text-slate-700 dark:text-slate-300">Standard Detail</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-primary-100 dark:border-primary-900/20 shadow-sm transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] uppercase text-primary-400 font-black mb-2 tracking-widest">Enhanced Pixels</p>
                  <p className="text-xl font-black text-primary-600">4K Ultra HD</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button 
                    onClick={clear}
                    className="px-7 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-[24px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                  </button>
                  <a 
                    href={previewUrl!} 
                    download={`lama_enhanced_${selectedFile.name}`}
                    className="flex-grow text-center bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[24px] transition-all shadow-2xl shadow-primary-500/30 active:scale-[0.98] flex items-center justify-center space-x-3"
                  >
                    <i className="fa-solid fa-circle-down"></i>
                    <span>Download Optimized Image</span>
                  </a>
                </div>

                {isLoggedIn && (
                  <button 
                    onClick={handleSaveToLibrary}
                    disabled={isSaved || isSaving}
                    className={`w-full py-4 rounded-[20px] font-black text-sm transition-all flex items-center justify-center space-x-2 ${isSaved ? 'bg-green-100 text-green-600 cursor-default' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 shadow-xl'}`}
                  >
                    {isSaving ? (
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                    ) : (
                      <i className={`fa-solid ${isSaved ? 'fa-check' : 'fa-cloud-arrow-up'}`}></i>
                    )}
                    <span>{isSaved ? 'Saved to Cloud Library' : isSaving ? 'Uploading to Cloud...' : 'Save to My Library'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageEnhancer;
