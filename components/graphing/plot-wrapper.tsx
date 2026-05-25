"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import type { PlotParams } from 'react-plotly.js';

const PlotlyChart = dynamic(() => import('./PlotComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/20 animate-pulse rounded-3xl font-mono text-sm border-2 border-dashed">
      Generating Plot...
    </div>
  )
});

export default function PlotWrapper(props: PlotParams) {
  return <PlotlyChart {...props} />;
}
