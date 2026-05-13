'use client';
import { Calculator, FunctionSquare, LineChart, BadgeDollarSign, RefreshCcw, BrainCircuit, PieChart } from 'lucide-react';
import { useCalc } from './calc-context';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

const MODES = [
  { id: 'scientific', icon: FunctionSquare, label: 'Scientific', color: 'text-brand-cyan' },
  { id: 'graphing', icon: LineChart, label: 'Graphing', color: 'text-pink-400' },
  { id: 'financial', icon: BadgeDollarSign, label: 'Financial', color: 'text-brand-emerald' },
  { id: 'converter', icon: RefreshCcw, label: 'Converter', color: 'text-orange-400' },
  { id: 'matrix', icon: Calculator, label: 'Matrix', color: 'text-emerald-400' },
  { id: 'statistics', icon: PieChart, label: 'Statistics', color: 'text-yellow-400' },
  { id: 'ai', icon: BrainCircuit, label: 'AI Solver', color: 'text-brand-violet' },
] as const;

export function Sidebar() {
  const { mode, setMode } = useCalc();

  return (
    <div className="w-20 md:w-64 border-r border-white/5 glass-panel h-full flex flex-col items-center md:items-start transition-all duration-300">
      <div className="p-4 md:p-6 w-full flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)] shrink-0">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <span className="hidden md:block font-serif text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">OmniCalc</span>
      </div>

      <nav className="flex-1 w-full flex flex-col gap-2 p-2 mt-4">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={clsx(
                'group relative flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300',
                isActive ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 border border-white/20 rounded-xl bg-white/5"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3 w-full justify-center md:justify-start">
                <Icon className={clsx('w-6 h-6 transition-colors', isActive ? m.color : 'text-white/50 group-hover:text-white/80')} />
                <span className={clsx('hidden md:block text-sm font-medium transition-colors', isActive ? 'text-white text-glow-cyan' : 'text-white/50 group-hover:text-white/80')}>
                  {m.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
