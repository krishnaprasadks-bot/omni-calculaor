'use client';
import { useState } from 'react';
import { Code2 } from 'lucide-react';

export function ProgrammerCalc() {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="text-center space-y-4">
        <Code2 className="w-16 h-16 mx-auto text-red-400 opacity-50" />
        <h2 className="text-2xl font-bold font-serif text-white">Programmer Calculator</h2>
        <p className="text-white/50 max-w-md mx-auto">
          Bitwise operations, number base conversions, hashes, and more. Co-processor powering up...
        </p>
      </div>
    </div>
  );
}
