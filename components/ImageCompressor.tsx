
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ImageCompressor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(80);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [result, setResult] = useState<{ originalSize: number; compressedSize: number; ratio: number } | null>(null);
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
      setCompressedBlob(null);
      setResult(null);
      setProgress(0);
      setIsSaved(false);
    }
  };

  const compressImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(20);

    const img = new Image();
    img.src = URL.createObjectURL(selectedFile);
    
    img.onload = () => {
      setProgress(50);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      setProgress(80);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedBlob(blob);
            setResult({
              originalSize: selectedFile.size,
              compressedSize: blob.size,
              ratio: Math.floor((1 - (blob.size / selectedFile.size)) * 100)
            });
          }
          setProgress(100);
          setIsProcessing(false);
        },
        'image/jpeg',
        quality / 100
      );
    };
  };

  const handleSaveToLibrary = async () => {
    if (!selectedFile || !compressedBlob || !result) return;
    setIsSaving(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error("You must be logged in to save images.");
      }

      const user = session.user;
      
      // Strict naming convention: images/USER_ID/TIMESTAMP_FILENAME
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${cleanFileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error("Critical: The 'images' bucket does not exist in your Supabase Storage. Please create it first.");
        }
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
        type: 'compressed',
        date: new Date().toISOString(),
        size: formatSize(result.compressedSize)
      }]);

      if (dbError) {
        await supabase.storage.from('images').remove([filePath]);
        throw new Error(`Database Error: ${dbError.message}`);
      }

      setIsSaved(true);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    setResult(null);
    setProgress(0);
    setIsSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const visualStyle = useMemo(() => {
    if (!selectedFile) return {};
    const blurValue = (100 - quality) / 25; 
    const contrastValue = 1 + (100 - quality) / 500;
    return {
      filter: `blur(${blurValue}px) contrast(${contrastValue})`,
      transition: 'filter 0.2s ease-out'
    };
  }, [quality, selectedFile]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-3 text-primary-600">
             <i className="fa-solid fa-compress text-sm"></i>
          </div>
          Image Compressor
        </h3>
        {selectedFile && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
            Live Preview Mode
          </span>
        )}
      </div>

      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-16 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-slate-700/30 transition-all group relative overflow-hidden"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
            <i className="fa-solid fa-cloud-arrow-up text-primary-500 text-3xl"></i>
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-300 font-black mb-2">Drop your image here</p>
          <p className="text-slate-400 text-sm font-medium">Supports JPG, PNG, WEBP • Max 10MB</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 aspect-video flex items-center justify-center">
            <img 
              src={previewUrl!} 
              alt="Preview" 
              style={visualStyle}
              className="max-w-full max-h-full object-contain p-4" 
            />
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
               <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[10px] font-black text-slate-600 dark:text-slate-300 shadow-xl">
                  {quality > 80 ? 'HIGH FIDELITY' : quality > 40 ? 'BALANCED' : 'LOW BITRATE'}
               </div>
               <div className="bg-primary-600 px-4 py-2 rounded-xl text-[10px] font-black text-white shadow-xl shadow-primary-500/30">
                  EST. -{Math.max(0, 100 - quality)}% SIZE
               </div>
            </div>

            <button 
              onClick={clear}
              className="absolute top-4 right-4 w-11 h-11 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-xl border border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-90 z-10"
              title="Remove image"
            >
              <i className="fa-solid fa-trash-can text-lg"></i>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary-500 mr-2 animate-pulse"></div>
                Compression Quality
              </label>
              <span className="text-sm font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-4 py-1.5 rounded-xl border border-primary-100 dark:border-primary-900/30">
                {quality}%
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="95" 
              value={quality} 
              onChange={(e) => {
                setQuality(parseInt(e.target.value));
                setResult(null); 
              }}
              disabled={isProcessing}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 transition-all"
            />
            <div className="flex justify-between mt-4 text-[11px] text-slate-400 font-black uppercase tracking-widest">
              <span className={quality < 30 ? "text-primary-500 transition-colors" : ""}>Small File</span>
              <span className={quality >= 30 && quality <= 70 ? "text-primary-500 transition-colors" : ""}>Balanced</span>
              <span className={quality > 70 ? "text-primary-500 transition-colors" : ""}>Best Quality</span>
            </div>
          </div>

          {!result && !isProcessing && (
            <button 
              onClick={compressImage}
              className="group w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-primary-500/30 transition-all hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center space-x-3 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <i className="fa-solid fa-bolt-lightning text-sm group-hover:animate-bounce"></i>
              <span>Compress {formatSize(selectedFile.size)} Image</span>
            </button>
          )}

          {isProcessing && (
            <div className="space-y-6 py-4">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300 relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-[length:20px_20px] bg-gradient-to-r from-white/20 to-transparent animate-[shimmer_1s_infinite]"></div>
                </div>
              </div>
              <p className="text-sm font-black text-center text-slate-500 tracking-wide uppercase">
                Optimizing Pixels... {progress}%
              </p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-[40px] p-10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center text-green-700 dark:text-green-400 font-black text-xl">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-xl shadow-green-500/20">
                    <i className="fa-solid fa-check text-lg"></i>
                  </div>
                  Ready for Download
                </div>
                <div className="text-sm font-black px-6 py-2.5 bg-green-500 text-white rounded-2xl shadow-xl shadow-green-500/30">
                  -{result.ratio}% Smaller
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-green-100 dark:border-green-900/20 shadow-sm transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] uppercase text-slate-400 font-black mb-2 tracking-widest">Original Size</p>
                  <p className="text-xl font-black text-slate-700 dark:text-slate-300">{formatSize(result.originalSize)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-primary-100 dark:border-primary-900/20 shadow-sm transition-transform hover:scale-[1.02]">
                  <p className="text-[10px] uppercase text-primary-400 font-black mb-2 tracking-widest">Optimized Size</p>
                  <p className="text-xl font-black text-primary-600">{formatSize(result.compressedSize)}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button 
                    onClick={clear}
                    className="px-7 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-[24px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                  </button>
                  <a 
                    href={compressedBlob ? URL.createObjectURL(compressedBlob) : '#'} 
                    download={`lama_compressed_${selectedFile.name}`}
                    className="flex-grow text-center bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[24px] transition-all shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                    <i className="fa-solid fa-circle-down"></i>
                    <span>Download Optimized Image</span>
                  </a>
                </div>
                
                {isLoggedIn && (
                  <button 
                    onClick={handleSaveToLibrary}
                    disabled={isSaved || isSaving}
                    className={`w-full py-4 rounded-[20px] font-black text-sm transition-all flex items-center justify-center space-x-2 ${isSaved ? 'bg-green-100 text-green-600 cursor-default' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 hover:scale-[1.01] active:scale-95 shadow-xl'}`}
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

export default ImageCompressor;
