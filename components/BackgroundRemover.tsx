
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { removeBackground } from '@imgly/background-removal';

const BackgroundRemover: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
      setResultUrl(null);
      setResultBlob(null);
      setIsDone(false);
      setIsSaved(false);
      setError(null);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Optimization: Downscale large images before processing to speed up AI inference
      // Most background removal tasks don't need full resolution to generate a high-quality mask
      let fileToProcess: File | Blob = selectedFile;
      
      const MAX_DIMENSION = 1200; // Good balance between speed and quality
      const img = new Image();
      const objectUrl = URL.createObjectURL(selectedFile);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        fileToProcess = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
      }
      
      URL.revokeObjectURL(objectUrl);

      const blob = await removeBackground(fileToProcess, {
        model: 'small',
        device: 'gpu',
        proxyToWorker: true,
        progress: (status: string, progress: number) => {
          console.log(status, progress);
        }
      });
      
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setIsDone(true);
    } catch (err: any) {
      console.error('Extraction failure:', err);
      setError(`Processing failed: ${err.message || "An unexpected error occurred."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!resultBlob || !selectedFile) return;
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Please log in to save.");

      const fileName = `${Date.now()}_nobg_${selectedFile.name.split('.')[0]}.png`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, resultBlob);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('images').insert([{
        user_id: session.user.id,
        name: selectedFile.name,
        url: publicUrl,
        type: 'bg-removed',
        date: new Date().toISOString(),
        size: `${(resultBlob.size / 1024).toFixed(1)} KB`
      }]);

      if (dbError) throw dbError;

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
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultBlob(null);
    setIsDone(false);
    setIsSaved(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mr-4 text-indigo-600">
             <i className="fa-solid fa-scissors text-lg"></i>
          </div>
          AI Background Remover
        </h3>
        <div className="flex items-center space-x-2">
           <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
             <i className="fa-solid fa-microchip mr-1"></i> Neural Engine
           </span>
        </div>
      </div>

      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-20 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group relative overflow-hidden"
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
            <i className="fa-solid fa-person-rays text-indigo-500 text-4xl"></i>
          </div>
          <p className="text-2xl text-slate-700 dark:text-slate-200 font-black mb-2">Upload Photo</p>
          <p className="text-slate-400 text-sm font-medium">Isolate subject with local AI</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[32px] text-slate-800 dark:text-slate-200 shadow-sm animate-in zoom-in-95">
              {error}
            </div>
          )}

          <div className="relative group rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 aspect-video flex items-center justify-center shadow-inner">
            {/* Checkerboard background for transparency preview */}
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'conic-gradient(#000 0.25turn, #fff 0.25turn 0.5turn, #000 0.5turn 0.75turn, #fff 0.75turn)', backgroundSize: '20px 20px' }}></div>
            
            {isProcessing && (
               <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                  <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-6 animate-pulse">Processing Subject...</p>
               </div>
            )}
            <img src={resultUrl || previewUrl!} className={`max-w-full max-h-full object-contain p-4 transition-all duration-1000 ${isProcessing ? 'scale-95 blur-sm opacity-50' : 'scale-100'}`} alt="Preview" />
            
            {!isProcessing && (
              <button onClick={clear} className="absolute top-4 right-4 z-40 w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-red-500 shadow-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
          </div>

          {!isDone && !isProcessing && !error && (
            <button 
              onClick={handleRemoveBackground} 
              className="group w-full bg-gradient-to-r from-indigo-600 to-primary-500 hover:from-indigo-700 hover:to-primary-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-indigo-500/30 transition-all hover:scale-[1.02] relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
               <div className="flex items-center justify-center space-x-4">
                 <i className="fa-solid fa-scissors text-lg group-hover:rotate-12 transition-transform"></i> 
                 <span className="text-lg">Remove Background Now</span>
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
                  Success!
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button onClick={clear} className="px-6 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-[24px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <i className="fa-solid fa-rotate-left"></i>
                  </button>
                  <a 
                    href={resultUrl!} 
                    download={`NoBG_${selectedFile.name.split('.')[0]}.png`} 
                    className="flex-grow text-center bg-indigo-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 text-lg"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download PNG</span>
                  </a>
                </div>
                {isLoggedIn && (
                  <button 
                    onClick={handleSaveToLibrary} 
                    disabled={isSaved || isSaving} 
                    className={`w-full py-4 rounded-[20px] font-black text-sm transition-all flex items-center justify-center space-x-2 ${isSaved ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-black shadow-xl'}`}
                  >
                    {isSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className={`fa-solid ${isSaved ? 'fa-check' : 'fa-cloud-arrow-up'}`}></i>}
                    <span>{isSaved ? 'Saved to Library' : isSaving ? 'Uploading...' : 'Save to My Library'}</span>
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

export default BackgroundRemover;
