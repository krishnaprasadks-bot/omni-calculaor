"use client";

import React, { useState } from 'react';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Solve';

export default function SystemSolver() {
  const [equations, setEquations] = useState(['x + y = 5', 'x - y = 1']);
  const [solution, setSolution] = useState<string | null>(null);

  const handleSolve = () => {
    try {
      const validEqs = equations.filter(e => e.trim().length > 0);
      if (validEqs.length === 0) return setSolution("Please enter equations.");
      
      const sol = nerdamer.solveEquations(validEqs);
      
      if (!sol || sol.length === 0) {
        setSolution("No solution found or infinite solutions.");
        return;
      }

      const formatted = sol.map((res: any) => `${res[0]} = ${res[1]}`).join('\n');
      setSolution(formatted);
    } catch(err: any) {
      setSolution("Error solving system: " + err.message);
    }
  };

  const addEq = () => setEquations([...equations, '']);
  const removeEq = (idx: number) => {
    const newEqs = [...equations];
    newEqs.splice(idx, 1);
    setEquations(newEqs);
  };
  const updateEq = (idx: number, val: string) => {
    const newEqs = [...equations];
    newEqs[idx] = val;
    setEquations(newEqs);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-muted-foreground uppercase tracking-widest">
            System of Equations
          </label>
          <button 
            onClick={addEq}
            className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded-full font-bold transition-colors"
          >
            + ADD EQUATION
          </button>
        </div>

        <div className="space-y-3">
          {equations.map((eq, i) => (
            <div key={i} className="flex gap-2">
              <span className="bg-muted px-3 py-3 rounded-xl font-mono text-muted-foreground flex items-center shrink-0">
                E{i + 1}
              </span>
              <input 
                type="text" 
                value={eq}
                onChange={e => updateEq(i, e.target.value)}
                placeholder="e.g. 2x - y = 4"
                className="w-full bg-background border px-4 py-3 rounded-xl font-mono text-lg focus:ring-2 focus:ring-cyan-500 outline-none"
              />
              <button 
                onClick={() => removeEq(i)}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-3 rounded-xl"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSolve}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-syne font-bold py-4 rounded-xl mt-4 transition-colors tracking-wider"
        >
          SOLVE SYSTEM
        </button>
      </div>

      <div className="bg-card p-6 rounded-2xl border flex flex-col">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Solution</h3>
        <div className="flex-1 bg-background/50 border rounded-xl p-6 font-mono text-xl text-cyan-400 whitespace-pre-wrap flex items-center justify-center text-center">
          {solution || "Enter equations and click Solve"}
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Uses algebraic substitution and elimination via matrix solver under the hood. Supports variables beyond x and y.
        </div>
      </div>
    </div>
  );
}
