import { Sigma, Construction } from 'lucide-react';

export function CalculusCalc() {
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-4 w-full gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <Sigma className="w-6 h-6 text-blue-400" /> Calculus Tools
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="font-mono text-sm tracking-widest text-white/50 uppercase mb-4">Symbolic Differentiation</h4>
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-white/40">Function f(x) =</label>
                  <input type="text" className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-white focus:border-blue-400 outline-none" defaultValue="x^2 * sin(x)" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-white/40">Derivative f'(x) =</label>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 font-mono text-blue-300">
                     2*x*sin(x) + x^2*cos(x)
                  </div>
               </div>
            </div>
         </div>

         <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="font-mono text-sm tracking-widest text-white/50 uppercase mb-4">Definite Integral</h4>
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-white/40">Function f(x) =</label>
                  <input type="text" className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-white focus:border-blue-400 outline-none" defaultValue="e^(-x^2)" />
               </div>
               <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                     <label className="text-xs font-mono text-white/40">Lower (a)</label>
                     <input type="text" className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-white text-center" defaultValue="-2" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                     <label className="text-xs font-mono text-white/40">Upper (b)</label>
                     <input type="text" className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-white text-center" defaultValue="2" />
                  </div>
               </div>
               <button className="w-full py-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold hover:bg-blue-500/30 transition-all mt-2">
                  Calculate Area
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
