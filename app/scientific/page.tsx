"use client";

import { ScientificCalc } from "@/components/calculators/ScientificCalc";

export default function ScientificCalculator() {
  return (
    <div className="flex-1 flex flex-col bg-muted/5 p-4 md:p-8 min-h-full">
      <ScientificCalc />
    </div>
  );
}
