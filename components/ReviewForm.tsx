
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

interface ReviewFormProps {
  onReviewSubmitted?: (review: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onReviewSubmitted }) => {
  const [formData, setFormData] = useState({ name: '', email: '', rating: 5, comment: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) return;

    setStatus('submitting');
    try {
      const newReviewData = { 
        name: formData.name, 
        email: formData.email || null, 
        rating: formData.rating, 
        comment: formData.comment,
        approved: false, // Default to false for moderation
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert([newReviewData])
        .select(); // Select the inserted row to get the generated ID

      if (error) throw error;
      
      setStatus('success');
      
      // If parent provided a callback, send the new review back to be displayed immediately
      if (onReviewSubmitted && data && data[0]) {
        onReviewSubmitted(data[0] as Review);
      }

      setFormData({ name: '', email: '', rating: 5, comment: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl">
      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Leave a Review</h3>
      
      {status === 'success' ? (
        <div className="py-8 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <i className="fa-solid fa-check text-2xl"></i>
          </div>
          <p className="font-bold text-slate-800 dark:text-white">Thanks! Your review is now visible to you and pending admin approval.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email (Optional)</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className={`text-2xl transition-transform hover:scale-110 ${formData.rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                >
                  <i className="fa-solid fa-star"></i>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Your Review</label>
            <textarea 
              required
              rows={4}
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white resize-none"
              placeholder="What do you think about LamaImage?"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={status === 'submitting'}
            className="group w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            {status === 'submitting' ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Submit Review'}
          </button>
          
          {status === 'error' && (
            <p className="text-xs text-red-500 font-bold text-center mt-2">Failed to submit. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
