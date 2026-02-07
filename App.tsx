import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import About from './pages/About';
import Contact from './pages/Contact';
import Library from './pages/Library';
import NotFound from './pages/NotFound';
import Post1 from './pages/blog/Post1';
import Post2 from './pages/blog/Post2';
import Post3 from './pages/blog/Post3';
import Post4 from './pages/blog/Post4';
import Post5 from './pages/blog/Post5';
import Post6 from './pages/blog/Post6';
import { Theme } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-900', 'text-slate-100');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
      document.body.classList.remove('bg-slate-900', 'text-slate-100');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans selection:bg-primary-500 selection:text-white">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/how-to-compress" element={<Post1 />} />
            <Route path="/blog/top-ai-techniques" element={<Post2 />} />
            <Route path="/blog/why-file-size-matters" element={<Post3 />} />
            <Route path="/blog/compress-vs-enhance" element={<Post4 />} />
            <Route path="/blog/low-quality-fix" element={<Post5 />} />
            <Route path="/blog/power-of-ai" element={<Post6 />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/library" element={<Library />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;