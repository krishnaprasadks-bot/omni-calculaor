'use client';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import * as mathjs from 'mathjs';
import { Delete, Equal, Calculator, Copy, Check, History, ChevronDown, Trash2, Settings2, Download, Search, Undo, Redo, CornerDownLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useCalc } from '@/components/calc-context';
import { motion, AnimatePresence } from 'motion/react';

const NUMPAD_BUTTONS = [
  // Func row
  { label: 'mod', action: ' mod ', type: 'func' },
  { label: 'x³', action: '^3', type: 'func' },
  { label: 'x²', action: '^2', type: 'func' },
  { label: '√x', action: 'sqrt(', type: 'func' },
  { label: '1/x', action: '1/', type: 'func' },
  
  // Row 2
  { label: '%', action: '%', type: 'func' },
  { label: 'CE', action: 'CE', type: 'ctrl' },
  { label: 'C', action: 'C', type: 'ctrl' },
  { label: 'DEL', action: 'DEL', type: 'ctrl' },
  { label: '÷', action: '/', type: 'op' },

  // Row 3 
  { label: 'int÷', action: ' intdiv ', type: 'func' },
  { label: '7', action: '7', type: 'num' },
  { label: '8', action: '8', type: 'num' },
  { label: '9', action: '9', type: 'num' },
  { label: '×', action: '*', type: 'op' },

  // Row 4
  { label: 'ANS', action: 'ANS', type: 'func' },
  { label: '4', action: '4', type: 'num' },
  { label: '5', action: '5', type: 'num' },
  { label: '6', action: '6', type: 'num' },
  { label: '−', action: '-', type: 'op' },

  // Row 5
  { label: '(', action: '(', type: 'func' },
  { label: '1', action: '1', type: 'num' },
  { label: '2', action: '2', type: 'num' },
  { label: '3', action: '3', type: 'num' },
  { label: '+', action: '+', type: 'op' },

  // Row 6
  { label: ')', action: ')', type: 'func' },
  { label: '±', action: '±', type: 'func' },
  { label: '0', action: '0', type: 'num' },
  { label: '.', action: '.', type: 'num' },
  { label: '=', action: '=', type: 'eq' },
];

// Initialize mathjs instance with custom function
const math = mathjs.create(mathjs.all);
math.import({
  intdiv: function (a: number, b: number) {
    if (b === 0) throw new Error("Division by zero");
    return Math.trunc(a / b);
  }
}, { override: true });

function formatNumber(num: number | string, precision: number, separators: boolean, trailingZeros: boolean) {
  try {
    const n = Number(num);
    if (isNaN(n)) return String(num);
    
    // Auto switch to scientific if too large/small
    if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
       return n.toExponential(precision);
    }
    
    let res = math.format(n, { precision: precision > 0 ? precision : 14, notation: 'fixed' });
    if (!trailingZeros && res.includes('.')) {
      res = res.replace(/\.?0+$/, '');
    }
    
    if (separators) {
      const parts = res.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join('.');
    }
    return res;
  } catch {
    return String(num);
  }
}

export function StandardCalc() {
  const [expr, setExpr] = useState('');
  const [ans, setAns] = useState('0');
  const [livePreview, setLivePreview] = useState('');
  const [copied, setCopied] = useState(false);
  const { history, addToHistory, clearHistory, deleteHistoryItem } = useCalc();
  
  // Settings
  const [precision, setPrecision] = useState(6);
  const [separators, setSeparators] = useState(true);
  const [trailingZeros, setTrailingZeros] = useState(false);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  
  const [memories, setMemories] = useState<Record<string, number>>({
    M1: 0, M2: 0, M3: 0, M4: 0, M5: 0
  });
  const [activeSlot, setActiveSlot] = useState('M1');

  // Undo / Redo
  const [historyStack, setHistoryStack] = useState<string[]>(['']);
  const [stackIndex, setStackIndex] = useState(0);

  const pushState = (newExpr: string) => {
    const newStack = historyStack.slice(0, stackIndex + 1);
    newStack.push(newExpr);
    setHistoryStack(newStack);
    setStackIndex(newStack.length - 1);
    setExpr(newExpr);
  };

  const undo = () => {
    if (stackIndex > 0) {
      setStackIndex(prev => prev - 1);
      setExpr(historyStack[stackIndex - 1]);
    }
  };

  const redo = () => {
    if (stackIndex < historyStack.length - 1) {
      setStackIndex(prev => prev + 1);
      setExpr(historyStack[stackIndex + 1]);
    }
  };

  const parseExprContext = (expression: string) => {
     let parsed = expression.replace(/×/g, '*').replace(/÷/g, '/');
     parsed = parsed.replace(/ANS/g, `(${ans === 'Error' ? '0' : ans})`);
     return parsed;
  };

  // Live preview effect
  useEffect(() => {
    if (!expr) {
      setLivePreview('');
      return;
    }
    try {
      const result = math.evaluate(parseExprContext(expr));
      setLivePreview(formatNumber(result, precision, separators, trailingZeros));
    } catch {
      setLivePreview('');
    }
  }, [expr, precision, separators, trailingZeros, ans]);

  const handlePress = useCallback((action: string) => {
    if (action === 'C') {
      pushState('');
      setAns('0');
      return;
    }
    if (action === 'CE') {
      pushState('');
      return;
    }
    if (action === 'DEL') {
      pushState(expr.slice(0, -1));
      return;
    }
    if (action === '±') {
      if (ans && ans !== '0' && !ans.startsWith('Error')) {
        const toggled = ans.startsWith('-') ? ans.slice(1) : '-' + ans;
        setAns(toggled);
        pushState(toggled);
      }
      return;
    }

    if (action === '=') {
      try {
        if (!expr.trim()) return;
        const result = math.evaluate(parseExprContext(expr));
        if (!isFinite(result)) throw new Error("Result too large");
        
        const formatResult = formatNumber(result, precision, separators, trailingZeros);
        setAns(formatResult);
        addToHistory({ mode: 'basic', expression: expr, result: formatResult });
        pushState('');
      } catch (e: any) {
        if (e.message?.includes('Division by zero')) {
           setAns('Error: Division by zero');
        } else if (e.message?.includes('Result too large')) {
           setAns('Error: Result too large');
        } else {
           setAns('Error');
        }
      }
      return;
    }

    const isOperator = ['+', '-', '*', '/', '%', '^', ' mod ', ' intdiv '].includes(action);
    if (ans !== '0' && expr === '' && isOperator) {
       pushState(ans + action);
    } else {
       pushState(expr + action);
    }
  }, [expr, ans, addToHistory, precision, separators, trailingZeros, historyStack, stackIndex]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;
      
      const keyMap: Record<string, string> = {
        'Enter': '=',
        '=': '=',
        'Backspace': 'DEL',
        'Delete': 'CE',
        'Escape': 'C',
        '*': '*',
        '/': '/',
        '+': '+',
        '-': '-',
        '%': '%',
        '^': '^',
      };

      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
         e.preventDefault(); undo(); return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
         e.preventDefault(); redo(); return;
      }

      if (e.key.match(/^[0-9.()]$/)) {
        handlePress(e.key);
      } else if (keyMap[e.key]) {
        e.preventDefault();
        handlePress(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePress]);

  const copyResult = () => {
    navigator.clipboard.writeText(ans);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/[^0-9+\-*/().%^]/g, '');
      if (cleaned) pushState(expr + cleaned);
    } catch {}
  };

  const currentMemVal = memories[activeSlot];

  return (
    <div className="flex flex-col h-full items-center justify-start py-4 w-full px-2 gap-4 max-w-2xl mx-auto overflow-y-auto">
      
      {/* Top Bar Navigation */}
      <div className="w-full flex justify-between items-center px-4 bg-black/40 p-3 rounded-2xl border border-white/5 shadow-md">
         <div className="flex items-center gap-2 text-cyan-400">
           <Calculator className="w-5 h-5"/>
           <span className="font-mono uppercase tracking-widest text-sm font-bold">Standard</span>
         </div>
         <div className="flex items-center gap-2">
           <button onClick={() => setShowHistory(!showHistory)} className={clsx("p-2 rounded-xl border transition-colors", showHistory ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "glass-button text-white/50 border-white/5 hover:text-white")}>
             <History className="w-4 h-4" />
           </button>
           <button onClick={() => setShowMemory(!showMemory)} className={clsx("p-2 rounded-xl border transition-colors font-mono font-bold text-xs", showMemory ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "glass-button text-white/50 border-white/5 hover:text-white")}>
             M
           </button>
           <button onClick={() => setShowSettings(!showSettings)} className={clsx("p-2 rounded-xl border transition-colors", showSettings ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "glass-button text-white/50 border-white/5 hover:text-white")}>
             <Settings2 className="w-4 h-4" />
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full items-start">
        <div className="flex flex-col gap-4 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] md:col-span-12 xl:col-span-9 p-6 glass-panel rounded-[2rem]">
          
          {/* Display */}
          <div className={clsx("bg-black/40 rounded-3xl p-6 flex flex-col items-end gap-2 border shadow-inner min-h-[160px] justify-end relative overflow-hidden group transition-all", ans.startsWith('Error') ? 'border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/5')}
               onDoubleClick={handlePaste}>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/5 to-transparent pointer-events-none opacity-50" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
               <button onClick={copyResult} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Copy Result">
                 {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
               </button>
               <button onClick={undo} disabled={stackIndex <= 0} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 transition-colors" title="Undo (Ctrl+Z)">
                 <Undo className="w-4 h-4" />
               </button>
               <button onClick={redo} disabled={stackIndex >= historyStack.length - 1} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 transition-colors" title="Redo (Ctrl+Y)">
                 <Redo className="w-4 h-4" />
               </button>
               {currentMemVal !== 0 && (
                 <div className="ml-2 px-3 py-1 bg-brand-violet/20 border border-brand-violet/30 text-brand-violet rounded-lg font-mono text-xs flex items-center gap-1 object-contain">
                    M: {formatNumber(currentMemVal, precision, separators, trailingZeros)}
                 </div>
               )}
            </div>

            <div className="font-mono w-full text-right overflow-x-auto whitespace-nowrap scrollbar-hide select-text text-xl pt-10">
               {expr.split(/([+\-*/()^%]|mod)/).map((part, i) => (
                 <span key={i} className={clsx(
                   ['+','-','*','/','%','^','mod'].includes(part.trim()) ? "text-brand-violet" : "text-white/60"
                 )}>{part}</span>
               ))}
               <span className="text-white/20 ml-1 animate-pulse">|</span>
            </div>
            
            <div className="flex items-center gap-4 w-full justify-end">
               {livePreview && livePreview !== ans && !ans.startsWith('Error') && (
                 <span className="font-mono text-white/30 text-lg">= {livePreview}</span>
               )}
               <div className={clsx("font-mono tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide transition-all select-text", ans.startsWith('Error') ? 'text-red-400 text-2xl' : 'text-glow-cyan text-white text-5xl font-bold')}>{ans || '0'}</div>
            </div>
          </div>

          {/* Memory Row */}
          <div className="flex items-center gap-2 p-2 bg-black/20 rounded-xl border border-white/5 w-full overflow-x-auto scrollbar-hide justify-between">
             <div className="flex gap-2">
               {['M1', 'M2', 'M3', 'M4', 'M5'].map(slot => (
                 <button 
                    key={slot}
                    onClick={() => setActiveSlot(slot)}
                    className={clsx("px-3 py-1 rounded-lg font-mono text-xs transition-colors", activeSlot === slot ? "bg-brand-violet/20 text-brand-violet border border-brand-violet/30" : "text-white/30 hover:bg-white/5 border border-transparent")}
                 >
                    {slot}
                 </button>
               ))}
             </div>
             <div className="flex gap-1 border-l border-white/10 pl-2">
                <button onClick={() => setMemories(p => ({...p, [activeSlot]: 0}))} className="px-3 py-1 font-mono text-xs text-red-400 hover:bg-red-400/10 rounded-lg">MC</button>
                <button onClick={() => {
                   if (currentMemVal !== 0) handlePress(currentMemVal.toString());
                }} className="px-3 py-1 font-mono text-xs text-white/50 hover:bg-white/5 rounded-lg">MR</button>
                <button onClick={() => {
                   try {
                     const val = parseFloat(ans.replace(/,/g, ''));
                     if (!isNaN(val)) setMemories(p => ({...p, [activeSlot]: p[activeSlot] + val}));
                   } catch {}
                }} className="px-3 py-1 font-mono text-xs text-white/50 hover:bg-white/5 rounded-lg">M+</button>
                <button onClick={() => {
                   try {
                     const val = parseFloat(ans.replace(/,/g, ''));
                     if (!isNaN(val)) setMemories(p => ({...p, [activeSlot]: p[activeSlot] - val}));
                   } catch {}
                }} className="px-3 py-1 font-mono text-xs text-white/50 hover:bg-white/5 rounded-lg">M-</button>
                <button onClick={() => {
                   try {
                     const val = parseFloat(ans.replace(/,/g, ''));
                     if (!isNaN(val)) setMemories(p => ({...p, [activeSlot]: val}));
                   } catch {}
                }} className="px-3 py-1 font-mono text-xs text-white/50 hover:bg-white/5 rounded-lg">MS</button>
             </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {NUMPAD_BUTTONS.map((btn, i) => (
              <button
                key={i}
                onClick={() => handlePress(btn.action)}
                className={clsx(
                  "h-14 sm:h-16 rounded-[1rem] font-mono text-lg sm:text-xl font-medium transition-all flex items-center justify-center active:scale-95",
                  btn.type === 'num' ? "glass-button text-white" : "",
                  btn.type === 'func' ? "glass-button text-cyan-400/80 bg-white/5 text-sm sm:text-lg" : "",
                  btn.type === 'op' ? "glass-button text-brand-violet text-xl sm:text-2xl font-bold bg-brand-violet/5" : "",
                  btn.type === 'ctrl' ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "",
                  btn.type === 'eq' ? "bg-cyan-500 text-black hover:bg-cyan-400 box-glow-cyan font-bold text-2xl sm:text-3xl" : ""
                )}
              >
                {btn.action === 'DEL' ? <Delete className="w-5 h-5" /> : 
                 btn.action === '=' ? <Equal className="w-6 h-6 sm:w-8 sm:h-8" /> : btn.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
           {(showHistory || showSettings || showMemory) && (
              <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="md:col-span-12 xl:col-span-3 h-full overflow-y-auto"
              >
                 {showSettings && (
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col gap-6">
                       <h3 className="font-mono text-cyan-400 tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                         <Settings2 className="w-4 h-4"/> Settings
                       </h3>
                       
                       <div className="flex flex-col gap-4">
                          <label className="flex flex-col gap-2">
                             <span className="font-mono text-xs text-white/50 uppercase tracking-widest">Precision ({precision})</span>
                             <input type="range" min="0" max="15" value={precision} onChange={e => setPrecision(parseInt(e.target.value))} className="w-full accent-cyan-400" />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer group">
                             <span className="font-mono text-sm text-white/70 group-hover:text-white transition-colors">Thousands Separator</span>
                             <input type="checkbox" checked={separators} onChange={e => setSeparators(e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer group">
                             <span className="font-mono text-sm text-white/70 group-hover:text-white transition-colors">Trailing Zeros</span>
                             <input type="checkbox" checked={trailingZeros} onChange={e => setTrailingZeros(e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                          </label>
                       </div>
                    </div>
                 )}

                 {showMemory && (
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col gap-6 mt-4 xl:mt-0">
                       <h3 className="font-mono text-brand-violet tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                         M Memory Bank
                       </h3>
                       <div className="flex flex-col gap-3">
                          {Object.entries(memories).map(([slot, val]) => (
                             <div key={slot} className={clsx("flex flex-col p-3 rounded-xl border transition-colors", activeSlot === slot ? "bg-brand-violet/10 border-brand-violet/30" : "bg-black/30 border-white/5 hover:border-brand-violet/30")}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-xs font-bold text-brand-violet">{slot}</span>
                                  <button onClick={() => setMemories(p => ({...p, [slot]: 0}))} className="text-white/20 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
                                </div>
                                <span className="font-mono text-white text-lg">{formatNumber(val, precision, separators, trailingZeros)}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {showHistory && (
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col gap-6 mt-4 xl:mt-0 max-h-[600px] overflow-hidden">
                       <div className="flex items-center justify-between">
                         <h3 className="font-mono text-cyan-400 tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                           <History className="w-4 h-4"/> Stack
                         </h3>
                         <button onClick={clearHistory} className="text-xs font-mono text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                           CLEAR ALL
                         </button>
                       </div>
                       
                       <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide">
                          {history.filter(h => h.mode === 'basic').length === 0 ? (
                             <p className="text-white/30 font-mono text-sm text-center py-8">No history yet</p>
                          ) : (
                             history.filter(h => h.mode === 'basic').map(item => (
                               <div key={item.id} className="relative group p-3 rounded-xl bg-black/30 border border-white/5 hover:border-cyan-500/30 transition-colors flex flex-col items-end gap-1 cursor-pointer"
                                     onClick={() => pushState(item.expression)}>
                                   <div className="w-full flex justify-between items-center text-[10px] text-white/30 font-mono">
                                     <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                     <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                                        <Trash2 className="w-3 h-3"/>
                                     </button>
                                   </div>
                                   <div className="font-mono text-white/50 text-sm break-all">{item.expression}</div>
                                   <div className="font-mono text-cyan-400 text-lg font-bold break-all">={item.result}</div>
                               </div>
                             ))
                          )}
                       </div>
                    </div>
                 )}
              </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}
