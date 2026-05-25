"use client";

import { UnitConverter } from "@/components/convert/unit-converter";

export default function Converter() {
  return (
    <div className="flex-1 flex flex-col min-h-full bg-muted/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto w-full mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Unit Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between hundreds of units instantly.
        </p>
      </div>

      <UnitConverter />
    </div>
  );
}
