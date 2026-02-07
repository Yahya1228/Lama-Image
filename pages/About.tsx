
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-white mb-6">Our Mission</h1>
          <div className="w-24 h-2 bg-primary-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed italic font-serif">
            "Making the web faster, one pixel at a time."
          </p>
        </div>

        <div className="space-y-12">
          <section className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">The LamaImage Story</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4">
              <p>
                Founded in 2024, LamaImage began as a small internal tool for a group of web developers who were frustrated by the slow and cumbersome process of optimizing assets for high-traffic websites.
              </p>
              <p>
                We realized that while there were many tools available, they were either expensive, full of annoying ads, or severely compromised on the visual integrity of the images. We wanted to build something different.
              </p>
              <p>
                Today, LamaImage is powered by cutting-edge AI models that understand the nuance of human perception, ensuring that every image we process looks stunning while weighing as little as possible.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary-600 text-white p-10 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Privacy First</h3>
              <p className="opacity-90 leading-relaxed">
                We don't sell your data. We don't even store your images. Most of our processing happens directly in your browser or on secure, ephemeral servers that wipe data the moment your session ends.
              </p>
            </div>
            <div className="bg-slate-800 dark:bg-slate-700 text-white p-10 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Always Free</h3>
              <p className="opacity-90 leading-relaxed">
                Basic image optimization is a fundamental need for a healthy web. That's why LamaImage will always offer a fully featured free tier for individuals and small teams.
              </p>
            </div>
          </div>

          <section className="text-center py-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-10">Our Global Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-4xl font-black text-primary-600 mb-2">50M+</p>
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Images Processed</p>
              </div>
              <div>
                <p className="text-4xl font-black text-primary-600 mb-2">1.2PB</p>
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Bandwidth Saved</p>
              </div>
              <div>
                <p className="text-4xl font-black text-primary-600 mb-2">120+</p>
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Countries Served</p>
              </div>
              <div>
                <p className="text-4xl font-black text-primary-600 mb-2">99.9%</p>
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Uptime Reliability</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
