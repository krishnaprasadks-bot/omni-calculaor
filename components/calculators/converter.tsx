'use client';
import { RefreshCcw, ArrowRightLeft } from 'lucide-react';

export function ConverterCalc() {
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-4 w-full gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <RefreshCcw className="w-6 h-6 text-orange-400" /> Unit Converter
        </h3>
      </div>

      <div className="max-w-3xl mx-auto w-full glass-panel p-8 rounded-[2rem] border-orange-500/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
         <div className="flex items-center justify-center gap-4 mb-8">
            {['Length', 'Mass', 'Speed', 'Data'].map((cat, i) => (
               <button key={i} className={`px-4 py-2 font-mono text-sm rounded-full ${i===0 ? 'bg-orange-500 text-black font-bold' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {cat}
               </button>
            ))}
         </div>

         <div className="flex flex-col md:flex-row items-center gap-6">
            {/* From */}
            <div className="flex-1 w-full bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
               <select className="bg-transparent border-none text-white/70 font-mono outline-none text-sm cursor-pointer">
                  <option>Kilometers (km)</option>
                  <option>Miles (mi)</option>
                  <option>Meters (m)</option>
               </select>
               <input type="text" className="bg-transparent border-none text-4xl text-white font-mono font-bold outline-none w-full" defaultValue="1" />
            </div>

            <button className="w-12 h-12 rounded-full glass-button flex items-center justify-center shrink-0 shadow-lg group hover:rotate-180 transition-transform duration-500">
               <ArrowRightLeft className="w-5 h-5 text-orange-400" />
            </button>

            {/* To */}
            <div className="flex-1 w-full bg-orange-500/10 rounded-2xl p-6 border border-orange-500/20 flex flex-col gap-4 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]">
               <select className="bg-transparent border-none text-white/70 font-mono outline-none text-sm cursor-pointer">
                  <option>Miles (mi)</option>
                  <option>Kilometers (km)</option>
                  <option>Meters (m)</option>
               </select>
               <input type="text" readOnly className="bg-transparent border-none text-4xl text-orange-300 font-mono font-bold outline-none w-full text-glow-cyan" value="0.621371" />
            </div>
         </div>

         <div className="mt-8 text-center bg-black/30 py-3 rounded-xl border border-white/5 font-mono text-xs text-white/40">
            Formula: multiply the length value by 0.6214
         </div>
      </div>
    </div>
  );
}
