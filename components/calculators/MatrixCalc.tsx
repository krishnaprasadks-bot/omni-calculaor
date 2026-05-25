'use client';

import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Settings2, 
  Play, 
  RotateCcw, 
  Trash2, 
  ArrowRightLeft, 
  Info,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as math from 'mathjs';
import { cn } from '@/lib/utils';

type MatrixData = number[][];

export function MatrixCalc() {
  // Dimension state
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);

  // Matrix values
  const [matrixA, setMatrixA] = useState<MatrixData>(
    Array(6).fill(0).map(() => Array(6).fill(0))
  );
  const [matrixB, setMatrixB] = useState<MatrixData>(
    Array(6).fill(0).map(() => Array(6).fill(0))
  );

  // Result state
  const [result, setResult] = useState<MatrixData | number | string | null>(null);
  const [resultType, setResultType] = useState<'matrix' | 'scalar' | 'text' | 'steps' | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'solver' | 'vectors'>('basic');
  const [scalar, setScalar] = useState(1);
  const [showMatrixB, setShowMatrixB] = useState(true);

  // Initialize some values
  useEffect(() => {
    const defaultA = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const newA = [...matrixA];
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) newA[i][j] = defaultA[i][j];
    setMatrixA(newA);
  }, []);

  const handleCellChange = (matrix: 'A' | 'B', r: number, c: number, value: string) => {
    const num = parseFloat(value) || 0;
    if (matrix === 'A') {
      const newA = [...matrixA];
      newA[r][c] = num;
      setMatrixA(newA);
    } else {
      const newB = [...matrixB];
      newB[r][c] = num;
      setMatrixB(newB);
    }
  };

  const getSubMatrix = (data: MatrixData, rows: number, cols: number) => {
    return data.slice(0, rows).map(row => row.slice(0, cols));
  };

  const calculateRank = (matrix: number[][]) => {
    const A = matrix.map(r => [...r]);
    const m = A.length;
    const n = A[0].length;
    let rank = 0;
    const usedRows = new Set();
    
    for (let j = 0; j < n && rank < m; j++) {
      let pivot = -1;
      for (let i = 0; i < m; i++) {
        if (!usedRows.has(i) && Math.abs(A[i][j]) > 1e-10) {
          pivot = i;
          break;
        }
      }
      
      if (pivot !== -1) {
        rank++;
        usedRows.add(pivot);
        for (let i = 0; i < m; i++) {
          if (i !== pivot && Math.abs(A[i][j]) > 1e-10) {
            const factor = A[i][j] / A[pivot][j];
            for (let k = j; k < n; k++) {
              A[i][k] -= factor * A[pivot][k];
            }
          }
        }
      }
    }
    return rank;
  };

  const formatMatrixText = (A: number[][]) => {
    return A.map(row => "[" + row.map(v => v.toFixed(2).replace(/\.00$/, '')).join(", ") + "]").join("\n");
  };

  const calculateRREF = (matrix: number[][]) => {
    const A = matrix.map(r => [...r]);
    const m = A.length;
    const n = A[0].length;
    const steps: string[] = ["Starting matrix:"];
    steps.push(formatMatrixText(A));

    let lead = 0;
    for (let r = 0; r < m; r++) {
      if (lead >= n) break;
      let i = r;
      while (Math.abs(A[i][lead]) < 1e-10) {
        i++;
        if (i === m) {
          i = r;
          lead++;
          if (lead === n) return { res: A, steps };
        }
      }
      
      if (i !== r) {
        [A[i], A[r]] = [A[r], A[i]];
        steps.push(`Swap rows ${r+1} and ${i+1}:`);
        steps.push(formatMatrixText(A));
      }

      const lv = A[r][lead];
      if (Math.abs(lv) > 1e-10) {
        for (let j = 0; j < n; j++) A[r][j] /= lv;
        steps.push(`Scale row ${r+1} by 1/${lv.toFixed(2)}:`);
        steps.push(formatMatrixText(A));
      }

      for (let i = 0; i < m; i++) {
        if (i !== r) {
          const factor = A[i][lead];
          for (let j = 0; j < n; j++) {
            A[i][j] -= factor * A[r][j];
          }
          if (Math.abs(factor) > 1e-10) {
            steps.push(`Row ${i+1} = Row ${i+1} - (${factor.toFixed(2)}) * Row ${r+1}:`);
            steps.push(formatMatrixText(A));
          }
        }
      }
      lead++;
    }
    return { res: A, steps };
  };

  const performOperation = (op: string) => {
    setError(null);
    setSteps([]);
    try {
      const matA = getSubMatrix(matrixA, rowsA, colsA);
      const matB = getSubMatrix(matrixB, rowsB, colsB);

      switch (op) {
        case 'add':
          if (rowsA !== rowsB || colsA !== colsB) throw new Error("Dimensions must match for addition");
          setResult(math.add(matA, matB) as MatrixData);
          setResultType('matrix');
          break;
        case 'subtract':
          if (rowsA !== rowsB || colsA !== colsB) throw new Error("Dimensions must match for subtraction");
          setResult(math.subtract(matA, matB) as MatrixData);
          setResultType('matrix');
          break;
        case 'multiply':
          if (colsA !== rowsB) throw new Error("Inner dimensions must match (Cols A = Rows B)");
          setResult(math.multiply(matA, matB) as MatrixData);
          setResultType('matrix');
          break;
        case 'scalarMul':
          setResult(math.multiply(matA, scalar) as MatrixData);
          setResultType('matrix');
          break;
        case 'transpose':
          setResult(math.transpose(matA) as MatrixData);
          setResultType('matrix');
          break;
        case 'determinant':
          if (rowsA !== colsA) throw new Error("Must be square matrix");
          setResult(math.det(matA));
          setResultType('scalar');
          break;
        case 'inverse':
          if (rowsA !== colsA) throw new Error("Must be square matrix");
          if (math.det(matA) === 0) throw new Error("Matrix is singular (no inverse)");
          setResult(math.inv(matA) as MatrixData);
          setResultType('matrix');
          break;
        case 'rank':
          setResult(calculateRank(matA));
          setResultType('scalar');
          break;
        case 'trace':
          if (rowsA !== colsA) throw new Error("Must be square matrix");
          let tr = 0;
          for(let i=0; i<rowsA; i++) tr += matA[i][i];
          setResult(tr);
          setResultType('scalar');
          break;
        case 'rref':
          const { res: rrefResult, steps: rrefSteps } = calculateRREF(matA);
          setResult(rrefResult);
          setSteps(rrefSteps);
          setResultType('matrix');
          break;
        case 'lu':
          const luResult = math.lup(matA);
          setResult(`L:\n${math.format(luResult.L)}\n\nU:\n${math.format(luResult.U)}`);
          setResultType('text');
          break;
        case 'solve':
          if (rowsA !== colsA) throw new Error("A must be square");
          if (rowsB !== rowsA || colsB !== 1) throw new Error("B must be a vector of size " + rowsA);
          const b = matB.map(r => r[0]);
          setResult(math.lusolve(matA, b) as any);
          setResultType('matrix');
          break;
        case 'eigen':
          if (rowsA !== colsA) throw new Error("Must be square matrix");
          const eigs = math.eigs(matA);
          const eigVals = (eigs.values as any).toArray ? (eigs.values as any).toArray() : eigs.values;
          setResult(`Eigenvalues:\n${Array.isArray(eigVals) ? eigVals.join(', ') : eigVals}`);
          setResultType('text');
          break;
        case 'dot':
          if (rowsA !== 1 || rowsB !== 1 || colsA !== colsB) throw new Error("Both must be row vectors of same length");
          setResult(math.dot(matA[0], matB[0]));
          setResultType('scalar');
          break;
        case 'cross':
          if (rowsA !== 1 || rowsB !== 1 || colsA !== 3 || colsB !== 3) throw new Error("Both must be 3D vectors");
          setResult([math.cross(matA[0], matB[0]) as any]);
          setResultType('matrix');
          break;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetMatrices = () => {
    setMatrixA(Array(6).fill(0).map(() => Array(6).fill(0)));
    setMatrixB(Array(6).fill(0).map(() => Array(6).fill(0)));
    setResult(null);
    setResultType(null);
    setError(null);
  };

  const copyResultToA = () => {
    if (resultType === 'matrix' && Array.isArray(result)) {
      const newA = Array(6).fill(0).map(() => Array(6).fill(0));
      const resMat = result as MatrixData;
      setRowsA(resMat.length);
      setColsA(resMat[0].length);
      for(let i=0; i<resMat.length; i++) {
        for(let j=0; j<resMat[0].length; j++) {
          newA[i][j] = resMat[i][j];
        }
      }
      setMatrixA(newA);
    }
  };

  const renderMatrix = (matrix: 'A' | 'B', rows: number, cols: number) => {
    const data = matrix === 'A' ? matrixA : matrixB;
    return (
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: rows }).map((_, r) => (
          Array.from({ length: cols }).map((_, c) => (
            <input
              key={`${matrix}-${r}-${c}`}
              type="text"
              value={data[r][c] === 0 ? '' : data[r][c]}
              placeholder="0"
              onChange={(e) => handleCellChange(matrix, r, c, e.target.value)}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-lg text-center font-mono text-sm focus:border-cyan-500/50 focus:outline-none transition-colors"
            />
          ))
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-syne font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Grid3X3 className="w-6 h-6" />
            </div>
            Matrix Calculator
          </h1>
          <p className="text-muted-foreground mt-1">Advanced linear algebra and matrix operations.</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
          {(['basic', 'advanced', 'solver', 'vectors'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowMatrixB(tab === 'basic' || tab === 'solver' || tab === 'vectors');
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-syne font-bold uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setMatrixA(Array(6).fill(0).map(() => Array(6).fill(0)))} className="text-gray-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">A</div>
                  <h3 className="font-syne font-bold text-sm tracking-wide">MATRIX A</h3>
                </div>
                <div className="flex items-center gap-1">
                  <select value={rowsA} onChange={(e) => setRowsA(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded px-1 text-xs outline-none">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span className="text-gray-600">×</span>
                  <select value={colsA} onChange={(e) => setColsA(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded px-1 text-xs outline-none">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              {renderMatrix('A', rowsA, colsA)}
            </div>

            <AnimatePresence>
              {showMatrixB && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setMatrixB(Array(6).fill(0).map(() => Array(6).fill(0)))} className="text-gray-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">B</div>
                      <h3 className="font-syne font-bold text-sm tracking-wide">MATRIX B</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <select value={rowsB} onChange={(e) => setRowsB(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded px-1 text-xs outline-none">
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <span className="text-gray-600">×</span>
                      <select value={colsB} onChange={(e) => setColsB(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded px-1 text-xs outline-none">
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  {renderMatrix('B', rowsB, colsB)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-syne font-bold text-sm tracking-wide mb-4 flex items-center gap-2 uppercase">
              <Settings2 className="w-4 h-4 text-gray-400" />
              Operations
            </h3>
            <div className="flex flex-wrap gap-3">
              {activeTab === 'basic' && (
                <>
                  <button onClick={() => performOperation('add')} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-colors">A + B</button>
                  <button onClick={() => performOperation('subtract')} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-colors">A - B</button>
                  <button onClick={() => performOperation('multiply')} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-colors">A × B</button>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2">
                    <input type="number" value={scalar} onChange={(e) => setScalar(parseFloat(e.target.value) || 0)} className="w-10 bg-transparent text-center text-sm font-mono focus:outline-none" />
                    <button onClick={() => performOperation('scalarMul')} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg text-xs font-bold transition-colors">k × A</button>
                  </div>
                </>
              )}
              {activeTab === 'advanced' && (
                <>
                  <button onClick={() => performOperation('transpose')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">Aᵀ</button>
                  <button onClick={() => performOperation('inverse')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">A⁻¹</button>
                  <button onClick={() => performOperation('determinant')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">|A|</button>
                  <button onClick={() => performOperation('rank')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">Rank</button>
                  <button onClick={() => performOperation('trace')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">Trace</button>
                  <button onClick={() => performOperation('rref')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">RREF</button>
                  <button onClick={() => performOperation('lu')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">LU</button>
                  <button onClick={() => performOperation('eigen')} className="px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl text-sm font-bold transition-colors">Eigenvalues</button>
                </>
              )}
              {activeTab === 'solver' && (
                <button onClick={() => performOperation('solve')} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                  <Play className="w-4 h-4" /> SOLVE Ax = B
                </button>
              )}
              {activeTab === 'vectors' && (
                <>
                  <button onClick={() => performOperation('dot')} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-bold transition-colors">A·B</button>
                  <button onClick={() => performOperation('cross')} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-bold transition-colors">A×B</button>
                </>
              )}
            </div>
            {activeTab === 'solver' && (
              <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex gap-3 text-xs text-indigo-300">
                <Info className="w-4 h-4 shrink-0" />
                <p>For Ax=B, B must be a N×1 column vector. Coefficients in A, constants in B.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-syne font-bold text-sm tracking-wide uppercase">Result</h3>
              <div className="flex items-center gap-2">
                <button onClick={resetMatrices} className="text-gray-500 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
                {resultType === 'matrix' && (
                  <button onClick={copyResultToA} className="text-gray-500 hover:text-cyan-400 transition-colors"><ArrowRightLeft className="w-4 h-4" /></button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex gap-3"><Info className="w-4 h-4 shrink-0" /> {error}</div>}
              {resultType === 'matrix' && Array.isArray(result) && (
                <div className="space-y-4">
                  <div className="grid gap-2 border-l-2 border-r-2 border-white/20 px-3 py-2" style={{ gridTemplateColumns: `repeat(${result[0].length}, minmax(0, 1fr))` }}>
                    {(result as MatrixData).map((row, r) => row.map((val, c) => (
                      <div key={`res-${r}-${c}`} className="h-10 flex items-center justify-center font-mono text-sm font-bold text-white bg-white/5 rounded">
                        {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(3).replace(/\.?0+$/, '')) : val}
                      </div>
                    )))}
                  </div>
                  <div className="space-y-2 mt-8">
                    <h4 className="text-[10px] font-syne font-bold text-gray-500 uppercase tracking-widest">Heatmap</h4>
                    <div className="grid gap-1 aspect-square max-w-[200px] mx-auto" style={{ gridTemplateColumns: `repeat(${result[0].length}, minmax(0, 1fr))` }}>
                      {(result as MatrixData).map((row, r) => row.map((val, c) => {
                        const maxVal = Math.max(...(result as MatrixData).flat().map(v => Math.abs(v))) || 1;
                        const intensity = Math.min(Math.abs(val) / maxVal, 1);
                        return (
                          <div key={`heat-${r}-${c}`} className="w-full h-full rounded-sm" style={{ backgroundColor: val >= 0 ? `rgba(99, 102, 241, ${0.1 + intensity * 0.9})` : `rgba(244, 63, 94, ${0.1 + intensity * 0.9})` }} title={val.toString()} />
                        );
                      }))}
                    </div>
                  </div>
                </div>
              )}
              {resultType === 'scalar' && (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="text-4xl font-mono font-bold text-white bg-white/5 border border-white/10 rounded-2xl p-8 min-w-[120px] text-center shadow-2xl">
                    {typeof result === 'number' ? (Number.isInteger(result) ? result : result.toFixed(6).replace(/\.?0+$/, '')) : result}
                  </div>
                  <span className="text-xs text-gray-500 font-syne uppercase tracking-wider">Numerical Value</span>
                </div>
              )}
              {resultType === 'text' && <pre className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-300 whitespace-pre-wrap">{result as string}</pre>}
              {!result && !error && <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50"><Layers className="w-12 h-12 mb-4" /> <p className="text-sm font-syne">Select an operation</p></div>}
            </div>

            {steps.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-xs font-syne font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Steps
                </h4>
                <div className="space-y-4 max-h-[300px] overflow-y-auto px-1 custom-scrollbar">
                  {steps.map((step, idx) => (
                    <div key={idx} className={cn("text-xs font-mono p-2 rounded-lg", idx % 2 === 0 ? "text-gray-300 bg-white/5" : "text-gray-400")}>
                      {step.split('\n').map((line, lidx) => <div key={lidx} className={line.startsWith('[') ? "text-cyan-400/80 mt-1" : "font-syne font-bold"}>{line}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
