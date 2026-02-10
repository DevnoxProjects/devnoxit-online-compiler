
export type EditorMode = 'html' | 'css' | 'js';
export type Theme = 'dark' | 'light';

export interface CodeState {
  html: string;
  css: string;
  js: string;
}

export interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}
