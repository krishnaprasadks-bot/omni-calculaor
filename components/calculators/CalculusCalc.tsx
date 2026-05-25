'use client';

import React, { useState, useMemo } from 'react';
import { 
  Variable, 
  FunctionSquare, 
  Sigma, 
  ArrowRight,
  Play,
  RotateCcw,
  Info,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Calculus';
import 'nerdamer/Algebra';
import 'nerdamer/Solve';
import { cn } from '@/lib/utils';

type CalcMode = 'diff' | 'int' | 'limit' | 'series';

export function CalculusCalc() {
  // Common state
  const [mode, setMode] = useState<CalcMode>('diff');
  const [expression, setExpression] = useState('x^2 + sin(x)');
  const [variable, setVariable] = useState('x');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Differentiation state
  const [order, setOrder] = useState(1);
  const [evalAt, setEvalAt] = useState('');

  // Integration state
  const [intType, setIntType] = useState<'indefinite' | 'definite'>('indefinite');
  const [lowerBound, setLowerBound] = useState('0');
  const [upperBound, setUpperBound] = useState('1');

  // Limit state
  const [limitPoint, setLimitPoint] = useState('0');
  const [limitDirection, setLimitDirection] = useState<'both' | 'left' | 'right'>('both');

  // Series state
  const [seriesPoint, setSeriesPoint] = useState('0');
  const [seriesTerms, setSeriesTerms] = useState(5);

  const calculate = () => {
    setError(null);
    setResult(null);
    try {
      let res = '';
      switch (mode) {
        case 'diff':
          let diffExpr = expression;
          for (let i = 0; i < order; i++) {
            diffExpr = nerdamer.diff(diffExpr, variable).toString();
          }
          
          if (evalAt) {
            const val = nerdamer(diffExpr, { [variable]: evalAt }).evaluate();
            res = `${diffExpr} = ${val.toString()}`;
          } else {
            res = diffExpr;
          }
          break;

        case 'int':
          if (intType === 'indefinite') {
            res = nerdamer.integrate(expression, variable).toString();
          } else {
            // Definite integration
            try {
              // Try symbolic first
              const indefinite = nerdamer.integrate(expression, variable);
              const f_upper = nerdamer(indefinite.toString(), { [variable]: upperBound }).evaluate();
              const f_lower = nerdamer(indefinite.toString(), { [variable]: lowerBound }).evaluate();
              const diff = nerdamer(`${f_upper} - ${f_lower}`).evaluate();
              res = diff.toString();
            } catch (e) {
              // Fallback to numeric integration (Trapezoidal)
              const f = math.compile(expression);
              const a = parseFloat(lowerBound);
              const b = parseFloat(upperBound);
              const n = 1000;
              const h = (b - a) / n;
              let sum = 0.5 * (f.evaluate({ [variable]: a }) + f.evaluate({ [variable]: b }));
              for (let i = 1; i < n; i++) {
                sum += f.evaluate({ [variable]: a + i * h });
              }
              res = (sum * h).toFixed(8);
            }
          }
          break;

        case 'limit':
          // Numerical limit approximation
          const point = parseFloat(limitPoint);
          const f_limit = math.compile(expression);
          const epsilons = [1e-4, 1e-6, 1e-8, 1e-10];
          
          let leftVal = 0, rightVal = 0;
          
          if (limitDirection !== 'right') {
            const vals = epsilons.map(eps => f_limit.evaluate({ [variable]: point - eps }));
            leftVal = vals[vals.length - 1];
          }
          
          if (limitDirection !== 'left') {
            const vals = epsilons.map(eps => f_limit.evaluate({ [variable]: point + eps }));
            rightVal = vals[vals.length - 1];
          }

          if (limitDirection === 'both') {
            if (Math.abs(leftVal - rightVal) < 1e-4) {
              res = leftVal.toFixed(6);
            } else {
              res = "Undefined (Left and Right limits differ)";
            }
          } else {
            res = (limitDirection === 'left' ? leftVal : rightVal).toFixed(6);
          }
          break;

        case 'series':
          const taylor = (nerdamer as any).series(expression, variable, seriesPoint, seriesTerms);
          res = taylor.toString();
          break;
      }
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clear = () => {
    setExpression('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-syne font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Activity className="w-6 h-6" />
            </div>
            Calculus Tools
          </h1>
          <p className="text-muted-foreground mt-1">Symbolic and numerical analysis of functions.</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'diff', label: 'Derivatives', icon: TrendingUp },
            { id: 'int', label: 'Integrals', icon: Sigma },
            { id: 'limit', label: 'Limits', icon: ArrowRight },
            { id: 'series', label: 'Series', icon: FunctionSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id as any);
                setResult(null);
                setError(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-syne font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                mode === tab.id ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Function f({variable})</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-lg focus:border-orange-500 focus:outline-none transition-all"
                    placeholder="e.g. x^2 + sin(2*x)"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button onClick={clear} className="text-gray-600 hover:text-gray-400 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Variable</label>
                <input
                  type="text"
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:border-orange-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <AnimatePresence mode="wait">
                {mode === 'diff' && (
                  <motion.div
                    key="diff-opts"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order of Derivative</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setOrder(n)}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-xs font-bold transition-all border",
                              order === n ? "bg-orange-500 border-orange-400 text-black" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                            )}
                          >
                            {n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Evaluate at (Optional)</label>
                      <input
                        type="text"
                        value={evalAt}
                        onChange={(e) => setEvalAt(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {mode === 'int' && (
                  <motion.div
                    key="int-opts"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex bg-black/20 p-1 rounded-xl">
                      {(['indefinite', 'definite'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setIntType(t)}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                            intType === t ? "bg-white/10 text-white" : "text-gray-500"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {intType === 'definite' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lower Bound</label>
                          <input type="text" value={lowerBound} onChange={(e) => setLowerBound(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-center" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upper Bound</label>
                          <input type="text" value={upperBound} onChange={(e) => setUpperBound(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-center" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {mode === 'limit' && (
                  <motion.div
                    key="limit-opts"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approaching</label>
                      <input type="text" value={limitPoint} onChange={(e) => setLimitPoint(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm" placeholder="Point a" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Direction</label>
                      <div className="flex gap-2">
                        {(['both', 'left', 'right'] as const).map(d => (
                          <button
                            key={d}
                            onClick={() => setLimitDirection(d)}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border",
                              limitDirection === d ? "bg-orange-500/20 border-orange-500/30 text-orange-400" : "bg-white/5 border-white/10 text-gray-500"
                            )}
                          >
                            {d === 'both' ? 'x → a' : d === 'left' ? 'x → a⁻' : 'x → a⁺'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === 'series' && (
                  <motion.div
                    key="series-opts"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Expansion Point</label>
                        <input type="text" value={seriesPoint} onChange={(e) => setSeriesPoint(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Num Terms</label>
                        <input type="number" value={seriesTerms} onChange={(e) => setSeriesTerms(parseInt(e.target.value) || 1)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end">
                <button
                  onClick={calculate}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-black font-syne font-extrabold uppercase rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  Calculate
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[200px] flex flex-col">
            <h3 className="text-sm font-syne font-bold text-gray-500 uppercase tracking-widest mb-6">Result</h3>
            <div className="flex-1 flex flex-col justify-center">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex gap-3">
                  <Info className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {result && (
                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-center">
                  <div className="text-3xl font-mono text-white mb-2 break-all">{result}</div>
                  <div className="text-[10px] font-syne font-bold text-gray-500 uppercase tracking-widest">Calculated Output</div>
                </div>
              )}
              {!result && !error && (
                <div className="flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
                  <Variable className="w-12 h-12" />
                  <p className="text-sm font-syne">Input function and parameters to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-syne font-bold text-sm mb-4 flex items-center gap-2 uppercase">
              <Info className="w-4 h-4 text-gray-400" />
              Calculus Guide
            </h3>
            <div className="space-y-4 text-xs text-gray-400 font-syne leading-relaxed">
              <div className="space-y-2">
                <p className="text-white font-bold uppercase tracking-wider">Notation Hints:</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Use <code className="text-orange-400">^</code> for powers: x^2</li>
                  <li>Use <code className="text-orange-400">*</code> for multiplication: 2*x</li>
                  <li>Standard functions: <code className="text-emerald-400">sin, cos, log, exp, sqrt</code></li>
                  <li>Constants: <code className="text-emerald-400">pi, e</code></li>
                </ul>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 mt-4">
                <p className="font-bold text-gray-300 mb-1">Differentiation</p>
                <p>Calculates the instantaneous rate of change. Higher orders available (1st, 2nd, etc).</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-gray-300 mb-1">Integration</p>
                <p>Finds the area under the curve. Supports symbolic antiderivatives and numerical definite integrals.</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-gray-300 mb-1">Limits</p>
                <p>Approximated numerically by sampling points extremely close to the target value from both sides.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
