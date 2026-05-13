'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Type, Spline, Plus, Trash2 } from 'lucide-react';
import * as mathjs from 'mathjs';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center glass-panel rounded-2xl"><div className="animate-spin w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full" /></div> });

export function GraphingCalc() {
  const [equations, setEquations] = useState([{ id: 1, expr: 'sin(x)', color: '#00d4ff' }]);
  const [xRange, setXRange] = useState([-10, 10]);

  const generateData = (expr: string, color: string) => {
    try {
      const node = mathjs.parse(expr);
      const code = node.compile();
      const xObj = mathjs.range(xRange[0], xRange[1], (xRange[1] - xRange[0])/200, true).toArray() as number[];
      const yObj = xObj.map(x => {
        try {
          return code.evaluate({ x });
        } catch(e) { return null; }
      });
      return {
        x: xObj, y: yObj, type: 'scatter', mode: 'lines', line: { color, width: 3, shape: 'spline' }, name: expr
      };
    } catch(e) {
      return null;
    }
  };

  const plotData = useMemo(() => equations.map(eq => generateData(eq.expr, eq.color)).filter(Boolean), [equations, xRange]);

  const addEquation = () => {
    const colors = ['#00d4ff', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];
    setEquations([...equations, { id: Date.now(), expr: '', color: colors[equations.length % colors.length] }]);
  };

  const updateEquation = (id: number, val: string) => {
    setEquations(equations.map(eq => eq.id === id ? { ...eq, expr: val } : eq));
  };
  
  const removeEquation = (id: number) => setEquations(equations.filter(eq => eq.id !== id));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 py-4 w-full">
      {/* Sidebar: Equation List */}
      <div className="w-full md:w-80 glass-panel rounded-2xl p-4 flex flex-col gap-4 border border-white/10 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h3 className="font-serif text-lg font-bold flex items-center gap-2"><Spline className="w-5 h-5 text-brand-cyan" /> Equations</h3>
          <button onClick={addEquation} className="p-1.5 glass-button rounded-lg text-white hover:text-brand-cyan"><Plus className="w-4 h-4" /></button>
        </div>
        
        <div className="flex flex-col gap-3">
          {equations.map((eq, i) => (
            <div key={eq.id} className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: eq.color, boxShadow: `0 0 10px ${eq.color}` }} />
              <input 
                type="text"
                value={eq.expr}
                onChange={(e) => updateEquation(eq.id, e.target.value)}
                placeholder="e.g. x^2"
                className="w-full bg-black/30 border border-white/5 rounded-xl pl-8 pr-10 py-3 text-white font-mono text-sm outline-none focus:border-white/20 transition-colors"
                spellCheck={false}
              />
              <button onClick={() => removeEquation(eq.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/10 overflow-hidden relative min-h-[400px]">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            margin: { l: 40, r: 20, t: 30, b: 40 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            xaxis: { gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', range: xRange },
            yaxis: { gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' },
            showlegend: false,
            font: { family: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false, scrollZoom: true }}
          onRelayout={(e: any) => {
             if (e['xaxis.range[0]'] && e['xaxis.range[1]']) {
                setXRange([e['xaxis.range[0]'], e['xaxis.range[1]']]);
             }
          }}
        />
      </div>
    </div>
  );
}
