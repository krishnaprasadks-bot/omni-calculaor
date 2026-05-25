'use client';
import { DivideSquare, CheckCircle } from 'lucide-react';

export function SolverCalc() {
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-4 w-full gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <DivideSquare className="w-6 h-6 text-lime-400" /> Equation Solver
        </h3>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border-lime-500/20 shadow-[0_0_30px_rgba(132,204,22,0.1)]">
         <div className="flex items-center gap-4 bg-black/40 rounded-xl border border-white/10 p-2">
            <input 
               type="text" 
               className="flex-1 bg-transparent border-none text-white font-mono text-lg px-4 outline-none placeholder:text-white/20"
               placeholder="Enter an equation (e.g., x^2 - 5x + 6 = 0)"
               defaultValue="x^2 - 5x + 6 = 0"
            />
            <button className="bg-lime-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-lime-400 transition-colors">
               Solve
            </button>
         </div>

         <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mt-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <DivideSquare className="w-32 h-32 text-lime-400" />
            </div>
            
            <h4 className="font-mono text-sm tracking-widest text-lime-400 uppercase mb-6 flex items-center gap-2">
               <CheckCircle className="w-4 h-4" /> Solution Found
            </h4>

            <div className="space-y-6 relative z-10">
               <div className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/40 font-mono text-xs mb-2">Roots / Solutions</span>
                  <div className="flex gap-4">
                     <span className="text-2xl font-mono font-bold text-white bg-lime-500/20 px-4 py-2 rounded-lg border border-lime-500/30">x₁ = 2</span>
                     <span className="text-2xl font-mono font-bold text-white bg-lime-500/20 px-4 py-2 rounded-lg border border-lime-500/30">x₂ = 3</span>
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                  <span className="text-white/40 font-mono text-xs uppercase tracking-widest">Step-by-step Execution</span>
                  <div className="bg-black/80 rounded-xl p-4 font-mono text-sm text-white/70 space-y-3 font-medium">
                     <p className="border-b border-white/5 pb-2">1. Identify the equation as a quadratic: <span className="text-lime-300">ax² + bx + c = 0</span></p>
                     <p className="border-b border-white/5 pb-2">2. Find factors of c (6) that add up to b (-5).</p>
                     <p className="border-b border-white/5 pb-2">3. The factors are -2 and -3.</p>
                     <p className="border-b border-white/5 pb-2">4. Rewrite as: <span className="text-white">(x - 2)(x - 3) = 0</span></p>
                     <p>5. Solve for x: <span className="text-lime-400 font-bold">x = 2</span> or <span className="text-lime-400 font-bold">x = 3</span></p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
