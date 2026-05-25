'use client';
import { LineChart as LineChartIcon, ZoomIn } from 'lucide-react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false, 
  loading: () => <div className="animate-pulse w-full h-full bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center font-mono text-emerald-400/50">Warming up rendering engine...</div> 
});

export function GraphingCalc() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex items-center justify-between p-4 px-6 md:px-8 border-b border-white/5 bg-black/20">
        <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
          <LineChartIcon className="w-6 h-6 text-emerald-400" /> Plotter
        </h3>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
         {/* Sidebar Formulas */}
         <div className="w-full md:w-80 border-r border-white/5 bg-black/40 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
            <h4 className="font-mono text-sm tracking-widest text-emerald-400 uppercase">Equations</h4>
            
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-colors">
               <div className="w-4 h-4 rounded-full bg-[#10b981] shrink-0 border-2 border-black" />
               <input type="text" className="bg-transparent border-none text-white font-mono text-sm outline-none w-full" defaultValue="y = sin(x) / x" />
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:border-pink-500/30 transition-colors">
               <div className="w-4 h-4 rounded-full bg-[#ec4899] shrink-0 border-2 border-black" />
               <input type="text" className="bg-transparent border-none text-white font-mono text-sm outline-none w-full" defaultValue="y = 0.5 * cos(3*x)" />
            </div>

            <button className="py-2 border border-dashed border-white/20 rounded-xl text-white/40 font-mono text-sm hover:bg-white/5 hover:text-white transition-colors mt-2">
               + Add Function
            </button>
         </div>

         {/* Plot Area */}
         <div className="flex-1 h-[40vh] md:h-full relative bg-[#0a0a0a]">
            {/* Just a mockup using standard Plot component to avoid massive processing unless requested */}
            <div className="absolute inset-0 p-4">
               <Plot 
                  data={[
                     {
                        x: Array.from({length: 100}, (_,i) => (i-50)/10),
                        y: Array.from({length: 100}, (_,i) => { const x = (i-50)/10; return x===0 ? 1 : Math.sin(x)/x; }),
                        type: 'scatter',
                        mode: 'lines',
                        line: {color: '#10b981', width: 3},
                        name: 'f(x)'
                     },
                     {
                        x: Array.from({length: 100}, (_,i) => (i-50)/10),
                        y: Array.from({length: 100}, (_,i) => { const x = (i-50)/10; return 0.5 * Math.cos(3*x); }),
                        type: 'scatter',
                        mode: 'lines',
                        line: {color: '#ec4899', width: 2},
                        name: 'g(x)'
                     }
                  ]}
                  layout={{
                     autosize: true,
                     margin: { t: 20, b: 30, l: 30, r: 20 },
                     paper_bgcolor: 'transparent',
                     plot_bgcolor: 'transparent',
                     xaxis: { gridcolor: '#ffffff15', zerolinecolor: '#ffffff40' },
                     yaxis: { gridcolor: '#ffffff15', zerolinecolor: '#ffffff40' },
                  }}
                  style={{ width: '100%', height: '100%' }}
                  useResizeHandler={true}
                  config={{ responsive: true, displayModeBar: false }}
               />
            </div>
         </div>
      </div>
    </div>
  );
}
