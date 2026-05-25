"use client";

import React, { useEffect, useState } from 'react';
import type { PlotParams } from 'react-plotly.js';

export default function PlotWrapper(props: PlotParams) {
  const [PlotComponent, setPlotComponent] = useState<React.ComponentType<PlotParams> | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPlotly = async () => {
      // Load script if not present
      if (!(window as any).Plotly) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.plot.ly/plotly-2.32.0.min.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Plotly script'));
          document.head.appendChild(script);
        });
      }
      
      if (!isMounted) return;
      
      // Load factory dynamically (it doesn't have window references on import time)
      const mod = await import('react-plotly.js/factory');
      const createPlot = mod.default || mod;
      
      const Plot = createPlot((window as any).Plotly);
      setPlotComponent(() => Plot);
    };

    loadPlotly().catch(console.error);
    
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
