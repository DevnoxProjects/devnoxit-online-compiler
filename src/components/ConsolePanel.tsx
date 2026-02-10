import React from 'react';
import { LogEntry, Theme } from '../types';
import { X, Trash2 } from 'lucide-react';

interface ConsolePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  logs: LogEntry[];
  clearLogs: () => void;
  theme: Theme;
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ isOpen, onToggle, logs, clearLogs, theme }) => {
  if (!isOpen) return null;

  return (
    <div className={`bg-${theme === 'dark' ? 'slate-900' : 'gray-100'} border-t border-${theme === 'dark' ? 'slate-800' : 'gray-300'}`}>
      <div className={`flex items-center justify-between px-4 py-2 bg-${theme === 'dark' ? 'slate-800' : 'gray-200'}`}>
        <span className={`text-sm font-bold text-${theme === 'dark' ? 'slate-300' : 'gray-700'}`}>Console</span>
        <div className="flex gap-2">
          <button onClick={clearLogs} className={`text-${theme === 'dark' ? 'slate-500' : 'gray-500'} hover:text-${theme === 'dark' ? 'white' : 'black'}`}>
            <Trash2 size={14} />
          </button>
          <button onClick={onToggle} className={`text-${theme === 'dark' ? 'slate-500' : 'gray-500'} hover:text-${theme === 'dark' ? 'white' : 'black'}`}>
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-48 overflow-auto p-4 space-y-1">
        {logs.length === 0 ? (
          <p className={`text-${theme === 'dark' ? 'slate-500' : 'gray-500'} text-sm`}>No logs yet...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`text-sm font-mono ${
              log.type === 'error' ? `text-${theme === 'dark' ? 'red-400' : 'red-600'}` : `text-${theme === 'dark' ? 'slate-300' : 'gray-700'}`
            }`}>
              [{log.timestamp.toLocaleTimeString()}] {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;
