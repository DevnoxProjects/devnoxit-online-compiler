
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import ConsolePanel from './components/ConsolePanel';
import { CodeState, EditorMode, LogEntry, Theme } from './types';
import { INITIAL_CODE } from './constants';
import { Sparkles, X, Send, BrainCircuit, Loader2 } from 'lucide-react';
import { getAIHelp } from './services/gemini';

const App: React.FC = () => {
  const [code, setCode] = useState<CodeState>(() => {
    const saved = localStorage.getItem('devnox-code');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if any of the code fields have content
      if (parsed.html.trim() || parsed.css.trim() || parsed.js.trim()) {
        return parsed;
      }
    }
    return INITIAL_CODE;
  });
  const [editorMode, setEditorMode] = useState<EditorMode>('html');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('devnox-theme');
    return (saved as Theme) || 'dark';
  });

  const updateCode = (mode: EditorMode, val: string) => {
    setCode(prev => ({ ...prev, [mode]: val }));
  };

  const handleConsoleMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === 'CONSOLE_LOG') {
      const newLog: LogEntry = { type: 'log', message: event.data.payload, timestamp: new Date() };
      setLogs(prev => [...prev, newLog]);
    }
    if (event.data.type === 'CONSOLE_ERROR') {
      const newLog: LogEntry = { type: 'error', message: event.data.payload, timestamp: new Date() };
      setLogs(prev => [...prev, newLog]);
      setIsConsoleOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleConsoleMessage);
    return () => window.removeEventListener('message', handleConsoleMessage);
  }, [handleConsoleMessage]);

  const parseCodeFromResponse = (response: string) => {
    const codeBlocks: { [key: string]: string } = {};
    const lines = response.split('\n');
    let currentLang = '';
    let inCodeBlock = false;
    let codeContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          if (currentLang && codeContent.length > 0) {
            codeBlocks[currentLang] = codeContent.join('\n');
          }
          inCodeBlock = false;
          currentLang = '';
          codeContent = [];
        } else {
          // Start of code block
          const lang = line.slice(3).toLowerCase().trim();
          if (lang === 'html' || lang === 'css' || lang === 'js' || lang === 'javascript') {
            currentLang = lang === 'javascript' ? 'js' : lang;
            inCodeBlock = true;
          }
        }
      } else if (inCodeBlock) {
        codeContent.push(line);
      }
    }

    return codeBlocks;
  };

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    // Check for AI version queries
    const lowerPrompt = aiPrompt.toLowerCase();
    if (lowerPrompt.includes('ai version') || (lowerPrompt.includes('version') && lowerPrompt.includes('ai'))) {
      setAiResponse("Hi I am Elix Developed By Devnox IT\nWebsite: devnoxit.com\nContacts: 01990-723902, 01635-368184");
      setIsAiLoading(false);
      return;
    }

    try {
      const result = await getAIHelp(code, aiPrompt);
      setAiResponse(result);

      // Automatically apply code changes if code blocks are detected
      const codeBlocks = parseCodeFromResponse(result);
      if (Object.keys(codeBlocks).length > 0) {
        const newCode = { ...code, ...codeBlocks };
        setCode(newCode);
        // Save to localStorage
        localStorage.setItem('devnox-code', JSON.stringify(newCode));
      }
    } catch (err) {
      setAiResponse("Something went wrong with the AI connection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFormat = async (mode: EditorMode) => {
    try {
      const [prettier, cssParser, jsParser] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/postcss'),
        import('prettier/plugins/babel')
      ]);

      // Format all three code types for better user experience
      const formatPromises = [];

      // Format HTML with proper indentation
      formatPromises.push(
        (async () => {
          const htmlCode = code.html;
          const formattedHtml = formatHtmlWithIndentation(htmlCode);
          updateCode('html', formattedHtml);
        })()
      );

      // Format CSS
      formatPromises.push(
        (async () => {
          try {
            const formattedCss = await prettier.format(code.css, {
              parser: 'css',
              plugins: [cssParser.default],
              semi: true,
              singleQuote: true,
              tabWidth: 2,
              useTabs: false
            });
            updateCode('css', formattedCss.trim());
          } catch (err) {
            // Fallback CSS formatting
            const formattedCss = code.css
              .replace(/;/g, ';\n')
              .replace(/{/g, ' {\n  ')
              .replace(/}/g, '\n}\n')
              .replace(/,/g, ',\n')
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .join('\n');
            updateCode('css', formattedCss);
          }
        })()
      );

      // Format JavaScript
      formatPromises.push(
        (async () => {
          try {
            const formattedJs = await prettier.format(code.js, {
              parser: 'babel',
              plugins: [jsParser.default],
              semi: true,
              singleQuote: true,
              tabWidth: 2,
              useTabs: false
            });
            updateCode('js', formattedJs.trim());
          } catch (err) {
            // Fallback JS formatting
            const formattedJs = code.js
              .replace(/;/g, ';\n')
              .replace(/{/g, ' {\n  ')
              .replace(/}/g, '\n}\n')
              .replace(/,/g, ',\n')
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .join('\n');
            updateCode('js', formattedJs);
          }
        })()
      );

      await Promise.all(formatPromises);
    } catch (err) {
      console.error('Formatting failed:', err);
    }
  };

  const formatHtmlWithIndentation = (html: string): string => {
    let indentLevel = 0;
    const indentSize = 2;
    const lines = html.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const formattedLines: string[] = [];
    let inScript = false;
    let inStyle = false;

    for (const line of lines) {
      // Handle script and style tags
      if (line.includes('<script') && !line.includes('</script>')) {
        inScript = true;
      }
      if (line.includes('<style') && !line.includes('</style>')) {
        inStyle = true;
      }

      if (inScript || inStyle) {
        formattedLines.push(' '.repeat(indentLevel * indentSize) + line);
        if ((line.includes('</script>') && inScript) || (line.includes('</style>') && inStyle)) {
          inScript = false;
          inStyle = false;
        }
        continue;
      }

      // Self-closing tags
      if (line.match(/<[^>]+\/>$/)) {
        formattedLines.push(' '.repeat(indentLevel * indentSize) + line);
      }
      // Closing tags
      else if (line.match(/^<\/[^>]+>$/)) {
        indentLevel = Math.max(0, indentLevel - 1);
        formattedLines.push(' '.repeat(indentLevel * indentSize) + line);
      }
      // Opening tags
      else if (line.match(/^<[^>]+>$/) && !line.includes('</')) {
        formattedLines.push(' '.repeat(indentLevel * indentSize) + line);
        indentLevel++;
      }
      // Content or mixed tags
      else {
        formattedLines.push(' '.repeat(indentLevel * indentSize) + line);
      }
    }

    return formattedLines.join('\n');
  };

  const handleRun = () => {
    // Force re-render of preview by updating a key or triggering state change
    setCode(prev => ({ ...prev }));
  };

  const handleExport = () => {
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devnox IT Export</title>
  <style>${code.css}</style>
</head>
<body>
  ${code.html}
  <script>${code.js}</script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devnox-export.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('devnox-theme', newTheme);
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main Editor/Preview Split */}
        <div className="flex-1 flex">
          <div className="w-1/2 min-w-[300px]">
            <EditorPanel
              mode={editorMode}
              setMode={setEditorMode}
              code={code}
              updateCode={updateCode}
              onAiAsk={() => setIsAiModalOpen(true)}
              onFormat={handleFormat}
              onExport={handleExport}
              onRun={handleRun}
              theme={theme}
            />
          </div>
          
          {/* Resize Handle (Visual Only for now) */}
          <div className="w-[1px] bg-slate-800 cursor-col-resize hover:bg-indigo-500 transition-colors z-10" />
          
          <div className="w-1/2 min-w-[300px]">
            <PreviewPanel code={code} theme={theme} />
          </div>
        </div>
      </main>

      <ConsolePanel
        isOpen={isConsoleOpen}
        onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
        logs={logs}
        clearLogs={() => setLogs([])}
        theme={theme}
      />

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-indigo-600/5">
              <div className="flex items-center gap-3">
                <img src="/assets/Elix.svg" alt="Elix Logo" className="w-8 h-8 rounded-lg" />
                <div>
                  <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Elix | Devnox AI Assistant</h3>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-black hover:text-gray-800'} transition-colors`}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {aiResponse ? (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                  <p className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-black'} whitespace-pre-wrap leading-relaxed`}>{aiResponse}</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <Sparkles size={48} className="text-indigo-500 animate-pulse" />
                  <div>
                    <p className="text-lg font-medium text-slate-300">How can I help you build today?</p>
                    <p className="text-sm text-slate-500">Ask for code fixes, new features, or explanations.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Input) */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-800">
              <div className="relative">
                <input 
                  autoFocus
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && handleAiSubmit()}
                  placeholder="e.g., 'Add a dark mode toggle button' or 'Fix the responsive layout'"
                  className={`w-full ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'} rounded-2xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                />
                <button 
                  disabled={isAiLoading || !aiPrompt.trim()}
                  onClick={handleAiSubmit}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 disabled:bg-slate-700 transition-all"
                >
                  {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
