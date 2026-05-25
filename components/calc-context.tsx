'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type CalcMode = 
  | 'basic' 
  | 'scientific' 
  | 'graphing' 
  | 'financial' 
  | 'converter' 
  | 'statistics' 
  | 'matrix' 
  | 'programmer' 
  | 'calculus' 
  | 'solver' 
  | 'ai';

export interface HistoryItem {
  id: string;
  mode: CalcMode;
  expression: string;
  result: string;
  timestamp: number;
}

interface CalcContextType {
  mode: CalcMode;
  setMode: (mode: CalcMode) => void;
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

const CalcContext = createContext<CalcContextType | undefined>(undefined);

export function CalcProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CalcMode>('basic');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory((prev) => [
      {
        ...item,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, 50)); // Keep last 50
  };

  const clearHistory = () => setHistory([]);
  const deleteHistoryItem = (id: string) => setHistory(prev => prev.filter(i => i.id !== id));

  return (
    <CalcContext.Provider value={{ mode, setMode, history, addToHistory, clearHistory, deleteHistoryItem }}>
      {children}
    </CalcContext.Provider>
  );
}

export function useCalc() {
  const context = useContext(CalcContext);
  if (!context) throw new Error('useCalc must be used within a CalcProvider');
  return context;
}
