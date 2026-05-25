"use client";

import React, { useState } from 'react';

type Shape = 'Triangle' | 'Circle' | 'Rectangle' | 'Sphere' | 'Cylinder';

export default function GeometrySolver() {
  const [shape, setShape] = useState<Shape>('Triangle');
  
  // Triangle states
  const [base, setBase] = useState("10");
  const [height, setHeight] = useState("5");
  
  // Circle/Sphere states
  const [radius, setRadius] = useState("5");

  // Rectangle states
  const [width, setWidth] = useState("10");
  const [length, setLength] = useState("5");

  // Cylinder uses radius and height
  
  const calculate = () => {
    let area = 0;
    let perimeter = 0; // or circumference / surface area
    let volume = 0;
    
    const r = parseFloat(radius) || 0;
    const b = parseFloat(base) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;

    switch(shape) {
      case 'Triangle':
        area = 0.5 * b * h;
        break;
      case 'Circle':
        area = Math.PI * r * r;
        perimeter = 2 * Math.PI * r;
        break;
      case 'Rectangle':
        area = w * l;
        perimeter = 2 * (w + l);
        break;
      case 'Sphere':
        area = 4 * Math.PI * r * r;
        volume = (4/3) * Math.PI * Math.pow(r, 3);
        break;
      case 'Cylinder':
        area = 2 * Math.PI * r * h + 2 * Math.PI * r * r;
        volume = Math.PI * r * r * h;
        break;
    }
    
    return {
      area: area > 0 ? area.toFixed(4) : null,
      perimeter: perimeter > 0 ? perimeter.toFixed(4) : null,
      volume: volume > 0 ? volume.toFixed(4) : null
    };
  };

  const results = calculate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-4 space-y-4">
        {['Triangle', 'Circle', 'Rectangle', 'Sphere', 'Cylinder'].map(s => (
          <button
            key={s}
            onClick={() => setShape(s as Shape)}
            className={`w-full p-4 rounded-xl border text-left font-syne font-bold uppercase tracking-wider transition-all ${
              shape === s 
                ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 ring-1 ring-purple-500' 
                : 'bg-muted/30 hover:bg-muted text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="md:col-span-8 space-y-6">
        <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="font-syne font-bold text-lg uppercase tracking-wider text-muted-foreground border-b pb-2">
            {shape} Parameters
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {shape === 'Triangle' && (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Base</label>
                  <input type="number" value={base} onChange={e => setBase(e.target.value)} className="w-full bg-background border px-3 py-2 rounded-lg font-mono outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Height</label>
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-background border px-3 py-2 rounded-lg font-mono outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
              </>
            )}
            
            {(shape === 'Circle' || shape === 'Sphere' || shape === 'Cylinder') && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Radius</label>
                <input type="number" value={radius} onChange={e => setRadius(e.target.value)} className="w-full bg-background border px-3 py-2 rounded-lg font-mono outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
            )}
            
            {shape === 'Cylinder' && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Height</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-background border px-3 py-2 rounded-lg font-mono outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
            )}
            
            {shape === 'Rectangle' && (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Width</label>
                  <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-background border px-3 py-2 rounded-lg font-mono outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Length</label>
                  <input type="number" value={length} onChange={e => setLength(e.target.value)} className="w-full bg-background border px-3 py-2 rounded-lg font-mono outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card p-6 rounded-2xl border flex flex-col justify-center text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Area / Surface</span>
            <span className="font-mono text-xl text-purple-400 font-bold">{results.area || "-"}</span>
          </div>
          <div className="bg-card p-6 rounded-2xl border flex flex-col justify-center text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Perimeter / Circ</span>
            <span className="font-mono text-xl text-cyan-400 font-bold">{results.perimeter || "-"}</span>
          </div>
          <div className="bg-card p-6 rounded-2xl border flex flex-col justify-center text-center col-span-2 md:col-span-1">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Volume</span>
            <span className="font-mono text-xl text-green-400 font-bold">{results.volume || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
