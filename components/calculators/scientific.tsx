'use client';

import { useState, useCallback, useEffect } from 'react';
import * as mathjs from 'mathjs';
import { Delete, Equal } from 'lucide-react';
import { clsx } from 'clsx';
import { useCalc } from '@/components/calc-context';

const BUTTONS = [
  // Row 1
  { label: 'sin', action: 'sin(', type: 'func' },
  { label: 'cos', action: 'cos(', type: 'func' },
  { label: 'tan', action: 'tan(', type: 'func' },
  { label: 'DEL', action: 'DEL', type: 'ctrl' },
  { label: 'AC', action: 'AC', type: 'ctrl' },
  // Row 2
  { label: 'log', action: 'log10(', type: 'func' },
  { label: 'ln', action: 'log(', type: 'func' },
  { label: '(', action: '(', type: 'op' },
  { label: ')', action: ')', type: 'op' },
  { label: '÷', action: '/', type: 'op' },
  // Row 3
  { label: 'x²', action: '^2', type: 'func' },
  { label: '7', action: '7', type: 'num' },
  { label: '8', action: '8', type: 'num' },
  { label: '9', action: '9', type: 'num' },
  { label: '×', action: '*', type: 'op' },
  // Row 4
  { label: '√', action: 'sqrt(', type: 'func' },
  { label: '4', action: '4', type: 'num' },
  { label: '5', action: '5', type: 'num' },
  { label: '6', action: '6', type: 'num' },
  { label: '-', action: '-', type: 'op' },
  // Row 5
  { label: 'π', action: 'pi', type: 'num' },
  { label: '1', action: '1', type: 'num' },
  { label: '2', action: '2', type: 'num' },
  { label: '3', action: '3', type: 'num' },
  { label: '+', action: '+', type: 'op' },
  // Row 6
  { label: 'e', action: 'e', type: 'num' },
  { label: '0', action: '0', type: 'num' },
  { label: '.', action: '.', type: 'num' },
  { label: 'EXP', action: 'E', type: 'func' },
  { label: '=', action: '=', type: 'eq' },
];

export function ScientificCalc() {
  const [expr, setExpr] = useState('');
  const [ans, setAns] = useState('');
  const { addToHistory } = useCalc();

  const handlePress = useCallback((btn: { label: string; action: string; type: string }) => {
    if (btn.action === 'AC') {
      setExpr('');
      setAns('');
      return;
    }
    
    if (btn.action === 'DEL') {
      setExpr(prev => prev.slice(0, -1));
      return;
    }

    if (btn.action === '=') {
      try {
        if (!expr.trim()) return;
        const result = mathjs.evaluate(expr);
        const formatResult = typeof result === 'number' ? mathjs.format(result, { precision: 14 }) : String(result);
        setAns(formatResult);
        addToHistory({ mode: 'scientific', expression: expr, result: formatResult });
      } catch (err) {
        setAns('Error');
      }
      return;
    }

    setExpr(prev => prev + btn.action);
  }, [expr, addToHistory]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const keyMap: Record<string, string> = {
      'Enter': '=', '=': '=', 'Backspace': 'DEL', 'Escape': 'AC',
      '+': '+', '-': '-', '*': '*', '/': '/',
      '(': '(', ')': ')', '^': '^2', 'p': 'pi',
    };
    if (/[0-9.]/.test(e.key)) {
      handlePress({ label: e.key, action: e.key, type: 'num' });
    } else if (keyMap[e.key]) {
      handlePress({ label: e.key, action: keyMap[e.key], type: 'op' });
    }
  }, [handlePress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-full items-center justify-center py-4 w-full">
      <div className="glass-panel p-6 rounded-[2rem] w-full max-w-sm border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col gap-6">
        
        {/* Display */}
        <div className="bg-black/40 rounded-2xl p-4 flex flex-col items-end gap-2 border border-white/5 shadow-inner min-h-[120px] justify-end relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/5 to-transparent pointer-events-none opacity-50" />
          <div className="font-mono text-white/50 text-xl tracking-wider w-full text-right overflow-x-auto whitespace-nowrap scrollbar-hide">{expr || '0'}</div>
          <div className={clsx("font-mono text-4xl tracking-widest text-glow-cyan w-full text-right overflow-x-auto whitespace-nowrap scrollbar-hide transition-all", ans === 'Error' ? 'text-red-400' : 'text-white')}>{ans || ''}</div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-5 gap-3">
          {BUTTONS.map((btn, i) => (
            <button
              key={i}
              onClick={() => handlePress(btn)}
              className={clsx(
                "h-14 rounded-xl font-mono text-sm font-medium transition-all flex items-center justify-center active:scale-95",
                btn.type === 'num' ? "glass-button text-white text-lg" : "",
                btn.type === 'func' ? "glass-button text-brand-cyan/80 bg-white/5" : "",
                btn.type === 'op' ? "glass-button text-brand-violet text-lg" : "",
                btn.type === 'ctrl' ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "",
                btn.type === 'eq' ? "bg-brand-cyan text-black text-xl hover:bg-brand-cyan/80 box-glow-cyan font-bold" : ""
              )}
            >
              {btn.action === 'DEL' ? <Delete className="w-5 h-5" /> : 
               btn.action === '=' ? <Equal className="w-6 h-6" /> : btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
