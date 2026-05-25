'use client';
import { motion } from 'motion/react';
import { Binary, Construction } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ProgrammerCalc() {
  const [val, setVal] = useState(BigInt(0));

  const updateVal = (str: string, radix: number) => {
    try {
      if (!str) {
        setVal(BigInt(0));
        return;
      }
      let cleaned = str;
      if (radix === 16) cleaned = str.replace(/[^0-9a-fA-F]/g, '');
      if (radix === 10) cleaned = str.replace(/[^0-9-]/g, '');
      if (radix === 8) cleaned = str.replace(/[^0-7]/g, '');
      if (radix === 2) cleaned = str.replace(/[^0-1]/g, '');
      if (!cleaned) cleaned = '0';
      setVal(BigInt(`0${radix === 16 ? 'x' : radix === 8 ? 'o' : radix === 2 ? 'b' : ''}${cleaned.replace(/^-/, '')}`) * (cleaned.startsWith('-') ? BigInt(-1) : BigInt(1)));
    } catch (e) {
      console.error(e);
    }
  };

  const hexLines = val.toString(16).toUpperCase();
  const decLines = val.toString(10);
  const octLines = val.toString(8);
  let binStr = (val >= BigInt(0) ? val : (BigInt("0xFFFFFFFFFFFFFFFF") + val + BigInt(1))).toString(2);
  binStr = binStr.padStart(64, '0').slice(-64);

  const toggleBit = (i: number) => {
    const mask = BigInt(1) << BigInt(63 - i);
    setVal(val ^ mask);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-4 w-full gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <Binary className="w-6 h-6 text-red-400" /> Programmer
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
             <div className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5 hover:border-red-400/50 focus-within:border-red-400">
                <span className="font-mono text-sm text-red-400 pl-2 w-12">HEX</span>
                <input type="text" value={hexLines} onChange={(e) => updateVal(e.target.value, 16)} className="bg-transparent border-none text-white font-mono text-xl outline-none w-full text-right" />
             </div>
             <div className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5 hover:border-red-400/50 focus-within:border-red-400">
                <span className="font-mono text-sm text-red-400 pl-2 w-12">DEC</span>
                <input type="text" value={decLines} onChange={(e) => updateVal(e.target.value, 10)} className="bg-transparent border-none text-white font-mono text-xl outline-none w-full text-right" />
             </div>
             <div className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5 hover:border-red-400/50 focus-within:border-red-400">
                <span className="font-mono text-sm text-red-400 pl-2 w-12">OCT</span>
                <input type="text" value={octLines} onChange={(e) => updateVal(e.target.value, 8)} className="bg-transparent border-none text-white font-mono text-xl outline-none w-full text-right" />
             </div>
             <div className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5 hover:border-red-400/50 focus-within:border-red-400">
                <span className="font-mono text-sm text-red-400 pl-2 w-12">BIN</span>
                <input type="text" value={binStr.replace(/^0+/, '') || '0'} onChange={(e) => updateVal(e.target.value, 2)} className="bg-transparent border-none text-white font-mono text-xl outline-none w-full text-right" />
             </div>
         </div>

         {/* Bit toggle board */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <h4 className="font-mono text-sm tracking-widest text-white/50 uppercase">64-bit Display</h4>
            <div className="grid grid-cols-8 gap-y-3 gap-x-1 sm:gap-x-2">
               {Array.from({ length: 64 }).map((_, i) => {
                  const bitVal = binStr[i];
                  return (
                    <div key={i} className="text-center">
                       <button onClick={() => toggleBit(i)} className={`w-full aspect-square max-w-[28px] mx-auto rounded bg-black/50 border hover:border-red-400/80 transition-colors font-mono text-xs flex items-center justify-center ${bitVal === '1' ? 'border-red-400 text-red-300 shadow-[0_0_10px_rgba(248,113,113,0.4)]' : 'border-white/10 text-white/30'}`}>
                          {bitVal}
                       </button>
                    </div>
               )})}
            </div>
         </div>
      </div>
    </div>
  );
}
