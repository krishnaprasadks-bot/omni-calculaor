'use client';
import { useCalc } from './calc-context';
import { Clock, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export function HistoryPanel() {
  const { history, clearHistory } = useCalc();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden absolute top-4 right-4 z-50 p-2 glass-button rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className="w-5 h-5 text-white/80" />
      </button>

      {/* Main Panel */}
      <div className={clsx(
        "fixed md:static inset-y-0 right-0 w-80 glass-panel border-l border-white/5 flex flex-col transition-transform duration-300 z-40 transform h-full",
        isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4" />
            <span className="font-serif text-sm uppercase tracking-widest font-bold">History</span>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {history.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-40 text-center text-white/20">
                <Clock className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-mono tracking-tight">No history yet</p>
              </motion.div>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-brand-cyan opacity-80">{item.mode}</span>
                    <span className="text-[10px] text-white/30">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm text-white/70 font-mono truncate">{item.expression}</div>
                  <div className="text-lg font-bold text-white mt-1 break-words">{item.result}</div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
