'use client';

import { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, FlaskConical, Dna, Variable, ChevronDown, Info } from 'lucide-react';
import { clsx } from 'clsx';
import * as mathjs from 'mathjs';
import dynamic from 'next/dynamic';
// @ts-ignore
import { jStat } from 'jstat';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div className="animate-pulse w-full h-[300px] bg-white/5 rounded-2xl border border-white/10" /> });

const TABS = [
  { id: 'descriptive', icon: BarChart2, label: 'Descriptive' },
  { id: 'distributions', icon: Variable, label: 'Distributions' },
  { id: 'hypothesis', icon: FlaskConical, label: 'Hypothesis' },
  { id: 'regression', icon: TrendingUp, label: 'Regression' },
  { id: 'combinatorics', icon: Dna, label: 'Probability' }
] as const;

export function StatisticsCalc() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('descriptive');
  
  // Descriptive State
  const [datasetText, setDatasetText] = useState('10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 25, 35, 45, 55, 65');
  
  // Distributions State
  const [distType, setDistType] = useState('normal');
  const [distParams, setDistParams] = useState({ mean: 0, std: 1, df: 10, lambda: 5, n: 10, p: 0.5 });
  
  // Hypothesis State
  const [hypTestType, setHypTestType] = useState('t-test-1');
  const [hypData1, setHypData1] = useState('12, 14, 15, 13, 11, 16');
  const [hypData2, setHypData2] = useState('18, 17, 19, 15, 16, 20');
  const [hypPopMean, setHypPopMean] = useState('10');

  // Regression State
  const [regDataX, setRegDataX] = useState('1, 2, 3, 4, 5, 6, 7');
  const [regDataY, setRegDataY] = useState('2, 3.5, 5.1, 7.8, 10, 11.5, 14.1');

  // Combinatorics State
  const [combN, setCombN] = useState('10');
  const [combR, setCombR] = useState('3');

  // --- Calculations for Descriptive ---
  const parsedData = useMemo(() => {
     return datasetText.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  }, [datasetText]);

  const descriptiveStats = useMemo(() => {
     if (parsedData.length === 0) return null;
     const n = parsedData.length;
     const sum = mathjs.sum(parsedData);
     const mean = sum / n;
     const median = Number(mathjs.median(parsedData));
     // Handle mode being an array or single value
     const modeRaw = mathjs.mode(parsedData);
     const mode = Array.isArray(modeRaw) ? modeRaw.join(', ') : modeRaw;
     
     const variancePop = jStat.variance(parsedData, true);
     const varianceSamp = jStat.variance(parsedData, false);
     const stdPop = jStat.stdev(parsedData, true);
     const stdSamp = jStat.stdev(parsedData, false);
     const min = mathjs.min(parsedData);
     const max = mathjs.max(parsedData);
     const range = max - min;
     
     const q1 = jStat.percentile(parsedData, 0.25);
     const q2 = median;
     const q3 = jStat.percentile(parsedData, 0.75);
     const iqr = q3 - q1;

     const skewness = jStat.skewness(parsedData);
     const kurtosis = jStat.kurtosis(parsedData);

     return { n, sum, mean, median, mode, variancePop, varianceSamp, stdPop, stdSamp, min, max, range, q1, q2, q3, iqr, skewness, kurtosis };
  }, [parsedData]);

  // --- Calculations for Combinatorics ---
  const combinatoricsRes = useMemo(() => {
     const n = parseInt(combN);
     const r = parseInt(combR);
     if (isNaN(n) || isNaN(r) || n < 0 || r < 0 || r > n) return null;
     
     try {
       const permutations = mathjs.permutations(n, r);
       const combinations = mathjs.combinations(n, r);
       return { permutations, combinations };
     } catch(e) { return null; }
  }, [combN, combR]);

  // --- Calculations for Regression ---
  const regressionResults = useMemo(() => {
     const x = regDataX.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
     const y = regDataY.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
     if (x.length === 0 || y.length === 0 || x.length !== y.length) return null;

     const n = x.length;
     const sumX = mathjs.sum(x);
     const sumY = mathjs.sum(y);
     const sumXY = mathjs.sum(x.map((xi, i) => xi * y[i]));
     const sumX2 = mathjs.sum(x.map(xi => xi * xi));

     const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
     const intercept = (sumY - slope * sumX) / n;
     
     const pearson = jStat.corrcoeff(x, y);
     const r2 = pearson * pearson;

     // Calculate points for regression line
     const minX = mathjs.min(x);
     const maxX = mathjs.max(x);
     const lineX = [minX, maxX];
     const lineY = lineX.map(xi => slope * xi + intercept);

     return { x, y, slope, intercept, pearson, r2, lineX, lineY };
  }, [regDataX, regDataY]);

  // --- Render Subsections ---

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-2 w-full gap-4">
       
       {/* Tabs Navigation */}
       <div className="flex flex-wrap bg-white/5 p-1 rounded-2xl glass-panel w-fit gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={clsx(
                   "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                   isActive ? "bg-white/10 text-brand-cyan shadow-sm" : "text-white/50 hover:text-white/80"
                 )}
               >
                 <Icon className="w-4 h-4" />
                 {tab.label}
               </button>
             )
          })}
       </div>

       {/* Content Area */}
       <div className="flex-1 overflow-y-auto w-full pb-10">
          
          {/* DESCRIPTIVE STATISTICS */}
          {activeTab === 'descriptive' && (
             <div className="flex flex-col xl:flex-row gap-6">
                <div className="w-full xl:w-1/3 flex flex-col gap-4">
                   <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
                      <label className="text-sm text-white/80 font-bold flex items-center gap-2">Data Set Input</label>
                      <textarea 
                         rows={5}
                         value={datasetText}
                         onChange={e => setDatasetText(e.target.value)}
                         placeholder="Enter numbers separated by commas or spaces..."
                         className="w-full bg-black/40 border-b-2 border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-brand-cyan transition-colors font-mono resize-y rounded-t-xl"
                      />
                      <p className="text-xs text-brand-cyan font-mono">{parsedData.length} valid numbers identified.</p>
                   </div>
                   
                   {descriptiveStats && (
                      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                         <div className="bg-white/5 px-4 py-3 border-b border-white/5"><span className="text-sm font-bold opacity-80">Summary Statistics</span></div>
                         <div className="grid grid-cols-2 gap-[1px] bg-white/5">
                            <StatTile label="Count (N)" value={descriptiveStats.n} />
                            <StatTile label="Missing" value="0" />
                            <StatTile label="Sum" value={descriptiveStats.sum.toFixed(4)} />
                            <StatTile label="Mean" value={descriptiveStats.mean.toFixed(4)} />
                            <StatTile label="Median" value={descriptiveStats.median} />
                            <StatTile label="Mode" value={descriptiveStats.mode} />
                            <StatTile label="Std Dev (s)" value={descriptiveStats.stdSamp.toFixed(4)} />
                            <StatTile label="Variance (s²)" value={descriptiveStats.varianceSamp.toFixed(4)} />
                            <StatTile label="Range" value={descriptiveStats.range.toFixed(4)} />
                            <StatTile label="IQR" value={descriptiveStats.iqr.toFixed(4)} />
                            <StatTile label="Skewness" value={descriptiveStats.skewness.toFixed(4)} />
                            <StatTile label="Kurtosis" value={descriptiveStats.kurtosis.toFixed(4)} />
                         </div>
                      </div>
                   )}
                </div>

                <div className="w-full xl:w-2/3 flex flex-col gap-6">
                   {parsedData.length > 0 && (
                      <>
                         <div className="glass-panel p-4 rounded-2xl border border-white/10 h-[400px]">
                            <Plot
                               data={[
                                  { type: 'histogram', x: parsedData, marker: { color: '#00d4ff', line: { color: 'rgba(0,0,0,0.5)', width: 1 } }, opacity: 0.7, name: 'Frequency' }
                               ]}
                               layout={{
                                  title: 'Histogram',
                                  paper_bgcolor: 'transparent',
                                  plot_bgcolor: 'transparent',
                                  font: { color: '#aaa' },
                                  xaxis: { gridcolor: '#333' },
                                  yaxis: { gridcolor: '#333' },
                                  margin: { t: 40, b: 40, l: 40, r: 20 },
                                  autosize: true
                               }}
                               useResizeHandler={true}
                               style={{ width: '100%', height: '100%' }}
                               config={{ displayModeBar: false }}
                            />
                         </div>
                         <div className="glass-panel p-4 rounded-2xl border border-white/10 h-[300px]">
                            <Plot
                               data={[
                                  { type: 'box', x: parsedData, name: 'Dataset', boxpoints: 'all', jitter: 0.3, pointpos: -1.8, marker: { color: '#8b5cf6' } }
                               ]}
                               layout={{
                                  title: 'Box Plot',
                                  paper_bgcolor: 'transparent',
                                  plot_bgcolor: 'transparent',
                                  font: { color: '#aaa' },
                                  xaxis: { gridcolor: '#333' },
                                  yaxis: { gridcolor: '#333', visible: false },
                                  margin: { t: 40, b: 40, l: 40, r: 20 },
                                  autosize: true
                               }}
                               useResizeHandler={true}
                               style={{ width: '100%', height: '100%' }}
                               config={{ displayModeBar: false }}
                            />
                         </div>
                      </>
                   )}
                </div>
             </div>
          )}

          {/* COMBINATORICS & PROBABILITY */}
          {activeTab === 'combinatorics' && (
             <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-8 max-w-xl mx-auto">
                <div className="text-center pb-4 border-b border-white/5">
                   <h3 className="font-serif text-2xl font-bold flex justify-center items-center gap-2"><Dna className="w-5 h-5 text-brand-violet" /> Combinatorics</h3>
                   <p className="text-white/50 text-sm mt-2">Calculate Permutations (nPr) and Combinations (nCr)</p>
                </div>

                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                      <div className="flex-1">
                         <label className="text-xs text-white/50 uppercase tracking-widest font-mono mb-2 block">Total Items (n)</label>
                         <input type="number" value={combN} onChange={e=>setCombN(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-violet outline-none font-mono" />
                      </div>
                      <div className="flex-1">
                         <label className="text-xs text-white/50 uppercase tracking-widest font-mono mb-2 block">Choose (r)</label>
                         <input type="number" value={combR} onChange={e=>setCombR(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-violet outline-none font-mono" />
                      </div>
                   </div>

                   {combinatoricsRes ? (
                      <div className="mt-6 flex flex-col gap-4">
                         <div className="bg-brand-violet/10 p-5 rounded-xl border border-brand-violet/20 flex flex-col items-center">
                            <span className="text-sm font-bold text-brand-violet mb-1">Permutations (nPr)</span>
                            <span className="text-3xl font-mono text-white">{combinatoricsRes.permutations.toLocaleString()}</span>
                            <span className="text-xs text-white/50 mt-1">Order matters</span>
                         </div>
                         <div className="bg-brand-emerald/10 p-5 rounded-xl border border-brand-emerald/20 flex flex-col items-center">
                            <span className="text-sm font-bold text-brand-emerald mb-1">Combinations (nCr)</span>
                            <span className="text-3xl font-mono text-white">{combinatoricsRes.combinations.toLocaleString()}</span>
                            <span className="text-xs text-white/50 mt-1">Order does not matter</span>
                         </div>
                      </div>
                   ) : (
                      <div className="mt-6 p-4 text-center text-red-400 bg-red-400/10 rounded-xl text-sm font-mono border border-red-400/20">
                         Invalid input. Ensure n ≥ 0, r ≥ 0, and n ≥ r.
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* REGRESSION */}
          {activeTab === 'regression' && (
             <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                   <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                         <label className="text-sm text-white/80 font-bold">X Values (Independent)</label>
                         <textarea rows={3} value={regDataX} onChange={e=>setRegDataX(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-brand-emerald font-mono resize-none" />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-sm text-white/80 font-bold">Y Values (Dependent)</label>
                         <textarea rows={3} value={regDataY} onChange={e=>setRegDataY(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-brand-emerald font-mono resize-none" />
                      </div>
                   </div>

                   {regressionResults ? (
                      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
                         <h4 className="font-bold text-sm text-white border-b border-white/10 pb-2 mb-2">Linear Regression Results</h4>
                         <div className="flex justify-between items-center text-sm"><span className="text-white/50">Equation</span><span className="font-mono font-bold text-brand-emerald">y = {regressionResults.slope.toFixed(4)}x + {regressionResults.intercept.toFixed(4)}</span></div>
                         <div className="flex justify-between items-center text-sm"><span className="text-white/50">Slope (m)</span><span className="font-mono">{regressionResults.slope.toFixed(4)}</span></div>
                         <div className="flex justify-between items-center text-sm"><span className="text-white/50">Y-Intercept (b)</span><span className="font-mono">{regressionResults.intercept.toFixed(4)}</span></div>
                         <div className="flex justify-between items-center text-sm"><span className="text-white/50">Correlation (r)</span><span className="font-mono">{regressionResults.pearson.toFixed(4)}</span></div>
                         <div className="flex justify-between items-center text-sm"><span className="text-white/50">R-Squared (R²)</span><span className="font-mono text-brand-cyan">{regressionResults.r2.toFixed(4)}</span></div>
                      </div>
                   ) : (
                      <div className="p-4 text-center text-orange-400 bg-orange-400/10 rounded-xl border border-orange-400/20 text-sm font-mono">
                         Ensure X and Y datasets have the same number of valid numeric elements.
                      </div>
                   )}
                </div>

                <div className="w-full lg:w-2/3 glass-panel p-4 rounded-2xl border border-white/10 h-[450px]">
                   {regressionResults && (
                      <Plot
                         data={[
                            { type: 'scatter', x: regressionResults.x, y: regressionResults.y, mode: 'markers', marker: { color: '#00d4ff', size: 8 }, name: 'Data Points' },
                            { type: 'scatter', x: regressionResults.lineX, y: regressionResults.lineY, mode: 'lines', line: { color: '#10b981', dash: 'dash' }, name: 'Regression Line' }
                         ]}
                         layout={{
                            title: 'Scatter Plot & Linear Regression',
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#aaa' },
                            xaxis: { gridcolor: '#333', title: 'X' },
                            yaxis: { gridcolor: '#333', title: 'Y' },
                            margin: { t: 40, b:40, l: 40, r: 20 },
                            autosize: true,
                            legend: { orientation: 'h', y: -0.15 }
                         }}
                         useResizeHandler={true}
                         style={{ width: '100%', height: '100%' }}
                         config={{ displayModeBar: false }}
                      />
                   )}
                </div>
             </div>
          )}

          {/* DISTRIBUTIONS / HYPOTHESIS - Placeholders / Simplified */}
          {(activeTab === 'distributions' || activeTab === 'hypothesis') && (
             <div className="glass-panel p-10 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center max-w-2xl mx-auto h-[400px]">
                <FlaskConical className="w-16 h-16 text-white/10 mb-4" />
                <h3 className="text-lg font-bold text-white/50 mb-2">{activeTab === 'distributions' ? 'Probability Distributions' : 'Hypothesis Testing'}</h3>
                <p className="text-sm font-mono text-white/30 max-w-xs mx-auto">
                   This advanced module is currently under development. Detailed analytics for {activeTab === 'distributions' ? 'PDF/CDF curves' : 'T-Tests and ANOVA'} will be included in the next update.
                </p>
             </div>
          )}

       </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-black/60 p-4 flex flex-col gap-1 items-start">
      <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">{label}</span>
      <span className="font-mono text-sm text-white/90">{value}</span>
    </div>
  );
}
