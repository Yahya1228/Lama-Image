
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SavedImage } from '../types';
import { supabase } from '../lib/supabase';

const Library: React.FC = () => {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      // RLS handles the privacy here - you only see what you own
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
      } else if (data) {
        setImages(data as SavedImage[]);
      }
      setLoading(false);
    };

    fetchImages();
  }, [navigate]);

  const deleteImage = async (image: SavedImage) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this image permanently?");
    if (!confirmDelete) return;

    setDeletingId(image.id);
    try {
      // 1. Parse the storage path from the URL
      // Expected URL: .../storage/v1/object/public/images/USER_ID/FILENAME.jpg
      let storagePath = '';
      try {
        const url = new URL(image.url);
        const pathSegments = url.pathname.split('/');
        const imagesIdx = pathSegments.indexOf('images');
        if (imagesIdx !== -1) {
          storagePath = pathSegments.slice(imagesIdx + 1).join('/');
        }
      } catch (e) {
        console.warn("Could not parse storage path via URL object, falling back to split.");
        const parts = image.url.split('/images/');
        if (parts.length > 1) storagePath = parts[1];
      }

      // 2. Delete from Supabase Storage if path was found
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([storagePath]);

        if (storageError) {
          console.warn('Storage file deletion warning:', storageError.message);
        }
      }

      // 3. Delete from Database (Always do this even if storage fails to keep DB clean)
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      // 4. Update UI
      setImages(prev => prev.filter(img => img.id !== image.id));
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white mb-2">My Library</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">Private Cloud Storage</p>
          </div>
          <Link 
            to="/" 
            className="px-8 py-3 bg-primary-600 text-white font-black rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 transition-all flex items-center"
          >
            <i className="fa-solid fa-plus mr-2"></i> New Process
          </Link>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Secure Vault...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="py-32 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <i className="fa-solid fa-folder-open text-3xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">No Images Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Upload and save images from the homepage to see them here.</p>
            <Link to="/" className="text-primary-600 font-black uppercase tracking-widest text-sm hover:underline">
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {images.map((image) => (
              <div 
                key={image.id} 
                className="group bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Bucket+Not+Found';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${image.type === 'compressed' ? 'bg-primary-500' : 'bg-amber-500'}`}>
                      {image.type}
                    </span>
                  </div>
                  
                  {/* Deleting Overlay */}
                  {deletingId === image.id && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white">
                      <i className="fa-solid fa-circle-notch animate-spin text-2xl mb-2"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">Wiping Data...</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => deleteImage(image)}
                      disabled={deletingId !== null}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 hover:scale-110 transition-transform shadow-xl disabled:opacity-50"
                      title="Delete permanently"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                    <a 
                      href={image.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-xl"
                      title="View Full Image"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </a>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate mb-1">{image.name}</h3>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{new Date(image.date).toLocaleDateString()}</span>
                    <span className="text-primary-500 font-bold">{image.size || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
