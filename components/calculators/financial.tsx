'use client';
import { BadgeDollarSign } from 'lucide-react';

export function FinancialCalc() {
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-4 w-full gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <BadgeDollarSign className="w-6 h-6 text-amber-400" /> Financial Planner
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* EMI Setup */}
         <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-amber-500/20">
            <h4 className="font-mono text-sm tracking-widest text-amber-400 uppercase">EMI / Loan</h4>
            
            <div className="flex flex-col gap-2">
               <label className="text-xs font-mono text-white/40">Principal Amount ($)</label>
               <input type="number" className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-white focus:border-amber-400 outline-none" defaultValue="50000" />
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-xs font-mono text-white/40">Interest Rate (% p.a.)</label>
               <input type="number" className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-white focus:border-amber-400 outline-none" defaultValue="6.5" />
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-xs font-mono text-white/40">Tenure (Years)</label>
               <input type="number" className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-white focus:border-amber-400 outline-none" defaultValue="5" />
            </div>
         </div>

         {/* ROI / Results */}
         <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                  <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-2">Monthly EMI</div>
                  <div className="text-4xl text-amber-300 font-bold font-mono">$978.31</div>
               </div>
               <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                  <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-2">Total Interest Payable</div>
                  <div className="text-3xl text-white font-bold font-mono">$8,698.60</div>
               </div>
            </div>
            
            <div className="flex-1 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-end p-4 border-dashed relative">
               <div className="w-full h-2/3 flex items-end gap-1 px-4 opacity-50">
                  {/* Fake bars for preview */}
                  {[...Array(20)].map((_, i) => (
                     <div key={i} className="flex-1 bg-amber-500 rounded-t-sm" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                  ))}
               </div>
               <span className="absolute Center inset-0 flex items-center justify-center font-mono text-sm text-white/30 mix-blend-difference pointer-events-none">Amortization Chart</span>
            </div>
         </div>
      </div>
    </div>
  );
}
