import { motion } from 'motion/react';
import { DivideSquare } from 'lucide-react';

export function SolverCalc() {
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-2 w-full gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <DivideSquare className="w-6 h-6 text-lime-400" /> Equation Solver
        </h3>
      </div>
      <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center flex-1 text-center bg-black/40">
         <DivideSquare className="w-16 h-16 text-white/10 mb-4" />
         <h4 className="text-xl font-medium text-white/50">Coming Soon</h4>
         <p className="text-white/30 text-sm mt-2 max-w-md">Polynomial factoring, system of linear/non-linear equations solving, inequality calculations, and step-by-step math solver is under construction.</p>
      </div>
    </div>
  );
}
