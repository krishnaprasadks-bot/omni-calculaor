'use client';

import { Calculator, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import * as mathjs from 'mathjs';

export function MatrixCalc() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0]
  ]);

  const updateMatrix = (r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newM = [...matrixA];
    newM[r] = [...newM[r]];
    newM[r][c] = num;
    setMatrixA(newM);
  };

  const resizeMatrix = (r: number, c: number) => {
    if (r < 1 || c < 1 || r > 8 || c > 8) return;
    const next = Array(r).fill(0).map(() => Array(c).fill(0));
    for (let i = 0; i < Math.min(matrixA.length, r); i++) {
      for (let j = 0; j < Math.min(matrixA[0].length, c); j++) {
        next[i][j] = matrixA[i][j];
      }
    }
    setMatrixA(next);
    setRows(r);
    setCols(c);
  };

  const results = useMemo(() => {
    try {
      const A = mathjs.matrix(matrixA);
      const isSquare = rows === cols;
      let det = null;
      let inv = null;
      let trace = null;
      
      if (isSquare) {
        det = mathjs.det(A);
        trace = mathjs.trace(A);
        if (det !== 0) {
           inv = mathjs.inv(A);
        }
      }
      const trans = mathjs.transpose(A);

      return {
        det: det !== null ? Number(det).toFixed(4) : null,
        inv: inv ? (inv as any).toArray() : null,
        trans: (trans as any).toArray(),
        trace: trace !== null ? Number(trace).toFixed(4) : null,
      };
    } catch (e) {
      return null;
    }
  }, [matrixA, rows, cols]);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-4 w-full gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <Calculator className="w-6 h-6 text-teal-400" /> Matrix Calculator
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Matrix A Input */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-teal-500/20">
            <div className="flex items-center justify-between text-white/50 mb-4">
               <span className="font-mono text-sm uppercase tracking-widest text-teal-400">Matrix A</span>
               <div className="flex items-center gap-2">
                 <input type="number" value={rows} onChange={e => resizeMatrix(parseInt(e.target.value), cols)} className="w-12 bg-black/40 border border-white/10 rounded-lg p-1 text-center font-mono text-white text-xs"/>
                 <X className="w-3 h-3"/>
                 <input type="number" value={cols} onChange={e => resizeMatrix(rows, parseInt(e.target.value))} className="w-12 bg-black/40 border border-white/10 rounded-lg p-1 text-center font-mono text-white text-xs"/>
               </div>
            </div>
            
            <div className="overflow-x-auto pb-4">
              <div className="grid gap-2 w-fit mx-auto" style={{gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`}}>
                 {matrixA.map((row, r) => 
                   row.map((val, c) => (
                    <input key={`${r}-${c}`} type="number" value={val} onChange={(e) => updateMatrix(r, c, e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center font-mono text-white text-sm focus:border-teal-400 outline-none transition-colors" />
                   ))
                 )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
               <button onClick={() => {
                  const arr = Array(rows).fill(0).map(() => Array(cols).fill(0).map(() => Math.floor(Math.random() * 10)));
                  setMatrixA(arr);
               }} className="glass-button px-4 py-2 rounded-lg text-xs font-mono">Randomize</button>
               <button onClick={() => {
                  const arr = Array(rows).fill(0).map(() => Array(cols).fill(0));
                  setMatrixA(arr);
               }} className="glass-button px-4 py-2 rounded-lg text-xs font-mono">Zero</button>
            </div>
         </div>

         {/* Results */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 border border-white/10">
            <h4 className="font-mono text-sm tracking-widest text-white/50 uppercase">Results</h4>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                 <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">Determinant</div>
                 <div className="text-xl font-mono text-white font-bold">{results?.det ?? 'N/A'}</div>
               </div>
               <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                 <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">Trace</div>
                 <div className="text-xl font-mono text-white font-bold">{results?.trace ?? 'N/A'}</div>
               </div>
            </div>
            
            {results?.trans && (
              <div className="flex flex-col gap-2">
                 <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Transpose (Aᵀ)</div>
                 <div className="bg-black/40 rounded-xl border border-white/5 p-4 overflow-x-auto">
                    <div className="grid gap-2 w-fit" style={{gridTemplateColumns: `repeat(${results.trans[0].length}, minmax(40px, 1fr))`}}>
                      {results.trans.map((row: any[], r: number) => row.map((val: any, c: number) => (
                         <div key={`${r}-${c}`} className="text-center font-mono text-xs text-white/80 py-1 border-b border-white/5 opacity-80">
                           {typeof val === 'number' ? parseFloat(val.toPrecision(4)) : String(val)}
                         </div>
                      )))}
                    </div>
                 </div>
              </div>
            )}

            {results?.inv && (
              <div className="flex flex-col gap-2">
                 <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Inverse (A⁻¹)</div>
                 <div className="bg-black/40 rounded-xl border border-white/5 p-4 overflow-x-auto">
                    <div className="grid gap-2 w-fit mx-auto" style={{gridTemplateColumns: `repeat(${results.inv[0].length}, minmax(40px, 1fr))`}}>
                      {results.inv.map((row: any[], r: number) => row.map((val: any, c: number) => (
                         <div key={`${r}-${c}`} className="text-center font-mono text-xs text-teal-300 py-1 border-b border-teal-500/10">
                           {typeof val === 'number' ? parseFloat(val.toPrecision(4)) : String(val)}
                         </div>
                      )))}
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
