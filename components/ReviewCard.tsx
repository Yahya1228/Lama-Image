
import React from 'react';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-primary-500/5 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className="flex space-x-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <i key={i} className={`fa-solid fa-star text-sm ${i < review.rating ? 'opacity-100' : 'opacity-20'}`}></i>
          ))}
        </div>
        <span className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-full">
          <i className="fa-solid fa-circle-check mr-1.5"></i> Verified User
        </span>
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 italic mb-8 leading-relaxed font-serif text-lg">
        "{review.comment}"
      </p>
      
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-100 to-sky-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-primary-500 font-black text-xl border border-white dark:border-slate-700 shadow-sm">
          {review.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h5 className="font-bold text-slate-900 dark:text-white leading-tight">{review.name}</h5>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
