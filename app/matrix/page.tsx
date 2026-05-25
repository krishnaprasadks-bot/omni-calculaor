"use client";

import { MatrixCalc } from "@/components/calculators/MatrixCalc";

export default function Matrix() {
  return (
    <div className="flex-1 flex flex-col min-h-full bg-muted/5">
      <MatrixCalc />
    </div>
  );
}
