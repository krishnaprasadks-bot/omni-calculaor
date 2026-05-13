'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type CalcMode = 'basic' | 'scientific' | 'graphing' | 'financial' | 'converter' | 'ai' | 'statistics' | 'matrix';

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
}

const CalcContext = createContext<CalcContextType | undefined>(undefined);

export function CalcProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CalcMode>('scientific');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prev => [{
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }, ...prev].slice(0, 50));
  };

  const clearHistory = () => setHistory([]);

  return (
    <CalcContext.Provider value={{ mode, setMode, history, addToHistory, clearHistory }}>
      {children}
    </CalcContext.Provider>
  );
}

export const useCalc = () => {
  const context = useContext(CalcContext);
  if (!context) throw new Error('useCalc must be used within a CalcProvider');
  return context;
};
