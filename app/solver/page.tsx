"use client";

import { Variable } from "lucide-react";

export default function Solver() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10 h-full text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        <Variable className="w-12 h-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Equation Solver</h1>
      <p className="text-muted-foreground max-w-md">
        This calculator mode is currently under construction. Please check back
        later.
      </p>
    </div>
  );
}
