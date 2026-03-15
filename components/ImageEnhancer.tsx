
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Upscaler from 'upscaler';
import * as tf from '@tensorflow/tfjs';

const ImageEnhancer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [intensity, setIntensity] = useState(75);
  const [isDone, setIsDone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upscalerRef = useRef<any>(null);
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    const initUpscaler = async () => {
      setIsInitializing(true);
      try {
        // Try to initialize WebGL backend first
        await tf.setBackend('webgl');
        await tf.ready();

        // Performance & Compatibility flags
        try {
          const flags = tf.env().getFlags();
          if ('WEBGL_VERSION' in flags) tf.env().set('WEBGL_VERSION', 2);
          if ('WEBGL_PACK' in flags) tf.env().set('WEBGL_PACK', true);
        } catch (flagErr) {
          console.warn('Could not set some WebGL flags:', flagErr);
        }

        upscalerRef.current = new Upscaler();
      } catch (e) {
        console.warn('WebGL initialization failed, falling back to CPU:', e);
        try {
          await tf.setBackend('cpu');
          await tf.ready();
          upscalerRef.current = new Upscaler();
        } catch (cpuErr) {
          console.error('CPU backend also failed:', cpuErr);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initUpscaler();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

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
      setEnhancedUrl(null);
      setEnhancedBlob(null);
      setIsDone(false);
      setIsSaved(false);
      setError(null);
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile || !upscalerRef.current || !previewUrl) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Optimization: Downscale very large images before upscaling
      // Upscaling a 4K image by 2x/4x can easily crash a browser's memory
      let imageToUpscale: string | HTMLImageElement = previewUrl;
      
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const MAX_INPUT_DIMENSION = 800; // Safe limit for browser-based AI upscaling
      if (img.width > MAX_INPUT_DIMENSION || img.height > MAX_INPUT_DIMENSION) {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_INPUT_DIMENSION) {
            height *= MAX_INPUT_DIMENSION / width;
            width = MAX_INPUT_DIMENSION;
          }
        } else {
          if (height > MAX_INPUT_DIMENSION) {
            width *= MAX_INPUT_DIMENSION / height;
            height = MAX_INPUT_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        imageToUpscale = canvas.toDataURL('image/png');
      }

      const upscaledImage = await upscalerRef.current.upscale(imageToUpscale, {
        patchSize: 32, // Further reduced to 32 for maximum responsiveness
        padding: 2,
        progress: async (amount: number) => {
          setProgress(Math.round(amount * 100));
          // Use TensorFlow's native nextFrame to yield to the browser's UI thread
          await tf.nextFrame();
        }
      });
      
      const res = await fetch(upscaledImage);
      const blob = await res.blob();
      
      setEnhancedBlob(blob);
      setEnhancedUrl(upscaledImage);
      setIsDone(true);
    } catch (err: any) {
      console.error('Enhancement failure:', err);
      const isShaderError = err.message?.toLowerCase().includes('shader') || 
                           err.message?.toLowerCase().includes('link') || 
                           err.message?.toLowerCase().includes('webgl');
      
      if (isShaderError) {
        setError(
          <div className="space-y-4">
            <p className="font-bold text-red-600 dark:text-red-400">Graphics Error Detected</p>
            <p className="text-sm">Your browser's graphics engine (WebGL) failed to process the AI model. This is often due to hardware limitations or driver issues.</p>
            <button 
              onClick={async () => {
                setError(null);
                setIsProcessing(true);
                try {
                  await tf.setBackend('cpu');
                  await tf.ready();
                  upscalerRef.current = new Upscaler();
                  // Small delay to ensure state updates
                  setTimeout(() => handleEnhance(), 100);
                } catch (cpuErr: any) {
                  setError(`CPU fallback failed: ${cpuErr.message}`);
                  setIsProcessing(false);
                }
              }}
              className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <i className="fa-solid fa-microchip mr-2"></i> Try with CPU Backend (Slower)
            </button>
          </div>
        );
      } else {
        setError(`Processing failed: ${err.message || "An unexpected error occurred."}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    const dataToSave = enhancedBlob || selectedFile;
    if (!dataToSave || !selectedFile) return;
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Please log in to save.");

      const fileName = `${Date.now()}_restored_${selectedFile.name}`;
      const filePath = `${session.user.id}/${fileName}`;

      await supabase.storage.from('images').upload(filePath, dataToSave);
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

      await supabase.from('images').insert([{
        user_id: session.user.id,
        name: selectedFile.name,
        url: publicUrl,
        type: 'enhanced',
        date: new Date().toISOString(),
        size: intensity > 80 ? 'Ultra HD' : 'HD Enhanced'
      }]);

      setIsSaved(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const clear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setEnhancedUrl(null);
    setEnhancedBlob(null);
    setIsDone(false);
    setIsSaved(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mr-4 text-amber-600">
             <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
          </div>
          AI Image Enhancer
        </h3>
        <div className="flex items-center space-x-2">
           <span className="text-[9px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full border border-primary-100 dark:border-primary-800">
             <i className="fa-solid fa-microchip mr-1"></i> Neural Engine
           </span>
        </div>
      </div>

      {!selectedFile ? (
        <div 
          onClick={() => !isInitializing && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-20 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-all group relative overflow-hidden ${isInitializing ? 'opacity-50 cursor-wait' : ''}`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          {isInitializing ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mb-6"></div>
              <p className="text-xl text-slate-700 dark:text-slate-200 font-black mb-2">Initializing AI Engine...</p>
              <p className="text-slate-400 text-sm font-medium">Setting up neural networks for your browser</p>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <i className="fa-solid fa-image-portrait text-amber-500 text-4xl"></i>
              </div>
              <p className="text-2xl text-slate-700 dark:text-slate-200 font-black mb-2">Enhance Details</p>
              <p className="text-slate-400 text-sm font-medium">Neural restoration & AI upscaling</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[32px] text-slate-800 dark:text-slate-200 shadow-sm animate-in zoom-in-95">
              {error}
            </div>
          )}

          <div className="relative group rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 aspect-video flex items-center justify-center shadow-inner">
            {isProcessing && (
               <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
                    <span className="absolute text-xs font-black text-amber-600">{progress}%</span>
                  </div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-6 animate-pulse">Neural Rendering...</p>
               </div>
            )}
            <img src={enhancedUrl || previewUrl!} className={`max-w-full max-h-full object-contain p-4 transition-all duration-1000 ${isProcessing ? 'scale-95 blur-sm opacity-50' : 'scale-100'}`} alt="Preview" />
            
            {!isProcessing && (
              <button onClick={clear} className="absolute top-4 right-4 z-40 w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-red-500 shadow-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                Enhancement Intensity
              </label>
              <span className="text-sm font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-4 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                {intensity}%
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="100" 
              value={intensity} 
              onChange={(e) => {
                setIntensity(parseInt(e.target.value));
                setIsDone(false);
                setEnhancedUrl(null);
                setError(null);
              }}
              disabled={isProcessing}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500 disabled:opacity-50 transition-all"
            />
          </div>

          {!isDone && !isProcessing && !error && (
            <button 
              onClick={handleEnhance} 
              className="group w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.02] relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
               <div className="flex items-center justify-center space-x-4">
                 <i className="fa-solid fa-wand-magic-sparkles text-lg group-hover:rotate-12 transition-transform"></i> 
                 <span className="text-lg">Run AI Detail Recovery</span>
               </div>
            </button>
          )}

          {isDone && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-[40px] p-10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center text-green-700 dark:text-green-400 font-black text-2xl">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-xl shadow-green-500/20">
                    <i className="fa-solid fa-check text-xl"></i>
                  </div>
                  Ready
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button onClick={clear} className="px-6 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-[24px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <i className="fa-solid fa-rotate-left"></i>
                  </button>
                  <a 
                    href={enhancedUrl!} 
                    download={`Enhanced_${selectedFile.name}`} 
                    className="flex-grow text-center bg-primary-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-primary-500/30 hover:scale-[1.02] hover:bg-primary-700 transition-all flex items-center justify-center space-x-3 text-lg"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download HD Image</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageEnhancer;
