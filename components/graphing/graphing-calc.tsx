"use client";

import { useState, useMemo } from "react";
import { Download, Table as TableIcon, Plus, Trash2, Settings2, BarChart2 } from "lucide-react";
import { compile } from "mathjs";
import PlotWrapper from "./plot-wrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type PlotMode = "2D" | "Polar" | "3D";
const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

type Formula = {
  id: string;
  expr: string;
  color: string;
  visible: boolean;
};

export function GraphingCalc() {
  const [mode, setMode] = useState<PlotMode>("2D");
  const [formulas, setFormulas] = useState<Formula[]>([
    { id: '1', expr: 'sin(x)', color: COLORS[0], visible: true },
    { id: '2', expr: 'cos(x)', color: COLORS[1], visible: true }
  ]);
  
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [steps, setSteps] = useState(250);

  const [polarMin, setPolarMin] = useState(0);
  const [polarMax, setPolarMax] = useState(2 * Math.PI);

  const [activeTab, setActiveTab] = useState("graph");

  // Compile formulas and generate Data points
  const plotData = useMemo(() => {
    const sanitize = (expr: string) => expr.replace(/^([a-zA-Z0-9_().,\s]+=\s*)/, '');
    try {
      if (mode === "2D") {
        const xValues: number[] = [];
        const step = (xMax - xMin) / steps;
        for (let x = xMin; x <= xMax + 0.000001; x += step) {
          xValues.push(x);
        }

        return formulas.filter(f => f.visible && f.expr.trim()).map(f => {
          try {
            const cleanExpr = sanitize(f.expr);
            const compiled = compile(cleanExpr);
            const yValues = xValues.map(x => {
              try { 
                const res = compiled.evaluate({ x }); 
                if (typeof res === 'number' && isFinite(res) && Math.abs(res) < 1e6) {
                  return res;
                }
                return null;
              } catch { 
                return null; 
              }
            });
            // If all yValues are null, plotting will result in an empty trace
            return {
              x: xValues,
              y: yValues,
              type: 'scatter',
              mode: 'lines',
              name: sanitize(f.expr),
              line: { color: f.color, width: 2.5 },
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      } else if (mode === "Polar") {
        const thetaValues: number[] = [];
        const step = (polarMax - polarMin) / steps;
        for (let t = polarMin; t <= polarMax + 0.000001; t += step) {
          thetaValues.push(t);
        }

        return formulas.filter(f => f.visible && f.expr.trim()).map(f => {
           try {
            const cleanExpr = sanitize(f.expr);
            const compiled = compile(cleanExpr);
            const rValues = thetaValues.map(t => {
              try { return compiled.evaluate({ t, theta: t }); } catch { return null; }
            });
            // Convert theta from radians to degrees for Plotly polar chart
            return {
              type: 'scatterpolar',
              mode: 'lines',
              r: rValues,
              theta: thetaValues.map(t => t * 180 / Math.PI),
              name: sanitize(f.expr),
              line: { color: f.color, width: 2.5 },
            };
           } catch {
             return null;
           }
        }).filter(Boolean);
      } else if (mode === "3D") {
        const size = Math.floor(Math.sqrt(steps * 4)); // e.g. steps=250 -> ~31x31 grid
        const xVals: number[] = [];
        const yVals: number[] = [];
        const xStep = (xMax - xMin) / size;
        const yStep = (yMax - yMin) / size;
        
        for (let x = xMin; x <= xMax + 0.0001; x += xStep) xVals.push(x);
        for (let y = yMin; y <= yMax + 0.0001; y += yStep) yVals.push(y);

        return formulas.filter(f => f.visible && f.expr.trim()).slice(0, 1).map(f => { 
           try {
            const cleanExpr = sanitize(f.expr);
            const compiled = compile(cleanExpr);
            const zVals = yVals.map(y => {
              return xVals.map(x => {
                try { return compiled.evaluate({ x, y }); } catch { return null; }
              })
            });
            return {
              type: 'surface',
              x: xVals,
              y: yVals,
              z: zVals,
              name: sanitize(f.expr),
              colorscale: 'Viridis',
              showscale: false, // hide the colorbar for cleaner UI
            };
           } catch {
             return null;
           }
        }).filter(Boolean);
      }
    } catch {
      return [];
    }
    return [];
  }, [formulas, mode, xMin, xMax, yMin, yMax, polarMin, polarMax, steps]);

  const addFormula = () => {
    if (formulas.length >= 6) return;
    const newId = Math.random().toString(36).substr(2, 9);
    setFormulas([...formulas, { id: newId, expr: '', color: COLORS[formulas.length], visible: true }]);
  };

  const removeFormula = (id: string) => {
    setFormulas(formulas.filter(f => f.id !== id).map((f, i) => ({ ...f, color: COLORS[i] })));
  };

  const updateFormula = (id: string, expr: string) => {
    setFormulas(formulas.map(f => f.id === id ? { ...f, expr } : f));
  };
  
  const toggleVisibility = (id: string) => {
    setFormulas(formulas.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  // Generate Table Values
  const tableData = useMemo(() => {
    if (mode === "3D") return [];
    
    const xValues: number[] = [];
    const stepScale = mode === "Polar" ? (polarMax - polarMin) / 20 : (xMax - xMin) / 20;
    const start = mode === "Polar" ? polarMin : xMin;
    const end = mode === "Polar" ? polarMax : xMax;
    
    for (let current = start; current <= end + 0.00001; current += Math.max(stepScale, 0.1)) {
      xValues.push(Number(current.toFixed(4)));
    }

    const sanitize = (expr: string) => expr.replace(/^([a-zA-Z0-9_().,\s]+=\s*)/, '');

    return xValues.map(val => {
      const row: any = { input: val };
      formulas.forEach((f, i) => {
        if (!f.expr.trim() || !f.visible) return;
        try {
           const cleanExpr = sanitize(f.expr);
           const compiled = compile(cleanExpr);
           const result = compiled.evaluate(mode === "Polar" ? { t: val, theta: val } : { x: val });
           row[`f${i+1}`] = typeof result === 'number' ? Number(result.toFixed(4)) : null;
        } catch {
           row[`f${i+1}`] = 'Error';
        }
      });
      return row;
    });
  }, [formulas, mode, xMin, xMax, polarMin, polarMax]);

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
      
      {/* Side Panel for Equations */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 lg:gap-6">
        
        {/* Mode Selector */}
        <div className="bg-card border rounded-3xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
             <BarChart2 className="w-4 h-4 text-primary" />
             <h2 className="font-semibold text-sm">Graph Mode</h2>
          </div>
          <div className="flex bg-muted p-1 rounded-xl">
             <button onClick={() => setMode("2D")} className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all ${mode === "2D" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>2D</button>
             <button onClick={() => setMode("Polar")} className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all ${mode === "Polar" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>Polar</button>
             <button onClick={() => setMode("3D")} className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all ${mode === "3D" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>3D</button>
          </div>
        </div>

        {/* Functions List */}
        <div className="bg-card border rounded-3xl p-4 shadow-sm flex flex-col gap-3 flex-1 min-h-[250px] lg:overflow-y-auto">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold text-sm flex items-center gap-2">Equations {mode === "3D" && <span className="text-xs text-muted-foreground font-normal">(Max 1 for 3D)</span>}</h2>
            {formulas.length < 6 && mode !== "3D" && (
              <button onClick={addFormula} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {(mode === "3D" ? formulas.slice(0, 1) : formulas).map((f, i) => (
               <div key={f.id} className="flex flex-col gap-1.5 group">
                  <div className="flex items-center gap-2">
                    <button 
                       onClick={() => toggleVisibility(f.id)} 
                       className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all"
                       style={{ 
                         borderColor: f.visible ? f.color : 'hsl(var(--muted-foreground)/0.3)', 
                         backgroundColor: f.visible ? `${f.color}20` : 'transparent' 
                       }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full transition-all" style={{ backgroundColor: f.visible ? f.color : 'transparent' }} />
                    </button>
                    <div className="font-mono text-sm text-muted-foreground shrink-0 w-10 capitalize">
                       {mode === "Polar" ? `r${i+1}(t)=` : mode === "3D" ? `z(x,y)=` : `f${i+1}(x)=`}
                    </div>
                    <input 
                      type="text"
                      className="flex-1 bg-muted/50 border-0 rounded-xl px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      value={f.expr}
                      onChange={(e) => updateFormula(f.id, e.target.value)}
                      placeholder={mode === "Polar" ? "sin(3*t)" : mode === "3D" ? "sin(x)*cos(y)" : "x^2"}
                    />
                    <button onClick={() => removeFormula(f.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all w-6 h-6 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            ))}
          </div>
        </div>

        {/* View Settings */}
        <div className="bg-card border rounded-3xl p-4 shadow-sm">
           <h2 className="font-semibold mb-3 text-sm flex items-center gap-2"><Settings2 className="w-4 h-4 text-muted-foreground"/> Viewport</h2>
           <div className="grid grid-cols-2 gap-3">
              {mode !== "Polar" ? (
                 <>
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold px-1">X Min</label>
                     <input type="number" value={xMin} onChange={e => setXMin(Number(e.target.value))} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono"/>
                   </div>
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold px-1">X Max</label>
                     <input type="number" value={xMax} onChange={e => setXMax(Number(e.target.value))} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono"/>
                   </div>
                   {mode === "2D" || mode === "3D" ? (
                     <>
                       <div className="flex flex-col gap-1 mt-1">
                         <label className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold px-1">Y Min</label>
                         <input type="number" value={yMin} onChange={e => setYMin(Number(e.target.value))} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono"/>
                       </div>
                       <div className="flex flex-col gap-1 mt-1">
                         <label className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold px-1">Y Max</label>
                         <input type="number" value={yMax} onChange={e => setYMax(Number(e.target.value))} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono"/>
                       </div>
                     </>
                   ) : null}
                 </>
              ) : (
                 <>
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold px-1">θ Min</label>
                     <input type="number" value={polarMin} onChange={e => setPolarMin(Number(e.target.value))} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono"/>
                   </div>
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold px-1">θ Max</label>
                     <input type="number" value={polarMax} onChange={e => setPolarMax(Number(e.target.value))} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono"/>
                   </div>
                 </>
              )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-card border rounded-3xl min-h-[500px] h-full flex flex-col shadow-sm overflow-hidden relative ring-1 ring-border/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-col flex h-full">
           <div className="border-b px-2 py-2 flex items-center justify-between bg-muted/20">
             <TabsList className="bg-background border gap-1 p-1 rounded-xl">
               <TabsTrigger value="graph" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 flex items-center gap-1.5">
                   <BarChart2 className="w-3.5 h-3.5"/> Graph
               </TabsTrigger>
               <TabsTrigger value="table" className="text-xs rounded-lg px-4 flex items-center gap-1.5">
                   <TableIcon className="w-3.5 h-3.5"/> Table
               </TabsTrigger>
             </TabsList>
             
             {activeTab === 'table' && (
               <button 
                 onClick={() => {
                   const headers = ['x', ...formulas.filter(f => f.visible && f.expr).map((_, i) => `f${i+1}`)].join(',');
                   const rows = tableData.map(row => Object.values(row).join(',')).join('\n');
                   const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = 'table_of_values.csv';
                   a.click();
                 }}
                 className="flex items-center gap-1.5 text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors font-medium border mr-2"
               >
                 <Download className="w-3.5 h-3.5" /> Export Data
               </button>
             )}
           </div>

           <TabsContent value="graph" className="flex-1 m-0 p-0 w-full h-full data-[state=active]:flex flex-col relative">
              <div className="flex-1 w-full h-full min-h-[400px] p-1 sm:p-2 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50 rounded-b-3xl overflow-hidden">
                 {(plotData as any[]).length > 0 ? (
                   <PlotWrapper
                     data={plotData as any}
                     layout={{
                       autosize: true,
                       margin: { l: 30, r: 20, t: 30, b: 30 },
                       paper_bgcolor: 'transparent',
                       plot_bgcolor: 'transparent',
                       font: { family: 'inherit', color: 'inherit' },
                       hovermode: 'closest',
                       xaxis: mode === "2D" ? { title: { text: '' }, range: [xMin, xMax], gridcolor: 'rgba(128,128,128,0.15)', zerolinecolor: 'rgba(128,128,128,0.6)' } : undefined,
                       yaxis: mode === "2D" ? { title: { text: '' }, range: [yMin, yMax], gridcolor: 'rgba(128,128,128,0.15)', zerolinecolor: 'rgba(128,128,128,0.6)' } : undefined,
                       polar: mode === "Polar" ? {
                         angularaxis: { tickfont: { size: 10 }, rotation: 0, direction: "counterclockwise" },
                         radialaxis: { angle: 45 },
                         bgcolor: "transparent"
                       } as any : undefined,
                       scene: mode === "3D" ? {
                         xaxis: { title: { text: 'X' } },
                         yaxis: { title: { text: 'Y' } },
                         zaxis: { title: { text: 'Z' } }
                       } as any : undefined,
                     }}
                     config={{ responsive: true, displayModeBar: true, displaylogo: false, scrollZoom: true }}
                     style={{ width: "100%", height: "100%", minHeight: "400px" }}
                     useResizeHandler={true}
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col gap-3 opacity-50 select-none">
                     <span className="text-6xl font-extralight tracking-tighter">f(x)</span>
                     <p className="text-sm font-medium">Enter a valid function to graph</p>
                   </div>
                 )}
              </div>
           </TabsContent>

           <TabsContent value="table" className="flex-1 m-0 overflow-auto bg-background rounded-b-3xl">
             <table className="w-full text-sm text-left font-mono">
                <thead className="text-xs uppercase bg-muted/50 sticky top-0 backdrop-blur-sm z-10 shadow-sm border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">{mode === "Polar" ? "θ / t" : "x"}</th>
                    {formulas.filter(f => f.visible && f.expr).map((f, i) => (
                      <th key={i} className="px-6 py-4 font-semibold" style={{ color: f.color }}>
                        {mode === "Polar" ? `r${i+1}` : `f${i+1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 font-semibold text-muted-foreground/80">{row.input}</td>
                      {formulas.filter(f => f.visible && f.expr).map((_, i) => (
                        <td key={i} className={`px-6 py-3 ${row[`f${i+1}`] === 'Error' ? 'text-destructive/50 italic text-xs' : 'text-foreground'}`}>
                          {row[`f${i+1}`] !== null ? row[`f${i+1}`] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {tableData.length === 0 && (
                     <tr>
                       <td colSpan={10} className="text-center py-12 text-muted-foreground opacity-50">No data</td>
                     </tr>
                  )}
                </tbody>
             </table>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
