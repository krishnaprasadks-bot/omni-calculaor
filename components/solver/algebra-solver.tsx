"use client";

import React, { useState, useMemo } from 'react';
const mathsteps = require('mathsteps');

export default function AlgebraSolver() {
  const [equation, setEquation] = useState("2x + 3x = 35");

  const steps = useMemo(() => {
    if (!equation) return [];
    try {
      if (equation.includes('=')) {
        return mathsteps.solveEquation(equation);
      } else {
        return mathsteps.simplifyExpression(equation);
      }
    } catch(e) {
      return [];
    }
  }, [equation]);

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <label className="block text-sm font-medium mb-2 text-muted-foreground uppercase tracking-widest">
          Algebra Equation / Expression
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={equation}
            onChange={e => setEquation(e.target.value)}
            placeholder="e.g. 2x + 3x = 35 or 3(x + 2) = 18"
            className="w-full bg-background border px-4 py-3 rounded-xl font-mono text-lg focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border min-h-[300px]">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Step-by-Step Solution</h3>
        
        {steps.length > 0 ? (
          <div className="space-y-4">
            {steps.map((step: any, idx: number) => {
              const ruleName = step.changeType ? step.changeType.replace(/_/g, ' ') : "Simplify";
              const isEquation = !!step.oldEquation;
              const oldStr = isEquation 
                  ? `${step.oldEquation.leftNode.toString()} = ${step.oldEquation.rightNode.toString()}`
                  : step.oldNode.toString();
              const newStr = isEquation 
                  ? `${step.newEquation.leftNode.toString()} = ${step.newEquation.rightNode.toString()}`
                  : step.newNode.toString();

              return (
                <div key={idx} className="flex flex-col gap-2 p-4 bg-muted/20 border rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{ruleName}</span>
                  </div>
                  <div className="pl-8 font-mono text-lg flex flex-wrap gap-2 items-center">
                    <span className="text-muted-foreground">{oldStr}</span>
                    <span className="text-cyan-400">→</span>
                    <span className="text-green-400 font-bold">{newStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground font-mono text-center py-8">
            {equation ? "No steps could be generated. The problem might be too complex or invalid." : "Enter an equation to see steps"}
          </div>
        )}
      </div>
    </div>
  );
}
