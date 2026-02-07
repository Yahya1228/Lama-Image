
import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <article className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full">
      {/* Thumbnail Container */}
      <div className="h-56 overflow-hidden relative">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="px-4 py-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary-600 shadow-xl border border-white/20 dark:border-slate-700/50">
            {post.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content Container */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          <i className="fa-regular fa-calendar-check mr-2 text-primary-500"></i>
          {post.date}
        </div>
        
        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4 group-hover:text-primary-500 transition-colors leading-tight">
          {post.title}
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
          {post.excerpt}
        </p>

        <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
          <Link 
            to={post.path} 
            className="group/btn inline-flex items-center text-sm font-black text-primary-600 dark:text-primary-400 transition-all"
          >
            <span className="relative">
              Read More
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all group-hover/btn:w-full"></span>
            </span>
            <div className="ml-3 w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center transition-all group-hover/btn:bg-primary-600 group-hover/btn:text-white">
              <i className="fa-solid fa-arrow-right-long text-xs transition-transform group-hover/btn:translate-x-0.5"></i>
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
