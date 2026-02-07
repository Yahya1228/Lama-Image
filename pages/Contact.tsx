
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className="py-20 lg:py-28 relative overflow-hidden">
       {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50 dark:bg-primary-900/10 -z-10 skew-x-12 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-white mb-8">Get In <span className="text-primary-600">Touch</span></h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed max-w-lg">
              Have questions about our API, custom solutions for your business, or just want to say hello? Our team is ready to help.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <i className="fa-solid fa-envelope text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">Email Us</h4>
                  <p className="text-slate-500">support@lamaimage.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">Our Office</h4>
                  <p className="text-slate-500">Silicon Valley, CA 94025, USA</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <i className="fa-solid fa-clock text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">Business Hours</h4>
                  <p className="text-slate-500">Mon - Fri, 9am - 6pm EST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 lg:p-12 rounded-[40px] shadow-2xl shadow-primary-500/10 border border-slate-100 dark:border-slate-700">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-paper-plane text-3xl text-green-600"></i>
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Message Sent!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl transition-transform hover:scale-105"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    placeholder="Enter your name" 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                    placeholder="you@example.com" 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Your Message</label>
                  <textarea 
                    required
                    rows={4} 
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    placeholder="How can we help?" 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all dark:text-white resize-none"
                  ></textarea>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
