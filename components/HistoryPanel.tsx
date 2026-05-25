'use client';

import { useState, useMemo } from 'react';
import { useHistoryStore } from '@/store/historyStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Clock, Search, Pin, Download, RotateCcw, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HistoryPanel() {
  const { history, togglePin, deleteItem, clearHistory } = useHistoryStore();
  const [search, setSearch] = useState('');
  
  const filteredHistory = useMemo(() => {
    return history.filter(item => 
        item.expression.toLowerCase().includes(search.toLowerCase()) ||
        item.result.toString().toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [history, search]);

  const exportData = (format: 'json' | 'csv') => {
      const data = JSON.stringify(history);
      const blob = new Blob([format === 'json' ? data : history.map(item => `${item.expression},${item.result}`).join('\n')], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calculation-history.${format}`;
      a.click();
  };

  return (
    <div className="absolute inset-y-0 right-0 w-96 bg-[#111118]/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl">
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <h2 className="font-syne font-semibold">History & Workspace</h2>
        <div className="flex gap-2">
            <button onClick={() => exportData('json')} className="p-2 rounded-full hover:bg-white/10"><Download className="w-4 h-4" /></button>
            <button onClick={() => clearHistory()} className="p-2 rounded-full hover:bg-white/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div className="p-4 border-b border-white/5 flex gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input placeholder="Search history..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 rounded-lg py-2 pl-9 pr-4 text-sm outline-none border border-white/5 focus:border-violet-500/50" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filteredHistory.map(item => (
            <div key={item.id} className={cn("p-4 rounded-xl bg-white/5 border border-white/5 transition group", item.isPinned ? "border-violet-500/50" : "hover:border-white/10")}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                    <button onClick={() => togglePin(item.id)} className={cn("p-1 rounded-full", item.isPinned ? "text-violet-400" : "text-gray-600 hover:text-white")}>
                        <Pin className="w-3 h-3" />
                    </button>
                </div>
                <div className="text-gray-300 font-dm-mono text-sm mb-1">{item.expression}</div>
                <div className="text-cyan-400 font-dm-mono text-lg font-medium tracking-wide flex justify-between items-center">
                    = {item.result}
                    <button className="text-gray-500 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
