'use client';
import { useState } from 'react';
import { Variable } from 'lucide-react';

export function SolverCalc() {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="text-center space-y-4">
        <Variable className="w-16 h-16 mx-auto text-lime-400 opacity-50" />
        <h2 className="text-2xl font-bold font-serif text-white">Equation Solver</h2>
        <p className="text-white/50 max-w-md mx-auto">
          Polynomials, systems of equations, algebra steps. Setting up numeric routines...
        </p>
      </div>
    </div>
  );
}
