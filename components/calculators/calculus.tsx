'use client';
import { useState } from 'react';
import { Sigma } from 'lucide-react';

export function CalculusCalc() {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="text-center space-y-4">
        <Sigma className="w-16 h-16 mx-auto text-blue-400 opacity-50" />
        <h2 className="text-2xl font-bold font-serif text-white">Calculus Tools</h2>
        <p className="text-white/50 max-w-md mx-auto">
          Derivatives, Integrals, Limits, Series, and differential equations. Initializing engine...
        </p>
      </div>
    </div>
  );
}
