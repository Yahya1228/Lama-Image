
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

const ImageEnhancer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intensity, setIntensity] = useState(75);
  const [isDone, setIsDone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [needsKeySelection, setNeedsKeySelection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    checkKeyStatus();

    return () => subscription.unsubscribe();
  }, []);

  const checkKeyStatus = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setNeedsKeySelection(!hasKey);
    }
  };

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
      checkKeyStatus();
    }
  };

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setNeedsKeySelection(false);
        setError(null);
        if (selectedFile) handleEnhance();
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile) return;

    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKeySelection(true);
        setError(
          <div className="text-center py-2 space-y-3">
            <p className="font-bold text-amber-600 uppercase">Action Required</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              AI Image Enhancement requires a Google Cloud project key with active billing enabled.
            </p>
          </div>
        );
        return;
      }
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Re-initialize for every call as per instructions
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = await fileToBase64(selectedFile);

      const prompt = `Task: Professional AI Image Enhancement. Intensity Level: ${intensity}%. Instructions: Upscale and restore details, sharpen edges, and remove noise. Return a high-quality result.`;

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

      if (!foundImage) throw new Error("The AI engine failed to return an enhanced image part.");
    } catch (err: any) {
      console.error('Enhancement error:', err);
      const msg = err.message || "";
      const isAuthError = msg.toLowerCase().includes("permission denied") || 
                          msg.toLowerCase().includes("api key") || 
                          msg.toLowerCase().includes("requested entity was not found") ||
                          msg.toLowerCase().includes("403") ||
                          msg.toLowerCase().includes("not found");

      if (isAuthError) {
        setNeedsKeySelection(true);
        setError(
          <div className="text-center py-2 space-y-3">
            <p className="font-black text-red-600 uppercase">Access Denied</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Authentication failed. Please select a Google Cloud project with an active billing account in the AI Studio dialog.
            </p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary-500 hover:underline">Billing Documentation</a>
          </div>
        );
      } else {
        setError(`Processing failed: ${msg || "An unexpected error occurred."}`);
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
    checkKeyStatus();
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
             <i className="fa-solid fa-bolt-lightning mr-1"></i> AI Engine
           </span>
        </div>
      </div>

      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-20 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-all group relative overflow-hidden"
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
            <i className="fa-solid fa-image-portrait text-amber-500 text-4xl"></i>
          </div>
          <p className="text-2xl text-slate-700 dark:text-slate-200 font-black mb-2">Enhance Details</p>
          <p className="text-slate-400 text-sm font-medium">AI upscaling & detail restoration</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[32px] text-slate-800 dark:text-slate-200 shadow-sm animate-in zoom-in-95">
              {error}
              {needsKeySelection && window.aistudio && (
                <button 
                  onClick={handleOpenKeySelection}
                  className="mt-4 w-full py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <i className="fa-solid fa-key text-xs"></i>
                  <span>Select Paid Project Key</span>
                </button>
              )}
            </div>
          )}

          {!error && needsKeySelection && (
             <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-[32px] flex flex-col items-center text-center">
                <i className="fa-solid fa-circle-info text-amber-500 mb-3 text-xl"></i>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Onboarding Needed</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">You must select a paid project key to use AI Image Enhancement.</p>
                <button 
                  onClick={handleOpenKeySelection}
                  className="w-full py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 shadow-sm hover:shadow-md transition-all"
                >
                  Connect Key
                </button>
             </div>
          )}

          <div className="relative group rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 aspect-video flex items-center justify-center shadow-inner">
            {isProcessing && (
               <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                  <div className="w-20 h-20 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-6 animate-pulse">Enhancing Pixels...</p>
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
            <div className="flex justify-between mt-4 text-[11px] text-slate-400 font-black uppercase tracking-widest">
              <span className={intensity < 30 ? "text-amber-500 transition-colors" : ""}>Soft</span>
              <span className={intensity >= 30 && intensity <= 70 ? "text-amber-500 transition-colors" : ""}>Balanced</span>
              <span className={intensity > 70 ? "text-amber-500 transition-colors" : ""}>Ultra HD</span>
            </div>
          </div>

          {!isDone && !isProcessing && !needsKeySelection && !error && (
            <button 
              onClick={handleEnhance} 
              className="group w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.02] relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
               <div className="flex items-center justify-center space-x-4">
                 <i className="fa-solid fa-wand-magic-sparkles text-lg group-hover:rotate-12 transition-transform"></i> 
                 <span className="text-lg">Run AI Restoration</span>
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
                    download={`LamaEnhanced_${selectedFile.name}`} 
                    className="flex-grow text-center bg-primary-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-primary-500/30 hover:scale-[1.02] hover:bg-primary-700 transition-all flex items-center justify-center space-x-3 text-lg"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download Image</span>
                  </a>
                </div>
                {isLoggedIn && (
                  <button 
                    onClick={handleSaveToLibrary} 
                    disabled={isSaved || isSaving} 
                    className={`w-full py-4 rounded-[20px] font-black text-sm transition-all flex items-center justify-center space-x-2 ${isSaved ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-black shadow-xl'}`}
                  >
                    {isSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className={`fa-solid ${isSaved ? 'fa-check' : 'fa-cloud-arrow-up'}`}></i>}
                    <span>{isSaved ? 'Saved to Cloud' : isSaving ? 'Uploading...' : 'Save to My Library'}</span>
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
