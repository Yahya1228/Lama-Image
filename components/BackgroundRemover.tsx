
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

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
  const [needsKeySelection, setNeedsKeySelection] = useState(false);
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
      setResultUrl(null);
      setResultBlob(null);
      setIsDone(false);
      setIsSaved(false);
      setError(null);
      setNeedsKeySelection(false);
    }
  };

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setNeedsKeySelection(false);
        setError(null);
        // Automatically retry after selection
        if (selectedFile) handleRemoveBackground();
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = await fileToBase64(selectedFile);

      const prompt = `Task: Extract the main subject and remove the background. Return only a transparent PNG.`;

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
            const resDataUrl = `data:${part.inlineData.mimeType};base64,${base64Res}`;
            const res = await fetch(resDataUrl);
            const blob = await res.blob();
            
            setResultBlob(blob);
            setResultUrl(resDataUrl);
            setIsDone(true);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) throw new Error("No processed image returned from AI.");
    } catch (err: any) {
      console.error('BG Removal error:', err);
      const msg = err.message || "";
      const isAuthError = msg.toLowerCase().includes("permission denied") || 
                          msg.toLowerCase().includes("api key") || 
                          msg.toLowerCase().includes("requested entity was not found") ||
                          msg.toLowerCase().includes("403");

      if (isAuthError) {
        setNeedsKeySelection(true);
        setError(
          <div className="text-center py-2 space-y-3">
            <p className="font-bold text-red-600">Authentication Required</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Subject extraction requires a Google Cloud project with active billing. Your current session key has insufficient permissions.
            </p>
          </div>
        );
      } else {
        setError(`AI Error: ${msg || "Try a different image."}`);
      }
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

      await supabase.storage.from('images').upload(filePath, resultBlob);
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

      await supabase.from('images').insert([{
        user_id: session.user.id,
        name: fileName,
        url: publicUrl,
        type: 'bg-removed',
        date: new Date().toISOString(),
        size: `${(resultBlob.size / 1024).toFixed(1)} KB`
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
    setResultUrl(null);
    setResultBlob(null);
    setIsDone(false);
    setIsSaved(false);
    setError(null);
    setNeedsKeySelection(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mr-4 text-indigo-600">
             <i className="fa-solid fa-person-rays text-lg"></i>
          </div>
          Background Remover
        </h3>
        <div className="flex items-center space-x-2">
           <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
             <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> AI Subject Engine
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
            <i className="fa-solid fa-scissors text-indigo-500 text-4xl"></i>
          </div>
          <p className="text-2xl text-slate-700 dark:text-slate-200 font-black mb-2">Remove Background</p>
          <p className="text-slate-400 text-sm font-medium">Auto-detect subjects and create transparent PNGs</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[32px] text-slate-800 dark:text-slate-200 shadow-sm animate-in zoom-in-95">
              {error}
              {needsKeySelection && window.aistudio && (
                <button 
                  onClick={handleOpenKeySelection}
                  className="mt-4 w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Connect Paid Project Key
                </button>
              )}
            </div>
          )}

          <div className="relative group rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 aspect-video flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 10%, transparent 10%)', backgroundSize: '10px 10px' }}></div>
            
            {isProcessing && (
               <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                  <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-6 animate-pulse">Scanning Subject...</p>
               </div>
            )}
            
            <img src={resultUrl || previewUrl!} className={`max-w-full max-h-full object-contain p-4 transition-all duration-1000 ${isProcessing ? 'scale-95 blur-sm opacity-50' : 'scale-100'}`} alt="Preview" />
            
            {!isProcessing && (
              <button onClick={clear} className="absolute top-4 right-4 z-40 w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-red-500 shadow-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
          </div>

          {!isDone && !isProcessing && !needsKeySelection && (
            <button 
              onClick={handleRemoveBackground} 
              className="group w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-indigo-500/30 transition-all hover:scale-[1.02] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="flex items-center justify-center space-x-4">
                <i className="fa-solid fa-scissors text-lg group-hover:rotate-12 transition-transform"></i> 
                <span className="text-lg">Remove Background Now</span>
              </div>
            </button>
          )}

          {isDone && (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-[48px] p-10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-8 text-indigo-700 dark:text-indigo-400 font-black text-2xl">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mr-5 shadow-2xl shadow-indigo-500/20">
                    <i className="fa-solid fa-check text-xl"></i>
                  </div>
                  Subject Isolated
                </div>
              </div>
              
              <div className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <button onClick={clear} className="px-8 py-6 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-[28px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <i className="fa-solid fa-rotate-left"></i>
                  </button>
                  <a 
                    href={resultUrl!} 
                    download={`lama_nobg_${selectedFile.name.split('.')[0]}.png`} 
                    className="flex-grow text-center bg-indigo-600 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 text-lg"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download PNG</span>
                  </a>
                </div>
                {isLoggedIn && (
                  <button 
                    onClick={handleSaveToLibrary} 
                    disabled={isSaved || isSaving} 
                    className={`w-full py-5 rounded-[24px] font-black text-sm transition-all flex items-center justify-center space-x-2 ${isSaved ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-black shadow-xl'}`}
                  >
                    {isSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className={`fa-solid ${isSaved ? 'fa-check' : 'fa-cloud-arrow-up'}`}></i>}
                    <span>{isSaved ? 'Saved to Cloud' : isSaving ? 'Uploading Assets...' : 'Save to My Library'}</span>
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
