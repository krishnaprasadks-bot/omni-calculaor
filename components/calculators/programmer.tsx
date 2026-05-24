import { motion } from 'motion/react';
import { Binary, Plus, Minus, X, Info } from 'lucide-react';

export function ProgrammerCalc() {
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-2 w-full gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <Binary className="w-6 h-6 text-red-400" /> Programmer Calculator
        </h3>
      </div>
      <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center flex-1 text-center bg-black/40">
         <Binary className="w-16 h-16 text-white/10 mb-4" />
         <h4 className="text-xl font-medium text-white/50">Coming Soon</h4>
         <p className="text-white/30 text-sm mt-2 max-w-md">The Programmer module (bitwise expressions, IEEE 754 float inspection, radix conversions) is under construction.</p>
      </div>
    </div>
  );
}
