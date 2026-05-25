"use client";

import { GraphingCalc } from "@/components/graphing/graphing-calc";

export default function GraphingCalculator() {
  return (
    <div className="flex-1 flex flex-col bg-muted/5 p-4 md:p-8 min-h-full">
      <GraphingCalc />
    </div>
  );
}
