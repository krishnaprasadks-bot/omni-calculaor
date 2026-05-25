import { create } from 'zustand';
import * as math from 'mathjs';
import { useHistoryStore } from './historyStore';

interface CalculatorState {
  expression: string;
  result: string | null;
  memory: number;
  ans: string;
  angleMode: 'DEG' | 'RAD' | 'GRAD';
  setAngleMode: (mode: 'DEG' | 'RAD' | 'GRAD') => void;
  append: (val: string) => void;
  clear: () => void;
  clearEntry: () => void;
  deleteLast: () => void;
  evaluate: () => void;
  memoryAdd: () => void;
  memorySub: () => void;
  memoryRecall: () => void;
  memoryClear: () => void;
  memorySet: () => void;
}

const preprocessExpression = (expr: string, angleMode: 'DEG' | 'RAD' | 'GRAD', ans: string) => {
    let evalExp = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/ANS/g, ans);
    
    // Convert angle units for trig functions.
    // math.js defaults to radians. If DEG or GRAD, we can replace e.g., sin(x) with sin(x deg)
    // Actually, a safer way without AST parsing is to define custom functions or just let it be,
    // but a simple regex replacement for trig functions is tricky. 
    // Let's create a custom mathjs scope with overridden trig functions.
    return evalExp;
};

// Create a custom math instance or scope if needed. For now, we evaluate standardly.
// math.js allows overriding functions, but doing it globally can be messy. Let's use a scope with custom trig wrappers.
const createScope = (angleMode: 'DEG' | 'RAD' | 'GRAD') => {
  const toRad = (x: number) => {
    if (angleMode === 'DEG') return x * (Math.PI / 180);
    if (angleMode === 'GRAD') return x * (Math.PI / 200);
    return x;
  };
  const fromRad = (x: number) => {
    if (angleMode === 'DEG') return x * (180 / Math.PI);
    if (angleMode === 'GRAD') return x * (200 / Math.PI);
    return x;
  };

  return {
    // Override basic trig to accept current angle mode
    sin: (x: any) => math.sin(typeof x === 'number' ? toRad(x) : x),
    cos: (x: any) => math.cos(typeof x === 'number' ? toRad(x) : x),
    tan: (x: any) => math.tan(typeof x === 'number' ? toRad(x) : x),
    cot: (x: any) => math.cot(typeof x === 'number' ? toRad(x) : x),
    sec: (x: any) => math.sec(typeof x === 'number' ? toRad(x) : x),
    csc: (x: any) => math.csc(typeof x === 'number' ? toRad(x) : x),
    // Inverse functions output radians, convert them
    asin: (x: any) => fromRad(math.asin(x) as number),
    acos: (x: any) => fromRad(math.acos(x) as number),
    atan: (x: any) => fromRad(math.atan(x) as number),
    asec: (x: any) => fromRad(math.asec(x) as number),
    acsc: (x: any) => fromRad(math.acsc(x) as number),
    acot: (x: any) => fromRad(math.acot(x) as number),
    // Constants
    phi: 1.618033988749895, // Golden ratio
    gamma: 0.57721566490153286, // Euler-Mascheroni
    c: 299792458, // Speed of light m/s
    g: 9.80665, // gravity m/s^2
    hbar: 1.054571817e-34,
  };
};

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  expression: '',
  result: null,
  memory: 0,
  ans: '0',
  angleMode: 'DEG',
  setAngleMode: (mode) => set({ angleMode: mode }),
  append: (val) => set((state) => {
    let newExp = state.expression;
    if (state.result !== null && /[0-9.]/.test(val) && !['i', 'π', 'e'].includes(val)) {
        newExp = val;
    } else if (state.result !== null && /[\+\-\×\÷\%\^\!]/.test(val)) {
        newExp = state.result + val;
    } else {
        newExp = state.expression + val;
    }
    
    let liveResult = null;
    try {
      if (newExp) {
         let evalExp = preprocessExpression(newExp, state.angleMode, state.ans);
         if (!/[\+\-\*\/\^\(\%\!]$/.test(evalExp)) {
             const scope = createScope(state.angleMode);
             const res = math.evaluate(evalExp, scope);
             if (res !== undefined && typeof res !== 'function') {
               liveResult = math.format(res, { precision: 15 });
             }
         }
      }
    } catch {
      // ignore live evaluation errors
    }

    return { 
      expression: newExp, 
      result: null, 
    };
  }),
  clearEntry: () => set((state) => {
     const match = state.expression.match(/([a-zA-Z0-9.]+)(?!.*[a-zA-Z0-9.])$/);
     if (match) {
        return { expression: state.expression.slice(0, state.expression.length - match[0].length), result: null };
     }
     return { expression: '', result: null };
  }),
  clear: () => set({ expression: '', result: null }),
  deleteLast: () => set((state) => ({ expression: state.expression.slice(0, -1), result: null })),
  evaluate: () => set((state) => {
    try {
      if (!state.expression) return { result: null };
      let evalExp = preprocessExpression(state.expression, state.angleMode, state.ans);
      const scope = createScope(state.angleMode);
      const res = math.evaluate(evalExp, scope);
      const formattedRes = math.format(res, { precision: 15 });
      
      useHistoryStore.getState().addToHistory({
          expression: state.expression,
          result: String(formattedRes),
          type: 'general',
      });

      return { result: String(formattedRes), ans: String(formattedRes) };
    } catch {
      return { result: 'Error' };
    }
  }),
  memoryAdd: () => {
    const { expression, ans, angleMode } = get();
    try {
      const val = math.evaluate(preprocessExpression(expression, angleMode, ans), createScope(angleMode));
      set(state => ({ memory: state.memory + Number(val) }));
    } catch {}
  },
  memorySub: () => {
    const { expression, ans, angleMode } = get();
    try {
      const val = math.evaluate(preprocessExpression(expression, angleMode, ans), createScope(angleMode));
      set(state => ({ memory: state.memory - Number(val) }));
    } catch {}
  },
  memoryRecall: () => set(state => ({ expression: state.expression + state.memory, result: null })),
  memoryClear: () => set({ memory: 0 }),
  memorySet: () => {
    const { expression, ans, angleMode } = get();
    try {
      const val = math.evaluate(preprocessExpression(expression, angleMode, ans), createScope(angleMode));
      set({ memory: Number(val) });
    } catch {}
  }
}));
