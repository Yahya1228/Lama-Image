
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

const ImageEnhancer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intensity, setIntensity] = useState(50);
  const [isDone, setIsDone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

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
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const base64Data = await fileToBase64(selectedFile);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Enhance this image to ultra-high quality. 
      Reconstruct missing details, remove compression artifacts, and upscale the resolution. 
      Intensity level: ${intensity}%. 
      Maintain the original subject, colors, and composition exactly, but make it look professional and sharp.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: selectedFile.type } },
            { text: prompt }
          ]
        }
      });

      let foundImage = false;
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64Res = part.inlineData.data;
            const enhancedDataUrl = `data:${part.inlineData.mimeType};base64,${base64Res}`;
            
            // Convert back to blob for saving
            const res = await fetch(enhancedDataUrl);
            const blob = await res.blob();
            
            setEnhancedBlob(blob);
            setEnhancedUrl(enhancedDataUrl);
            setIsDone(true);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error("AI did not return an enhanced image. Please try again.");
      }
    } catch (err: any) {
      console.error('Enhancement failed:', err);
      setError(err.message || "Failed to connect to AI engine. Check your API key or connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    const dataToSave = enhancedBlob || selectedFile;
    if (!dataToSave || !selectedFile) return;
    
    setIsSaving(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error("You must be logged in to save images.");
      }

      const user = session.user;
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${Date.now()}_enhanced_${cleanFileName}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, dataToSave, {
          cacheControl: '3600',
          upsert: false,
          contentType: enhancedBlob?.type || selectedFile.type
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('images').insert([{
        user_id: user.id,
        name: selectedFile.name,
        url: publicUrl,
        type: 'enhanced',
        date: new Date().toISOString(),
        size: 'AI Enhanced HD'
      }]);

      if (dbError) {
        await supabase.storage.from('images').remove([filePath]);
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      setIsSaved(true);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(err.message || 'An unexpected error occurred while saving.');
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

  const getIntensityLabel = (val: number) => {
    if (val < 30) return 'Subtle';
    if (val < 70) return 'Balanced';
    return 'Maximum';
  };

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
            Real AI Restoration
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
          <p className="text-slate-400 text-sm font-medium">PNG, JPG, WEBP • AI Pixel Reconstruction</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          <div className="relative group rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 aspect-video flex items-center justify-center">
            {isProcessing && (
               <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                  <div className="w-20 h-20 border-8 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-xs font-black text-amber-600 uppercase tracking-widest animate-pulse">Reconstructing Pixels...</p>
               </div>
            )}
            
            <img 
              src={enhancedUrl || previewUrl!} 
              alt="Preview" 
              className={`max-w-full max-h-full object-contain p-4 transition-all duration-700 ${isDone ? 'scale-100' : 'opacity-80'}`} 
            />

            {isDone && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-20">
                <div className="absolute top-0 w-2 h-full bg-white/50 shadow-[0_0_20px_white] animate-[scan_2s_linear_infinite]"></div>
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
                  {isDone ? 'HD RECONSTRUCTION SUCCESS' : `Target: ${getIntensityLabel(intensity)}`}
               </div>
               <div className="bg-amber-500 px-4 py-2 rounded-xl text-[10px] font-black text-white shadow-xl shadow-amber-500/30 uppercase tracking-widest">
                  {isDone ? 'ENHANCED 4K' : 'AI PROCESSING READY'}
               </div>
            </div>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[32px] border border-amber-100/50 dark:border-amber-900/20 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                Restoration Intensity
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
              <span>Subtle</span>
              <span>Pro</span>
              <span>Maximum</span>
            </div>
          </div>

          {!isDone && !isProcessing && (
            <button 
              onClick={handleEnhance}
              className="group w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-sm group-hover:rotate-12 transition-transform"></i>
              <span>Run AI Detail Recovery</span>
            </button>
          )}

          {isDone && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-[40px] p-10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center text-green-700 dark:text-green-400 font-black text-xl">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-xl shadow-green-500/20">
                    <i className="fa-solid fa-check text-lg"></i>
                  </div>
                  Enhancement Complete
                </div>
                <div className="text-sm font-black px-6 py-2.5 bg-green-500 text-white rounded-2xl shadow-xl shadow-green-500/30">
                  AI Processed
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-green-100 dark:border-green-900/20 shadow-sm transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] uppercase text-slate-400 font-black mb-2 tracking-widest">Before</p>
                  <p className="text-xl font-black text-slate-700 dark:text-slate-300">Low Quality</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-primary-100 dark:border-primary-900/20 shadow-sm transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] uppercase text-primary-400 font-black mb-2 tracking-widest">After</p>
                  <p className="text-xl font-black text-primary-600">Ultra-HD Restore</p>
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
                    href={enhancedUrl!} 
                    download={`lama_enhanced_${selectedFile.name}`}
                    className="flex-grow text-center bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[24px] transition-all shadow-2xl shadow-primary-500/30 active:scale-[0.98] flex items-center justify-center space-x-3"
                  >
                    <i className="fa-solid fa-circle-down"></i>
                    <span>Download HD Image</span>
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
                    <span>{isSaved ? 'Enhanced Version Saved' : isSaving ? 'Uploading HD...' : 'Save to My Library'}</span>
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
