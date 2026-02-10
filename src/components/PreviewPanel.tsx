import React, { useEffect, useState, useRef } from 'react';
import { CodeState, Theme } from '../types';
import { Maximize2, Moon, Sun, RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface PreviewPanelProps {
  code: CodeState;
  theme: Theme;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, theme }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Automatically connect CSS and JS with HTML in the background
    const connectedHTML = code.html.replace(
      /<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi,
      '' // Remove any external CSS links since we're injecting inline
    ).replace(
      /<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi,
      '' // Remove any external JS scripts since we're injecting inline
    );

    // Debug: Check if code has content
    console.log('Code state:', code);
    console.log('Connected HTML:', connectedHTML);

    setSrcDoc(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Auto-connected CSS from editor */
            ${code.css}
            body { transition: background 0.3s ease; }
          </style>
        </head>
        <body>
          ${connectedHTML}
          <script>
            // Auto-connected JavaScript from editor
            // Intercept console calls to pipe to parent
            const originalLog = console.log;
            console.log = (...args) => {
              window.parent.postMessage({ type: 'CONSOLE_LOG', payload: args.join(' ') }, '*');
              originalLog.apply(console, args);
            };

            const originalError = console.error;
            console.error = (...args) => {
              window.parent.postMessage({ type: 'CONSOLE_ERROR', payload: args.join(' ') }, '*');
              originalError.apply(console, args);
            };

            const originalWarn = console.warn;
            console.warn = (...args) => {
              window.parent.postMessage({ type: 'CONSOLE_ERROR', payload: args.join(' ') }, '*');
              originalWarn.apply(console, args);
            };

            try {
              ${code.js}
            } catch (err) {
              console.error('JavaScript Error:', err.message);
              console.error('Stack:', err.stack);
            }


          </script>
        </body>
      </html>
    `);
  }, [code]);

  return (
    <div className="flex flex-col h-full bg-[#1e293b]">
      {/* Preview Header */}
      <div className="flex items-center justify-between h-12 px-4 bg-[#181818] border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-white uppercase tracking-widest">Output</span>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded ${viewMode === 'desktop' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded ${viewMode === 'mobile' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className={`p-1.5 ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-black hover:text-gray-800'}`}><RefreshCw size={14} /></button>
          <button className={`p-1.5 ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-black hover:text-gray-800'}`}><Moon size={14} /></button>
          <button className={`p-1.5 ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-black hover:text-gray-800'}`}><Maximize2 size={14} /></button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 flex items-center justify-center bg-[#0f172a] overflow-auto">
        <div 
          className={`bg-white rounded-lg shadow-2xl transition-all duration-300 overflow-hidden
            ${viewMode === 'desktop' ? 'w-full h-full' : 'w-[375px] h-[667px]'}`}
        >
          <iframe
            key={srcDoc}
            ref={iframeRef}
            srcDoc={srcDoc}
            title="preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
