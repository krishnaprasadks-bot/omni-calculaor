'use client';
import { PieChart, BarChart } from 'lucide-react';
import { useState, useMemo } from 'react';
import * as jStat from 'jstat';

export function StatisticsCalc() {
  const [input, setInput] = useState("12, 15, 14, 19, 21, 25, 23, 29, 31, 28");

  const stats = useMemo(() => {
    try {
      const data = input.split(/[\s,]+/).filter(x => x).map(Number).filter(n => !isNaN(n));
      if (data.length === 0) return null;
      
      const n = data.length;
      const min = jStat.min(data);
      const max = jStat.max(data);
      const sum = jStat.sum(data);
      const mean = jStat.mean(data);
      const median = jStat.median(data);
      const range = max - min;
      const stdDevPop = jStat.stdev(data, true);
      const variance = jStat.variance(data, true);
      const skewness = jStat.skewness(data);
      const kurtosis = jStat.kurtosis(data);

      return [
        { label: "Count (n)", val: n },
        { label: "Mean (μ)", val: mean.toFixed(4) },
        { label: "Median", val: median.toFixed(4) },
        { label: "Sum (Σx)", val: sum.toFixed(4) },
        { label: "Min / Max", val: `${min} / ${max}` },
        { label: "Range", val: range },
        { label: "Variance (σ²)", val: variance.toFixed(4) },
        { label: "Std Dev (σ)", val: stdDevPop.toFixed(4) },
        { label: "Skewness", val: skewness.toFixed(4) },
        { label: "Kurtosis", val: kurtosis.toFixed(4) },
      ];
    } catch {
      return null;
    }
  }, [input]);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto py-4 px-4 w-full gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <PieChart className="w-6 h-6 text-pink-400" /> Statistics
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Input Box */}
         <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <h4 className="font-mono text-sm tracking-widest text-white/50 uppercase">Dataset 1</h4>
            <textarea 
               className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono placeholder:text-white/20 focus:border-pink-400 outline-none resize-none"
               placeholder="Enter values separated by commas..."
               value={input}
               onChange={e => setInput(e.target.value)}
            />
         </div>

         {/* Primary Stats */}
         <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <h4 className="font-mono text-sm tracking-widest text-pink-400 uppercase">Descriptive Statistics</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {stats ? stats.map((stat, i) => (
                  <div key={i} className="bg-black/30 rounded-xl p-4 border border-white/5">
                     <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">{stat.label}</div>
                     <div className="text-white font-mono text-lg font-bold">{stat.val}</div>
                  </div>
               )) : (
                 <div className="col-span-4 text-white/30 font-mono text-sm text-center py-8">Invalid or empty dataset</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
