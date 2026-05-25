"use client";

import React, { useState, useMemo } from 'react';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function PolynomialSolver() {
  const [equation, setEquation] = useState("x^2 - 5x + 6");

  const { roots, factored, degree, plotData } = useMemo(() => {
    if (!equation) return { roots: [], factored: "", degree: 0, plotData: null };
    try {
      // Normalize equation to expression (if it has =0)
      let exprStr = equation.trim();
      if (exprStr.includes('=')) {
        const parts = exprStr.split('=');
        exprStr = `(${parts[0]}) - (${parts[1]})`;
      }

      const parsed = nerdamer(exprStr);
      
      const rootsResult = nerdamer(`solve(${exprStr}, x)`).text(); 
      // rootsResult looks like [2,3] or [(1/6)*sqrt(13)-5/6,...]
      const rootsArrStr = rootsResult.slice(1, -1).split(',').filter(x => x.trim().length > 0);
      
      const factoredStr = nerdamer(`factor(${exprStr})`).text();
      // degree rough estimation
      const expanded = nerdamer(`expand(${exprStr})`);
      const degreeStr = nerdamer(`deg(${expanded.text()}, x)`).text();
      const deg = parseInt(degreeStr, 10) || 0;

      // Gen plot data
      const xVals = [];
      const yVals = [];
      const f = parsed.buildFunction(['x']);
      for (let x = -10; x <= 10; x += 0.2) {
        xVals.push(x);
        yVals.push(f(x));
      }
      
      // Attempt numerical evaluate of roots for marking
      const rootX = [];
      const rootY = [];
      rootsArrStr.forEach(r => {
        try {
          const val = Number(nerdamer(r).evaluate().text());
          if (!isNaN(val)) {
            rootX.push(val);
            rootY.push(0);
          }
        } catch(e) {}
      });

      const plotData = [
        {
          x: xVals,
          y: yVals,
          type: 'scatter',
          mode: 'lines',
          name: 'f(x)',
          line: { color: '#06b6d4', width: 2 } 
        },
        {
          x: rootX,
          y: rootY,
          type: 'scatter',
          mode: 'markers',
          name: 'Roots',
          marker: { color: '#ef4444', size: 8 }
        }
      ];

      return { roots: rootsArrStr, factored: factoredStr, degree: deg, plotData };
    } catch(err) {
      return { roots: [], factored: "", degree: 0, plotData: null };
    }
  }, [equation]);

  const typeName = degree === 1 ? "Linear" : degree === 2 ? "Quadratic" : degree === 3 ? "Cubic" : degree === 4 ? "Quartic" : "Polynomial (Degree " + degree + ")";

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <label className="block text-sm font-medium mb-2 text-muted-foreground uppercase tracking-widest">
          Polynomial Expression / Equation
        </label>
        <input 
          type="text" 
          value={equation}
          onChange={e => setEquation(e.target.value)}
          placeholder="e.g. x^2 - 5x + 6 or x^3 = x + 1"
          className="w-full bg-background border px-4 py-3 rounded-xl font-mono text-lg focus:ring-2 focus:ring-cyan-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-2xl border space-y-4">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Type</h3>
            <div className="font-syne font-bold text-lg">{equation ? typeName : "-"}</div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Factored Form</h3>
            <div className="font-mono text-cyan-400 bg-muted/30 p-2 rounded">{factored || "-"}</div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Roots</h3>
            {roots.length > 0 ? (
              <ul className="list-disc pl-5 font-mono space-y-1">
                {roots.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            ) : <div className="text-muted-foreground">No roots found or parsing failed</div>}
          </div>
          {degree === 2 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Quadratic Properties</h3>
              <p className="text-sm text-muted-foreground">Solved via quadratic formula. See factored form or roots for details.</p>
            </div>
          )}
        </div>

        <div className="bg-card p-4 rounded-2xl border flex items-center justify-center min-h-[300px]">
          {plotData ? (
            <Plot
              data={plotData as any}
              layout={{
                margin: { t: 20, l: 40, r: 20, b: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { gridcolor: '#333', zerolinecolor: '#666' },
                yaxis: { gridcolor: '#333', zerolinecolor: '#666' },
                font: { color: '#aaa', family: 'var(--font-mono)' },
                showlegend: false
              }}
              config={{ responsive: true, displayModeBar: false }}
              className="w-full h-full"
            />
          ) : (
             <div className="text-muted-foreground font-mono text-sm">Enter a valid polynomial to view graph</div>
          )}
        </div>
      </div>
    </div>
  );
}
