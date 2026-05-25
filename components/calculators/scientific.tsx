'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as mathjs from 'mathjs';
import { FunctionSquare, History, Bookmark, Copy, Trash2, Check, Equal, Delete, ChevronRight, CornerDownLeft, Divide, X, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { useCalc } from '@/components/calc-context';
import { motion, AnimatePresence } from 'motion/react';

// Isolated math instances
const baseMath = mathjs.create(mathjs.all);
const sciMath = mathjs.create(mathjs.all);

type AngleMode = 'deg' | 'rad' | 'grad';

let currentAngleMode: AngleMode = 'rad';
export const setSciAngleMode = (mode: AngleMode) => { currentAngleMode = mode; };

function convertIn(x: any) {
  if (typeof x === 'number') {
     if (currentAngleMode === 'deg') return x * Math.PI / 180;
     if (currentAngleMode === 'grad') return x * Math.PI / 200;
  }
  return x;
}
function convertOut(x: any) {
  if (typeof x === 'number') {
     if (currentAngleMode === 'deg') return x * 180 / Math.PI;
     if (currentAngleMode === 'grad') return x * 200 / Math.PI;
  }
  return x;
}

sciMath.import({
  sin: function(x: any) { return baseMath.sin(convertIn(x)); },
  cos: function(x: any) { return baseMath.cos(convertIn(x)); },
  tan: function(x: any) { return baseMath.tan(convertIn(x)); },
  asin: function(x: any) { return convertOut(baseMath.asin(x)); },
  acos: function(x: any) { return convertOut(baseMath.acos(x)); },
  atan: function(x: any) { return convertOut(baseMath.atan(x)); },
  sec: function(x: any) { return baseMath.sec(convertIn(x)); },
  csc: function(x: any) { return baseMath.csc(convertIn(x)); },
  cot: function(x: any) { return baseMath.cot(convertIn(x)); },
  asec: function(x: any) { return convertOut(baseMath.asec(x)); },
  acsc: function(x: any) { return convertOut(baseMath.acsc(x)); },
  acot: function(x: any) { return convertOut(baseMath.acot(x)); },
  nPr: function(n: number, r: number) { return baseMath.permutations(n, r); },
  nCr: function(n: number, r: number) { return baseMath.combinations(n, r); },
  isPrime: function(n: number) { 
     if (n <= 1) return false;
     if (n <= 3) return true;
     if (n % 2 === 0 || n % 3 === 0) return false;
     for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
     }
     return true;
  },
  frac: function(n: number) { return n - Math.trunc(n); },
  rand: Math.random,
  randint: function(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; },
  log2: baseMath.log2,
  ln: function(x: any) { return baseMath.log(x); },
  logb: function(x: any, base: number) { return baseMath.log(x, base); },
  dfact: function(n: number) {
     if (n < 0) return NaN;
     if (n === 0 || n === 1) return 1;
     let res = 1;
     for(let i = n; i > 0; i-=2) res *= i;
     return res;
  }
}, {override: true});

const CONSTANTS = [
  { symbol: 'π', val: 'pi', name: 'Pi' },
  { symbol: 'e', val: 'e', name: 'Euler\'s Number' },
  { symbol: 'φ', val: 'phi', name: 'Golden Ratio' },
  { symbol: 'c', val: '299792458', name: 'Speed of Light (m/s)' },
  { symbol: 'g', val: '9.80665', name: 'Standard Gravity (m/s²)' },
  { symbol: 'G', val: '6.67430e-11', name: 'Gravitational Constant' },
  { symbol: 'ℏ', val: '1.054571817e-34', name: 'Reduced Planck Constant' },
  { symbol: 'kB', val: '1.380649e-23', name: 'Boltzmann Constant' },
  { symbol: 'NA', val: '6.02214076e23', name: 'Avogadro Number' },
  { symbol: 'R', val: '8.314462618', name: 'Gas Constant' },
  { symbol: 'γ', val: '0.5772156649', name: 'Euler-Mascheroni' },
];

export function ScientificCalc() {
  const [expr, setExpr] = useState('');
  const [ans, setAns] = useState('0');
  const [livePreview, setLivePreview] = useState('');
  const [angleMode, setAngleModeState] = useState<AngleMode>('rad');
  const [formatMode, setFormatMode] = useState<string>('decimal');
  const [activeTab, setActiveTab] = useState<string>('trig');
  const [copied, setCopied] = useState(false);
  
  const { history, addToHistory, clearHistory, deleteHistoryItem } = useCalc();
  const [historyStack, setHistoryStack] = useState<string[]>(['']);
  const [stackIndex, setStackIndex] = useState(0);

  useEffect(() => {
    setSciAngleMode(angleMode);
    setExpr(e => e + ' ');
    setTimeout(() => setExpr(e => e.trimEnd()), 0);
  }, [angleMode]);

  const pushState = (newExpr: string) => {
    const newStack = historyStack.slice(0, stackIndex + 1);
    newStack.push(newExpr);
    setHistoryStack(newStack);
    setStackIndex(newStack.length - 1);
    setExpr(newExpr);
  };

  const formatResult = (result: any, fmt: 'decimal' | 'fraction' | 'polar') => {
     if (typeof result === 'boolean') return result ? 'true' : 'false';
     if (!result && result !== 0) return '';
     
     if (result.isComplex || result.type === 'Complex') {
       if (fmt === 'polar') {
          const polar = result.toPolar();
          let phi = polar.phi;
          if (angleMode === 'deg') phi = phi * 180 / Math.PI;
          if (angleMode === 'grad') phi = phi * 200 / Math.PI;
          return `${sciMath.format(polar.r, {precision: 10})} ∠ ${sciMath.format(phi, {precision: 10})}°`;
       }
       return sciMath.format(result, {precision: 10});
     }

     if (typeof result === 'number') {
       if (fmt === 'fraction') {
          try {
            return sciMath.format(sciMath.fraction(result), {fraction: 'ratio'});
          } catch {
            return sciMath.format(result, {precision: 14});
          }
       }
       return sciMath.format(result, {precision: 14});
     }
     
     return String(result);
  };

  const parseContext = (s: string) => {
     let p = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
     p = p.replace(/ANS/g, `(${ans === 'Error' ? '0' : ans})`);
     return p;
  };

  useEffect(() => {
    if (!expr) {
      setLivePreview('');
      return;
    }
    try {
      const scope = { c: 299792458, g: 9.80665, G: 6.67430e-11, hbar: 1.054571817e-34, kB: 1.380649e-23, NA: 6.02214076e23, R: 8.314462618, gamma: 0.5772156649 };
      const res = sciMath.evaluate(parseContext(expr), scope);
      if (typeof res === 'function') { setLivePreview(''); return; }
      setLivePreview(formatResult(res, formatMode));
    } catch {
      setLivePreview('');
    }
  }, [expr, angleMode, formatMode, ans]);

  const handlePress = (action: string) => {
    if (action === 'C') { pushState(''); setAns('0'); return; }
    if (action === 'DEL') { pushState(expr.slice(0, -1)); return; }
    if (action === 'AC') { pushState(''); setAns('0'); return; }
    
    if (action === '=') {
      try {
        if (!expr.trim()) return;
        const scope = { c: 299792458, g: 9.80665, G: 6.67430e-11, hbar: 1.054571817e-34, kB: 1.380649e-23, NA: 6.02214076e23, R: 8.314462618, gamma: 0.5772156649 };
        const result = sciMath.evaluate(parseContext(expr), scope);
        const fmt = formatResult(result, formatMode);
        setAns(fmt);
        addToHistory({ mode: 'scientific', expression: expr, result: fmt });
        pushState('');
      } catch (e: any) {
        setAns('Syntax Error');
      }
      return;
    }
    pushState(expr + action);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(ans);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function renderPadBtn(action: string, label: React.ReactNode, type: string = 'func') {
    return (
      <button 
        key={action}
        onClick={() => handlePress(action)}
        className={clsx(
           "h-12 glass-button rounded-xl font-mono text-sm active:scale-95 transition-all text-white",
           type === 'op' && "text-brand-violet text-xl bg-brand-violet/10 border-brand-violet/20",
           type === 'num' && "bg-white/5",
           type === 'func' && "text-white/70 bg-black/30 border border-white/5 hover:border-white/20"
        )}>
        {label}
      </button>
    );
  }

  return <div className="flex flex-col h-full max-w-[1400px] w-full mx-auto p-4 gap-4 overflow-y-auto">
      
      <div className="w-full flex justify-between items-center px-4 bg-black/40 p-3 rounded-2xl border border-white/5 shadow-md shrink-0">
         <div className="flex items-center gap-2 text-violet-400">
           <FunctionSquare className="w-5 h-5"/>
           <span className="font-mono uppercase tracking-widest text-sm font-bold">Scientific</span>
         </div>
         <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden p-1">
            {['deg', 'rad', 'grad'].map(mode => (
              <button 
                key={mode} 
                onClick={() => setAngleModeState(mode as AngleMode)}
                className={clsx("px-3 py-1 font-mono text-xs uppercase rounded-lg transition-colors", angleMode === mode ? "bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30" : "text-white/40 hover:text-white")}
              >
                {mode}
              </button>
            ))}
         </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 h-full xl:overflow-hidden min-h-[700px]">
         
         <div className="flex-1 flex flex-col gap-4">
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 flex flex-col justify-end min-h-[220px] relative shrink-0">
                <div className="absolute top-4 left-4 flex gap-2">
                   {['decimal', 'fraction', 'polar'].map(fmt => (
                     <button
                       key={fmt}
                       onClick={() => setFormatMode(fmt as any)}
                       className={clsx("px-2 py-1 font-mono text-[10px] uppercase rounded-md border transition-colors", formatMode === fmt ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30" : "bg-black/40 text-white/40 border-white/10 hover:border-white/20")}
                     >
                       {fmt === 'decimal' ? 'DEC' : fmt === 'fraction' ? 'FRAC(p/q)' : 'POLAR(r∠θ)'}
                     </button>
                   ))}
                </div>
                <button onClick={copyResult} className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                
                <div className="font-mono text-white/50 text-2xl w-full text-right overflow-x-auto whitespace-nowrap scrollbar-hide pt-10 select-text">
                  {expr || '...'}
                </div>
                <div className="flex items-center justify-end w-full gap-4 mt-2">
                   {livePreview && livePreview !== ans && !ans.startsWith('Error') && (
                     <span className="font-mono text-white/30 text-xl">= {livePreview}</span>
                   )}
                   <span className={clsx("font-mono font-bold tracking-widest text-right overflow-x-auto whitespace-nowrap scrollbar-hide select-text", ans.startsWith('Syntax') ? 'text-red-400 text-3xl' : 'text-white text-glow-cyan text-5xl py-2 min-h-[60px]')}>
                     {ans}
                   </span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full xl:overflow-hidden">
                
                <div className="lg:col-span-4 xl:col-span-5 glass-panel rounded-3xl border border-white/5 p-4 flex flex-col h-full xl:overflow-hidden">
                   <div className="flex gap-1 overflow-x-auto border-b border-white/10 pb-3 scrollbar-hide shrink-0">
                      {['trig', 'math', 'complex', 'const'].map(tab => (
                         <button key={tab} onClick={() => setActiveTab(tab as any)} className={clsx("px-4 py-2 font-mono text-xs uppercase rounded-xl transition-all whitespace-nowrap", activeTab === tab ? "bg-violet-500/20 text-violet-300 font-bold" : "text-white/40 hover:bg-white/5")}>
                            {tab}
                         </button>
                      ))}
                   </div>
                   <div className="flex-1 pt-4 overflow-y-auto scrollbar-hide pb-2">
                      {activeTab === 'trig' && <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-3 text-[10px] text-white/30 font-mono uppercase mb-1">Standard</div>
                            {['sin(', 'cos(', 'tan(', 'sec(', 'csc(', 'cot('].map(f => renderPadBtn(f, f.slice(0,-1)))}
                            <div className="col-span-3 text-[10px] text-white/30 font-mono uppercase mb-1 mt-2">Inverse</div>
                            {['asin(', 'acos(', 'atan(', 'asec(', 'acsc(', 'acot('].map((f) => renderPadBtn(f, f.slice(0,-1).replace('a', '') + '⁻¹'))}
                            <div className="col-span-3 text-[10px] text-white/30 font-mono uppercase mb-1 mt-2">Hyperbolic</div>
                            {['sinh(', 'cosh(', 'tanh(', 'asinh(', 'acosh(', 'atanh('].map(f => renderPadBtn(f, f.slice(0,-1)))}
                         </div>}
                      {activeTab === 'math' && <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            <div className="col-span-full text-[10px] text-white/30 font-mono uppercase mb-1">Log & Exp</div>
                            {['log(', 'ln(', 'logb(', 'exp(', '10^', 'e^'].map(f => renderPadBtn(f, f.replace('(','')))}
                            <div className="col-span-full text-[10px] text-white/30 font-mono uppercase mb-1 mt-2">Roots & Power</div>
                            {['sqrt(', 'cbrt(', 'nthRoot(', '^2', '^3', '^(-1)'].map(f => renderPadBtn(f, f))}
                            <div className="col-span-full text-[10px] text-white/30 font-mono uppercase mb-1 mt-2">Number & Comb</div>
                            {['!', 'dfact(', 'nPr(', 'nCr(', 'gcd(', 'lcm(', 'isPrime(', 'frac(', 'abs(', 'ceil(', 'floor(', 'rand()', 'randint('].map(f => renderPadBtn(f, f))}
                         </div>}
                      {activeTab === 'complex' && <div className="grid grid-cols-2 gap-2">
                            {['i', 'e^(i*', 'abs(', 'arg(', 'conj(', 're(', 'im('].map(f => renderPadBtn(f, f))}
                         </div>}
                      {activeTab === 'const' && <div className="flex flex-col gap-2">
                            {CONSTANTS.map(c => (
                               <button onClick={() => handlePress(c.symbol)} key={c.symbol} className="flex gap-4 p-3 bg-black/20 hover:bg-black/40 border border-white/5 hover:border-violet-500/30 rounded-xl transition-all cursor-pointer text-left items-center group">
                                  <span className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 font-mono text-xl flex items-center justify-center shrink-0 border border-violet-500/20 group-hover:bg-violet-500/20">
                                     {c.symbol}
                                  </span>
                                  <div className="flex flex-col">
                                     <span className="text-white/80 font-mono text-sm">{c.name}</span>
                                     <span className="text-white/40 font-mono text-xs">{c.val}</span>
                                  </div>
                               </button>
                            ))}
                         </div>}
                   </div>
                </div>

                <div className="lg:col-span-8 xl:col-span-7 glass-panel rounded-3xl border border-white/5 p-4 flex flex-col">
                   <div className="grid grid-cols-5 gap-2 sm:gap-3 flex-1 h-full min-h-[400px]">
                      {renderPadBtn('(', '(')}
                      {renderPadBtn(')', ')')}
                      {renderPadBtn(',', ',')}
                      {renderPadBtn('DEL', <Delete className="w-5 h-5 mx-auto"/>, 'func')}
                      {renderPadBtn('AC', 'AC', 'func')}

                      {renderPadBtn('7', '7', 'num')}
                      {renderPadBtn('8', '8', 'num')}
                      {renderPadBtn('9', '9', 'num')}
                      {renderPadBtn('+', <Plus className="w-5 h-5 mx-auto"/>, 'op')}
                      {renderPadBtn('-', <Minus className="w-5 h-5 mx-auto"/>, 'op')}

                      {renderPadBtn('4', '4', 'num')}
                      {renderPadBtn('5', '5', 'num')}
                      {renderPadBtn('6', '6', 'num')}
                      {renderPadBtn('*', <X className="w-5 h-5 mx-auto"/>, 'op')}
                      {renderPadBtn('/', <Divide className="w-5 h-5 mx-auto"/>, 'op')}

                      {renderPadBtn('1', '1', 'num')}
                      {renderPadBtn('2', '2', 'num')}
                      {renderPadBtn('3', '3', 'num')}
                      <button onClick={() => handlePress('^')} className="glass-button text-brand-violet text-xl bg-brand-violet/10 border-brand-violet/20 h-full rounded-xl font-mono text-center row-span-2 flex items-center justify-center">
                         xʸ
                      </button>
                      <button onClick={() => handlePress('=')} className="bg-violet-500 hover:bg-violet-400 text-white font-bold text-2xl box-glow-violet h-full rounded-xl flex items-center justify-center row-span-2 border-none">
                         <Equal className="w-8 h-8" />
                      </button>

                      {renderPadBtn('0', '0', 'num')}
                      {renderPadBtn('.', '.', 'num')}
                      {renderPadBtn('E', 'EXP')}
                   </div>
                </div>
            </div>
         </div>

         <div className="glass-panel p-6 rounded-[2rem] border border-white/5 xl:w-80 shrink-0 flex flex-col h-full xl:overflow-hidden max-h-[500px] xl:max-h-none">
             <div className="flex items-center justify-between mb-6 shrink-0">
               <h3 className="font-mono text-cyan-400 tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                 <History className="w-4 h-4"/> Tape
               </h3>
               <button onClick={clearHistory} className="text-xs font-mono text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                 CLEAR All
               </button>
             </div>
             
             <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
                {history.filter(h => h.mode === 'scientific').length === 0 ? (
                   <p className="text-white/30 font-mono text-sm text-center py-8">No calculations yet</p>
                ) : (
                   history.filter(h => h.mode === 'scientific').slice().reverse().map(item => (
                     <div key={item.id} className="relative group p-3 rounded-xl bg-black/30 border border-white/5 hover:border-violet-500/30 transition-colors flex flex-col items-end gap-1 cursor-pointer"
                           onClick={() => pushState(item.expression)}>
                         <div className="w-full flex justify-between items-center text-[10px] text-white/30 font-mono">
                           <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                           <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                              <Trash2 className="w-3 h-3"/>
                           </button>
                         </div>
                         <div className="font-mono text-white/50 text-xs break-all text-right w-full">{item.expression}</div>
                         <div className="font-mono text-violet-400 text-base font-bold break-all w-full text-right break-words mt-1">={item.result}</div>
                     </div>
                   ))
                )}
             </div>
         </div>
      </div>
    </div>
}
