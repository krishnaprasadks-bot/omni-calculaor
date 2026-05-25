"use client";

import React, { useState } from 'react';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';

export default function ExpressionSolver() {
  const [expression, setExpression] = useState("(x+2)^3");
  const [result, setResult] = useState<string>("");
  const [activeTool, setActiveTool] = useState<string>("expand");

  const tools = [
    { id: "expand", label: "Expand", desc: "(x+2)³ → x³+6x²+12x+8", run: (e: string) => nerdamer(`expand(${e})`).text() },
    { id: "factor", label: "Factor", desc: "x²-4 → (x-2)(x+2)", run: (e: string) => nerdamer(`factor(${e})`).text() },
    { id: "simplify", label: "Simplify", desc: "2x+3x → 5x", run: (e: string) => nerdamer(e).text() },
    { id: "partfrac", label: "Partial Frac", desc: "Decompose rational", run: (e: string) => nerdamer(`partfrac(${e})`).text() },
  ];

  const handleRun = (toolId: string) => {
    setActiveTool(toolId);
    try {
      const tool = tools.find(t => t.id === toolId);
      if (tool) {
        setResult(tool.run(expression));
      }
    } catch(err: any) {
      setResult("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <label className="block text-sm font-medium mb-2 text-muted-foreground uppercase tracking-widest">
          Algebraic Expression
        </label>
        <input 
          type="text" 
          value={expression}
          onChange={e => setExpression(e.target.value)}
          placeholder="e.g. (x+2)^3"
          className="w-full bg-background border px-4 py-3 rounded-xl font-mono text-lg focus:ring-2 focus:ring-cyan-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-3">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleRun(tool.id)}
              className={`p-4 rounded-xl border text-left flex flex-col transition-all ${
                activeTool === tool.id 
                  ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500 text-cyan-400' 
                  : 'bg-muted/30 hover:bg-muted text-foreground'
              }`}
            >
              <span className="font-syne font-bold uppercase tracking-wider">{tool.label}</span>
              <span className="text-xs text-muted-foreground mt-1 font-mono">{tool.desc}</span>
            </button>
          ))}
        </div>

        <div className="bg-card p-6 rounded-2xl border flex flex-col">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Result</h3>
          <div className="flex-1 bg-background/50 border rounded-xl p-6 font-mono text-xl text-green-400 whitespace-pre-wrap flex items-center justify-center text-center overflow-auto break-all">
            {result || "Select a tool to evaluate"}
          </div>
        </div>
      </div>
    </div>
  );
}
