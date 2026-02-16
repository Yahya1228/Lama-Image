
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReviews();
    }
  }, [isAuthenticated]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password is admin123, or use environment variable
    if (password === (process.env.ADMIN_PASS || 'admin123')) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state immediately for feedback
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: !currentStatus } : r));
    } catch (err: any) {
      alert('Error updating: ' + err.message);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white dark:bg-slate-800 p-10 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary-600">
            <i className="fa-solid fa-lock text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2">Admin Panel</h1>
          <p className="text-center text-slate-500 text-sm mb-8">Manage site reviews and visibility</p>
          <input 
            type="password" 
            autoFocus
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none mb-6 dark:text-white"
            placeholder="Enter Admin Password"
          />
          <button className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl hover:bg-primary-700 transition-all active:scale-95">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white">Review Management</h1>
            <p className="text-slate-500 mt-1">Status changes reflect instantly on the homepage.</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-all">Logout</button>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-primary-500">
            <i className="fa-solid fa-spinner animate-spin text-4xl"></i>
          </div>
        ) : (
          <div className="overflow-hidden bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Review Content</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">No reviews have been submitted yet.</td>
                  </tr>
                ) : (
                  reviews.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-bold text-slate-800 dark:text-white">{r.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{r.email || 'Anonymous'}</div>
                        <div className="text-[9px] text-slate-400 mt-2 font-black">{new Date(r.created_at).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex text-amber-400 text-[10px] mb-2">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star ${i < r.rating ? 'opacity-100' : 'opacity-20'}`}></i>
                          ))}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 max-w-sm line-clamp-3">"{r.comment}"</div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center ${r.approved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${r.approved ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          {r.approved ? 'Publicly Visible' : 'Pending Approval'}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => toggleApproval(r.id, r.approved)}
                            title={r.approved ? "Hide from homepage" : "Show on homepage"}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm ${r.approved ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          >
                            <i className={`fa-solid ${r.approved ? 'fa-eye-slash' : 'fa-check-double'}`}></i>
                          </button>
                          <button 
                            onClick={() => deleteReview(r.id)}
                            title="Delete permanently"
                            className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center transition-all hover:bg-red-200 shadow-sm"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
