"use client";

import React, { useEffect, useState } from 'react';
import type { PlotParams } from 'react-plotly.js';

export default function PlotWrapper(props: PlotParams) {
  const [PlotComponent, setPlotComponent] = useState<React.ComponentType<PlotParams> | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPlotly = async () => {
      try {
        const createPlotlyComponent = (await import('react-plotly.js/factory')).default;
        const PlotlyModule = await import('plotly.js-basic-dist');
        const Plotly = PlotlyModule.default || PlotlyModule;
        
        if (!isMounted) return;
        
        const Plot = createPlotlyComponent(Plotly);
        setPlotComponent(() => Plot);
      } catch (e) {
        console.error("Failed to load Plotly:", e);
      }
    };

    loadPlotly();
    
    return () => { isMounted = false; };
  }, []);

  if (!PlotComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/20 animate-pulse rounded-3xl font-mono text-sm border-2 border-dashed">
        Loading Vector Engine...
      </div>
    );
  }

  return <PlotComponent {...props} />;
}
