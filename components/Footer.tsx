
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-sky-400 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-image text-white text-sm"></i>
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-800 dark:text-white">
                Lama<span className="text-primary-500">Image</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Powerful online tools to compress and enhance your images with professional quality in seconds. Fully free and privacy-focused.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">Contact</Link></li>
              <li><Link to="/blog" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">Latest Blog</Link></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-xs">Tools</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">Image Compressor</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">Image Enhancer</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">Batch Processing</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm">API for Devs</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-xs">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-500 hover:text-white transition-all">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-500 hover:text-white transition-all">
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-500 hover:text-white transition-all">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-500 hover:text-white transition-all">
                <i className="fa-brands fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
          <p className="mb-4 md:mb-0">© 2026 LamaImage — All Rights Reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary-500">Terms of Service</a>
            <a href="#" className="hover:text-primary-500">Cookies Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
