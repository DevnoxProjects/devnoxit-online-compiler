
import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es';
import { EditorMode, CodeState, Theme } from '../types';
import { Layout, Code2, Palette, FileJson, Sparkles, FileDown, Play } from 'lucide-react';

interface EditorPanelProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  code: CodeState;
  updateCode: (mode: EditorMode, val: string) => void;
  onAiAsk: () => void;
  onFormat: (mode: EditorMode) => void;
  onExport: () => void;
  onRun: () => void;
  theme: Theme;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ mode, setMode, code, updateCode, onAiAsk, onFormat, onExport, onRun, theme }) => {
  const currentCode = code[mode];

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    // Configure Emmet for HTML and CSS files
    emmetHTML(monaco);
    emmetCSS(monaco);

    // Add CSS class completion provider
    monaco.languages.registerCompletionItemProvider('css', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // Extract class names from HTML code
        const htmlCode = code.html;
        const classRegex = /class\s*=\s*["']([^"']*)["']/g;
        const classes = new Set<string>();

        let match;
        while ((match = classRegex.exec(htmlCode)) !== null) {
          const classList = match[1].split(/\s+/);
          classList.forEach(cls => {
            if (cls.trim()) classes.add(cls.trim());
          });
        }

        // Return completion items for classes
        const suggestions = Array.from(classes).map(cls => ({
          label: `.${cls}`,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: cls,
          range: range,
          documentation: `CSS class from HTML: .${cls}`
        }));

        return { suggestions };
      },
      triggerCharacters: ['.']
    });

    // Enhanced Emmet abbreviations for HTML
    const emmetAbbreviations = {
      // Common HTML elements with classes
      '.heading': 'div.heading',
      '.container': 'div.container',
      '.wrapper': 'div.wrapper',
      '.content': 'div.content',
      '.section': 'section.section',
      '.article': 'article.article',
      '.header': 'header.header',
      '.footer': 'footer.footer',
      '.nav': 'nav.nav',
      '.menu': 'ul.menu',
      '.item': 'li.item',
      '.link': 'a.link',
      '.button': 'button.button',
      '.input': 'input.input',
      '.form': 'form.form',
      '.card': 'div.card',
      '.row': 'div.row',
      '.col': 'div.col',
      '.grid': 'div.grid',
      '.flex': 'div.flex',
      '.box': 'div.box',
      '.text': 'span.text',
      '.title': 'h1.title',
      '.subtitle': 'h2.subtitle',
      '.paragraph': 'p.paragraph',
      '.image': 'img.image',
      '.icon': 'i.icon',
      '.badge': 'span.badge',
      '.alert': 'div.alert',
      '.modal': 'div.modal',
      '.overlay': 'div.overlay',
      '.sidebar': 'aside.sidebar',
      '.main': 'main.main'
    };

    // Register custom Emmet completions
    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = Object.entries(emmetAbbreviations).map(([abbr, expansion]) => ({
          label: abbr,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: expansion,
          range: range,
          documentation: `Emmet: ${abbr} → ${expansion}`,
          detail: 'Emmet Abbreviation'
        }));

        return { suggestions };
      },
      triggerCharacters: ['.']
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-slate-800">
      {/* Tabs */}
      <div className="flex items-center justify-between bg-[#181818] px-2 h-12 border-b border-slate-800">
        <div className="flex gap-1 h-full items-end">
          <TabButton 
            active={mode === 'html'} 
            onClick={() => setMode('html')}
            icon={<Layout size={14} className="text-orange-500" />}
            label="HTML"
          />
          <TabButton 
            active={mode === 'css'} 
            onClick={() => setMode('css')}
            icon={<Palette size={14} className="text-sky-400" />}
            label="CSS"
          />
          <TabButton 
            active={mode === 'js'} 
            onClick={() => setMode('js')}
            icon={<FileJson size={14} className="text-yellow-400" />}
            label="JS"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onRun}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-400'} text-xs font-bold text-white transition-all shadow-lg shadow-green-500/20`}
          >
            <Play size={14} />
            Run
          </button>
          <button
            onClick={() => onFormat(mode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'} transition-all`}
          >
            <Code2 size={14} />
            Format
          </button>
          <button
            onClick={onExport}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'} transition-all`}
          >
            <FileDown size={14} />
            Export
          </button>
          <button
            onClick={onAiAsk}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-500 hover:bg-indigo-400'} text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20`}
          >
            <Sparkles size={14} />
            ASK AI
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={mode === 'js' ? 'javascript' : mode}
          value={currentCode}
          onChange={(value) => updateCode(mode, value || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            parameterHints: {
              enabled: true
            },
            hover: {
              enabled: true
            },
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'blink',
            renderWhitespace: 'selection',
            bracketPairColorization: {
              enabled: true
            },
            'emmet.triggerExpansionOnTab': true,
            'emmet.includeLanguages': {
              'html': 'html',
              'javascript': 'javascriptreact'
            }
          }}
        />
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; theme: Theme }> = ({ active, onClick, icon, label, theme }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all border-t-2 border-transparent rounded-t-lg
      ${active
        ? `${theme === 'dark' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black'} border-indigo-500`
        : `${theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-black hover:text-gray-800 hover:bg-gray-100'}`
      }`}
  >
    {icon}
    {label}
  </button>
);

export default EditorPanel;
