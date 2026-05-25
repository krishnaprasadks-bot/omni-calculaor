'use client';
import { Calculator, FunctionSquare, LineChart, BadgeDollarSign, RefreshCcw, BrainCircuit, PieChart, Binary, Sigma, DivideSquare } from 'lucide-react';
import { useCalc } from './calc-context';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

const MODES = [
  { id: 'basic', icon: Calculator, label: 'Standard', color: 'text-cyan-400' },
  { id: 'scientific', icon: FunctionSquare, label: 'Scientific', color: 'text-violet-400' },
  { id: 'graphing', icon: LineChart, label: 'Graphing', color: 'text-emerald-400' },
  { id: 'financial', icon: BadgeDollarSign, label: 'Financial', color: 'text-amber-400' },
  { id: 'converter', icon: RefreshCcw, label: 'Converter', color: 'text-orange-400' },
  { id: 'programmer', icon: Binary, label: 'Programmer', color: 'text-red-400' },
  { id: 'statistics', icon: PieChart, label: 'Statistics', color: 'text-pink-400' },
  { id: 'matrix', icon: Calculator, label: 'Matrix', color: 'text-teal-400' },
  { id: 'calculus', icon: Sigma, label: 'Calculus', color: 'text-blue-400' },
  { id: 'solver', icon: DivideSquare, label: 'Eq Solver', color: 'text-lime-400' },
  { id: 'ai', icon: BrainCircuit, label: 'AI Assist', color: 'text-white' },
] as const;

export function Sidebar() {
  const { mode, setMode } = useCalc();

  return (
    <div className="w-20 md:w-56 border-r border-white/5 glass-panel h-full flex flex-col items-center md:items-start transition-all duration-300 z-10 shrink-0">
      <div className="p-4 md:p-6 w-full flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)] shrink-0 font-serif font-bold text-lg text-white">
          ∑X
        </div>
        <span className="hidden md:block font-serif text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight whitespace-nowrap">SolveX Calc</span>
      </div>

      <nav className="flex-1 w-full flex flex-col gap-1 p-2 mt-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={clsx(
                "relative flex items-center gap-3 p-3 rounded-xl transition-all group overflow-hidden w-full",
                isActive ? "bg-white/10" : "hover:bg-white/5"
              )}
              title={m.label}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={clsx("w-5 h-5 shrink-0 transition-colors z-10", isActive ? m.color : "text-white/40 group-hover:text-white/80")} />
              <span className={clsx("hidden md:block text-sm font-medium z-10 transition-colors whitespace-nowrap", isActive ? "text-white" : "text-white/50 group-hover:text-white/80")}>
                {m.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
