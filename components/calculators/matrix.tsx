'use client';

import { useState, useMemo, useCallback } from 'react';
import * as mathjs from 'mathjs';
import { clsx } from 'clsx';
import { 
  Grid3X3, 
  Trash2, 
  RefreshCcw, 
  ArrowRightLeft, 
  Plus, 
  Minus, 
  X, 
  Square,
  ChevronRight,
  Info
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false, 
  loading: () => <div className="animate-pulse w-full h-[300px] bg-white/5 rounded-2xl border border-white/10" /> 
});

type Matrix = number[][];

export function MatrixCalc() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrixA, setMatrixA] = useState<Matrix>([
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0]
  ]);
  const [matrixB, setMatrixB] = useState<Matrix>([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);
  const [scalar, setScalar] = useState(1);
  const [activeMatrix, setActiveMatrix] = useState<'A' | 'B'>('A');

  const updateMatrix = (m: 'A' | 'B', r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    if (m === 'A') {
      const newM = [...matrixA];
      newM[r][c] = num;
      setMatrixA(newM);
    } else {
      const newM = [...matrixB];
      newM[r][c] = num;
      setMatrixB(newM);
    }
  };

  const resizeMatrix = (r: number, c: number) => {
    if (r < 1 || c < 1 || r > 6 || c > 6) return;
    
    const adjust = (prev: Matrix, newR: number, newC: number) => {
      const next = Array(newR).fill(0).map(() => Array(newC).fill(0));
      for (let i = 0; i < Math.min(prev.length, newR); i++) {
        for (let j = 0; j < Math.min(prev[0].length, newC); j++) {
          next[i][j] = prev[i][j];
        }
      }
      return next;
    };

    setMatrixA(prev => adjust(prev, r, c));
    setMatrixB(prev => adjust(prev, r, c));
    setRows(r);
    setCols(c);
  };

  const results = useMemo(() => {
    try {
      const A = mathjs.matrix(matrixA);
      const B = mathjs.matrix(matrixB);
      
      const detA = rows === cols ? mathjs.det(A) : null;
      const invA = (rows === cols && detA !== 0) ? mathjs.inv(A) : null;
      const transA = mathjs.transpose(A);
      const traceA = rows === cols ? mathjs.trace(A) : null;
      
      // Eigenvalues
      let eigsA = null;
      if (rows === cols) {
        try {
          const evalue = mathjs.eigs(A).values;
          // Ensure it's an array for React mapping
          eigsA = (evalue as any).toArray ? (evalue as any).toArray() : evalue;
        } catch (e) {
          console.error("Eigenvalue calc failed", e);
        }
      }

      const sum = mathjs.add(A, B);
      const diff = mathjs.subtract(A, B);
      
      let prod = null;
      try {
        prod = mathjs.multiply(A, B);
      } catch (e) {}

      const scalarProd = mathjs.multiply(A, scalar);

      return {
        detA,
        invA,
        transA,
        traceA,
        eigsA,
        sum,
        diff,
        prod,
        scalarProd
      };
    } catch (e) {
      return null;
    }
  }, [matrixA, matrixB, rows, cols, scalar]);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-2 w-full gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <Grid3X3 className="w-6 h-6 text-emerald-400" /> Matrix Calculator
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setMatrixA(Array(rows).fill(0).map(() => Array(cols).fill(0).map(() => Math.floor(Math.random() * 10))));
              setMatrixB(Array(rows).fill(0).map(() => Array(cols).fill(0).map(() => Math.floor(Math.random() * 10))));
            }}
            className="px-4 py-2 glass-button rounded-xl text-xs font-mono uppercase tracking-widest text-emerald-400"
          >
            Randomize
          </button>
          <button 
            onClick={() => {
              setMatrixA(Array(rows).fill(0).map(() => Array(cols).fill(0)));
              setMatrixB(Array(rows).fill(0).map(() => Array(cols).fill(0)));
            }}
            className="px-4 py-2 glass-button rounded-xl text-xs font-mono uppercase tracking-widest text-red-400"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveMatrix('A')}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    activeMatrix === 'A' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-white/40 hover:text-white"
                  )}
                >
                  Matrix A
                </button>
                <button 
                  onClick={() => setActiveMatrix('B')}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    activeMatrix === 'B' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-white/40 hover:text-white"
                  )}
                >
                  Matrix B
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/30">Size:</span>
                <input 
                  type="number" 
                  value={rows} 
                  onChange={e => resizeMatrix(parseInt(e.target.value), cols)} 
                  className="w-12 bg-black/40 border border-white/10 rounded-lg p-1 text-center text-xs text-white"
                />
                <X className="w-3 h-3 text-white/20" />
                <input 
                  type="number" 
                  value={cols} 
                  onChange={e => resizeMatrix(rows, parseInt(e.target.value))} 
                  className="w-12 bg-black/40 border border-white/10 rounded-lg p-1 text-center text-xs text-white"
                />
              </div>
            </div>

            <div className="relative overflow-x-auto pb-4">
              <div 
                className="grid gap-2 mx-auto w-fit"
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`
                }}
              >
                {(activeMatrix === 'A' ? matrixA : matrixB).map((row, r) => 
                  row.map((val, c) => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      step="any"
                      value={val}
                      onChange={e => updateMatrix(activeMatrix, r, c, e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-center text-white font-mono text-sm focus:border-emerald-400/50 outline-none transition-colors"
                    />
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Scalar Multiplier:</label>
              <input 
                type="number" 
                value={scalar} 
                onChange={e => setScalar(parseFloat(e.target.value) || 0)}
                className="w-20 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-sm focus:border-emerald-400 outline-none"
              />
            </div>
          </div>

          {/* Quick Info / Tips */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-emerald-500/5 flex items-start gap-4">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-white/60 leading-relaxed">
              <p className="font-bold text-white mb-1">Advanced Operations</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Inverse is only available for non-singular square matrices.</li>
                <li>LU Decomposition and Eigenvalues require square matrices.</li>
                <li>Heatmap visualization helps in spotting patterns in large matrices.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col h-full">
            <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm">Operation Results (Matrix A)</h4>
            </div>
            
            <div className="p-6 flex flex-col gap-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <ResultCard 
                  label="Determinant" 
                  value={results?.detA !== null ? Number(results?.detA).toFixed(4) : 'NaN'} 
                  active={rows === cols}
                />
                <ResultCard 
                  label="Trace" 
                  value={results?.traceA !== null ? Number(results?.traceA).toFixed(4) : 'NaN'} 
                  active={rows === cols}
                />
              </div>

              {results?.invA && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Inverse (A⁻¹)</span>
                  <MatrixDisplay data={(results.invA as any).toArray()} />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Transpose (Aᵀ)</span>
                <MatrixDisplay data={(results?.transA as any).toArray()} />
              </div>

              {results?.eigsA && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Eigenvalues</span>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5 font-mono text-sm text-emerald-400">
                    {(results.eigsA as any[]).map((v: any, i: number) => (
                      <div key={i}>λ_{i+1} = {typeof v === 'number' ? v.toFixed(4) : v.toString()}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Binary Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-brand-cyan mb-2">
            <Plus className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">A + B</span>
          </div>
          <MatrixDisplay data={(results?.sum as any).toArray()} />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Minus className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">A - B</span>
          </div>
          <MatrixDisplay data={(results?.diff as any).toArray()} />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-brand-violet mb-2">
            <X className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">A × B</span>
          </div>
          {results?.prod ? (
            <MatrixDisplay data={(results.prod as any).toArray()} />
          ) : (
            <div className="h-20 flex items-center justify-center text-white/20 italic text-sm">Dimension Mismatch</div>
          )}
        </div>
      </div>

      {/* Visualization */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h4 className="font-serif font-bold text-white mb-6">Heatmap Visualization (Matrix A)</h4>
        <div className="h-[300px]">
          <Plot 
            data={[
              {
                z: matrixA,
                type: 'heatmap',
                colorscale: 'Viridis',
                showscale: true,
              }
            ]}
            layout={{
              autosize: true,
              margin: { t: 0, b: 0, l: 30, r: 0 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              xaxis: { visible: false },
              yaxis: { visible: false },
            }}
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>
    </div>
  );
}

function MatrixDisplay({ data }: { data: number[][] }) {
  return (
    <div className="bg-black/40 rounded-xl border border-white/5 p-4 overflow-x-auto">
      <div 
        className="grid gap-2 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${data[0]?.length || 1}, minmax(50px, 1fr))`
        }}
      >
        {data.map((row, r) => 
          row.map((val, c) => (
            <div key={`${r}-${c}`} className="text-center font-mono text-xs text-white/80 py-1 border-b border-white/5">
              {typeof val === 'number' ? parseFloat(val.toPrecision(5)) : String(val)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value, active = true }: { label: string; value: string | number; active?: boolean }) {
  return (
    <div className={clsx(
      "p-4 rounded-xl border transition-all flex flex-col",
      active ? "bg-white/5 border-white/10" : "bg-black/20 border-white/5 opacity-50"
    )}>
      <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-1">{label}</span>
      <span className="font-mono text-sm font-bold text-white truncate">{value}</span>
    </div>
  );
}
