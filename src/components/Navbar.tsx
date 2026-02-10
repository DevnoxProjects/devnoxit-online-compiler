
import React from 'react';
import { Zap, Share2, Download, Settings, Github, Youtube, Facebook, Sun, Moon } from 'lucide-react';
import { Theme } from '../types';

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  return (
    <nav className={`h-16 border-b flex items-center justify-between px-6 z-50 ${
      theme === 'dark'
        ? 'bg-[#111] border-slate-800'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-1 group cursor-pointer">
          <img src="/logo.png" alt="Devnox IT Logo" className="w-24 h-24 rounded-lg shadow-lg shadow-indigo-600/20" />
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavLink label="Features" theme={theme} />
          <NavLink label="Formats" theme={theme} />
          <NavLink label="About" theme={theme} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-4 mr-4">
          <a
            href="https://www.facebook.com/devnoxit"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 group cursor-pointer ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-black hover:text-gray-800'} transition-colors`}
          >
            <Facebook size={16} />
            <span className="text-xs font-medium">Facebook</span>
          </a>

          <a
            href="https://www.youtube.com/@DevNox-IT"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 group cursor-pointer ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-black hover:text-gray-800'} transition-colors`}
          >
            <Youtube size={16} />
            <span className="text-xs font-medium">YouTube</span>
          </a>

          <a
            href="https://github.com/DevnoxProjects"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 group cursor-pointer ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-black hover:text-gray-800'} transition-colors`}
          >
            <Github size={16} />
            <span className="text-xs font-medium">GitHub</span>
          </a>
        </div>

        <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Share2 size={14} />
          Share
        </button>
        
        <button className={`hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-black hover:text-gray-800 hover:bg-gray-100'} rounded-xl transition-all`}>
          <Download size={14} />
          Export
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl transition-all ${
            theme === 'dark'
              ? 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10'
              : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/10'
          }`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className={`p-2 rounded-xl transition-all ${
          theme === 'dark'
            ? 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10'
            : 'text-gray-600 hover:text-indigo-500 hover:bg-indigo-500/10'
        }`}>
          <Settings size={18} />
        </button>

        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
          Get Started
        </button>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ label: string; theme: Theme }> = ({ label, theme }) => (
  <a href="#" className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-black hover:text-gray-800'} transition-colors uppercase tracking-widest`}>{label}</a>
);

export default Navbar;
