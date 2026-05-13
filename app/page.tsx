'use client';
import { CalcProvider, useCalc } from '@/components/calc-context';
import { Sidebar } from '@/components/sidebar';
import { HistoryPanel } from '@/components/history-panel';
import { ScientificCalc } from '@/components/calculators/scientific';
import { GraphingCalc } from '@/components/calculators/graphing';
import { FinancialCalc } from '@/components/calculators/financial';
import { ConverterCalc } from '@/components/calculators/converter';
import { AISolver } from '@/components/calculators/ai-solver';
import { StatisticsCalc } from '@/components/calculators/statistics';
import { MatrixCalc } from '@/components/calculators/matrix';
import { motion, AnimatePresence } from 'motion/react';

function CalculatorWorkspace() {
  const { mode } = useCalc();

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 filter blur-[100px]">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/30 rounded-full mix-blend-screen animate-blob" />
         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-violet/30 rounded-full mix-blend-screen animate-blob animation-delay-2000" />
         <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-brand-emerald/30 rounded-full mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <Sidebar />
      <div className="flex-1 relative z-10 flex flex-col h-full overflow-hidden">
        <div className="flex-1 relative w-full h-full p-2 md:p-6 overflow-y-auto overflow-x-hidden">
              <AnimatePresence mode="wait">
                 <motion.div
                    key={mode} initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.3 }} className="h-full w-full max-w-6xl mx-auto flex flex-col"
                  >
                    {(mode === 'basic' || mode === 'scientific') && <ScientificCalc />}
                    {mode === 'graphing' && <GraphingCalc />}
                    {mode === 'financial' && <FinancialCalc />}
                    {mode === 'converter' && <ConverterCalc />}
                    {mode === 'matrix' && <MatrixCalc />}
                    {mode === 'statistics' && <StatisticsCalc />}
                    {mode === 'ai' && <AISolver />}
                 </motion.div>
              </AnimatePresence>
        </div>
      </div>
      <HistoryPanel />
    </div>
  );
}

export default function Home() {
  return (
    <CalcProvider>
      <CalculatorWorkspace />
    </CalcProvider>
  );
}
