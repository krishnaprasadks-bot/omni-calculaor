'use client';

import { useCalc } from '@/components/calc-context';
import { motion, AnimatePresence } from 'motion/react';
import { StandardCalc } from '@/components/calculators/standard';
import { ScientificCalc } from '@/components/calculators/scientific';
import { GraphingCalc } from '@/components/calculators/graphing';
import { FinancialCalc } from '@/components/calculators/financial';
import { ConverterCalc } from '@/components/calculators/converter';
import { ProgrammerCalc } from '@/components/calculators/programmer';
import { StatisticsCalc } from '@/components/calculators/statistics';
import { MatrixCalc } from '@/components/calculators/matrix';
import { CalculusCalc } from '@/components/calculators/calculus';
import { SolverCalc } from '@/components/calculators/solver';
import { AIAssist } from '@/components/calculators/ai';

export default function CalculatorWorkspace() {
  const { mode } = useCalc();

  return (
    <div className="h-full w-full relative">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full"
        >
          {mode === 'basic' && <StandardCalc />}
          {mode === 'scientific' && <ScientificCalc />}
          {mode === 'graphing' && <GraphingCalc />}
          {mode === 'financial' && <FinancialCalc />}
          {mode === 'converter' && <ConverterCalc />}
          {mode === 'programmer' && <ProgrammerCalc />}
          {mode === 'statistics' && <StatisticsCalc />}
          {mode === 'matrix' && <MatrixCalc />}
          {mode === 'calculus' && <CalculusCalc />}
          {mode === 'solver' && <SolverCalc />}
          {mode === 'ai' && <AIAssist />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
