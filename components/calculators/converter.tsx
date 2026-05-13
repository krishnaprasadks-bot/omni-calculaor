'use client';

import { useState, useMemo } from 'react';
import { RefreshCcw, Search, ArrowRightLeft, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useCalc } from '@/components/calc-context';

type ConversionCategory = 'Length' | 'Weight' | 'Temperature' | 'Area' | 'Volume' | 'Time';

interface Unit {
  id: string; label: string; factor: number | ((val: number, toBase: boolean) => number);
}

const CATEGORIES: Record<ConversionCategory, Unit[]> = {
  Length: [
    { id: 'm', label: 'Meters (m)', factor: 1 },
    { id: 'cm', label: 'Centimeters (cm)', factor: 0.01 },
    { id: 'km', label: 'Kilometers (km)', factor: 1000 },
    { id: 'in', label: 'Inches (in)', factor: 0.0254 },
    { id: 'ft', label: 'Feet (ft)', factor: 0.3048 },
    { id: 'yd', label: 'Yards (yd)', factor: 0.9144 },
    { id: 'mi', label: 'Miles (mi)', factor: 1609.34 },
  ],
  Weight: [
    { id: 'kg', label: 'Kilograms (kg)', factor: 1 },
    { id: 'g', label: 'Grams (g)', factor: 0.001 },
    { id: 'mg', label: 'Milligrams (mg)', factor: 0.000001 },
    { id: 'lb', label: 'Pounds (lb)', factor: 0.453592 },
    { id: 'oz', label: 'Ounces (oz)', factor: 0.0283495 },
  ],
  Temperature: [
    { id: 'c', label: 'Celsius (°C)', factor: (v, toBase) => toBase ? v : v },
    { id: 'f', label: 'Fahrenheit (°F)', factor: (v, toBase) => toBase ? (v - 32) * 5/9 : (v * 9/5) + 32 },
    { id: 'k', label: 'Kelvin (K)', factor: (v, toBase) => toBase ? v - 273.15 : v + 273.15 },
  ],
  Area: [
    { id: 'm2', label: 'Square Meters (m²)', factor: 1 },
    { id: 'ha', label: 'Hectares (ha)', factor: 10000 },
    { id: 'km2', label: 'Square Kilometers (km²)', factor: 1000000 },
    { id: 'acre', label: 'Acres (ac)', factor: 4046.86 },
    { id: 'ft2', label: 'Square Feet (ft²)', factor: 0.092903 },
  ],
  Volume: [
    { id: 'l', label: 'Liters (L)', factor: 1 },
    { id: 'ml', label: 'Milliliters (ml)', factor: 0.001 },
    { id: 'm3', label: 'Cubic Meters (m³)', factor: 1000 },
    { id: 'gal', label: 'US Gallons (gal)', factor: 3.78541 },
    { id: 'oz', label: 'US Fluid Ounces (fl oz)', factor: 0.0295735 },
  ],
  Time: [
    { id: 's', label: 'Seconds (s)', factor: 1 },
    { id: 'min', label: 'Minutes (min)', factor: 60 },
    { id: 'hr', label: 'Hours (hr)', factor: 3600 },
    { id: 'day', label: 'Days', factor: 86400 },
    { id: 'wk', label: 'Weeks', factor: 604800 },
  ],
};

export function ConverterCalc() {
  const [category, setCategory] = useState<ConversionCategory>('Length');
  const [search, setSearch] = useState('');
  
  const currentUnits = useMemo(() => {
     let units = CATEGORIES[category];
     if (search.trim()) {
        const q = search.toLowerCase();
        units = units.filter(u => u.label.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
     }
     return units;
  }, [category, search]);

  const [fromUnit, setFromUnit] = useState<string>(CATEGORIES['Length'][0].id);
  const [toUnit, setToUnit] = useState<string>(CATEGORIES['Length'][1].id);
  const [fromValue, setFromValue] = useState<string>('1');

  // Handle category change
  const handleCategoryChange = (c: ConversionCategory) => {
     setCategory(c);
     setSearch('');
     setFromUnit(CATEGORIES[c][0].id);
     setToUnit(CATEGORIES[c][1]?.id || CATEGORIES[c][0].id);
  };

  const toValue = useMemo(() => {
     if (!fromValue || isNaN(Number(fromValue))) return '';
     const val = Number(fromValue);
     const from = CATEGORIES[category].find(u => u.id === fromUnit);
     const to = CATEGORIES[category].find(u => u.id === toUnit);
     if (!from || !to) return '';

     let baseVal = 0;
     if (typeof from.factor === 'function') {
        baseVal = from.factor(val, true);
     } else {
        baseVal = val * from.factor;
     }

     let res = 0;
     if (typeof to.factor === 'function') {
        res = to.factor(baseVal, false);
     } else {
        res = baseVal / to.factor;
     }

     return parseFloat(res.toPrecision(10)).toString();
  }, [fromValue, fromUnit, toUnit, category]);

  const handleSwap = () => {
     setFromUnit(toUnit);
     setToUnit(fromUnit);
     setFromValue(toValue);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto py-4 px-2 w-full gap-6">
       
       <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-white">
             <RefreshCcw className="w-6 h-6 text-orange-400" /> Unit Converter
          </h3>
       </div>

       <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Categories */}
          <div className="w-full md:w-48 flex flex-row overflow-x-auto md:flex-col gap-2 shrink-0 glass-panel p-2 rounded-2xl border border-white/5 scrollbar-hide">
             {(Object.keys(CATEGORIES) as ConversionCategory[]).map(cat => (
                <button
                   key={cat}
                   onClick={() => handleCategoryChange(cat)}
                   className={clsx(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap",
                      category === cat ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                   )}
                >
                   {cat}
                </button>
             ))}
          </div>

          <div className="flex-1 flex flex-col gap-6">
             {/* Converter Panel */}
             <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6 relative">
                
                {/* Visual Connector */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 flex items-center justify-center z-10 w-full hidden md:flex pointer-events-none">
                   <button onClick={handleSwap} className="p-3 rounded-full bg-[#1a1a24] border border-white/10 text-orange-400 hover:text-orange-300 hover:scale-110 transition-all pointer-events-auto shadow-[0_0_20px_rgba(251,146,60,0.15)]">
                      <ArrowRightLeft className="w-5 h-5" />
                   </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                   {/* FROM */}
                   <div className="flex-1 flex flex-col gap-3">
                      <label className="text-xs font-mono text-white/50 uppercase tracking-wider">From</label>
                      <input 
                         type="number"
                         value={fromValue}
                         onChange={e => setFromValue(e.target.value)}
                         className="w-full bg-black/40 border-b-2 border-white/10 px-4 py-3 text-3xl font-medium text-white outline-none focus:border-orange-400 transition-colors font-mono"
                      />
                      <select 
                         value={fromUnit}
                         onChange={e => setFromUnit(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-orange-400/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                      >
                         {currentUnits.map(u => <option key={u.id} value={u.id} className="bg-black text-white">{u.label}</option>)}
                      </select>
                   </div>

                   {/* Mobile Swap Button */}
                   <div className="md:hidden flex justify-center py-2">
                      <button onClick={handleSwap} className="p-3 rounded-full bg-[#1a1a24] border border-white/10 text-orange-400 hover:scale-110 transition-all">
                         <RefreshCcw className="w-5 h-5 -rotate-90" />
                      </button>
                   </div>

                   {/* TO */}
                   <div className="flex-1 flex flex-col gap-3">
                      <label className="text-xs font-mono text-white/50 uppercase tracking-wider">To</label>
                      <input 
                         type="text"
                         readOnly
                         value={toValue}
                         className="w-full bg-black/40 border-b-2 border-white/10 px-4 py-3 text-3xl font-medium text-orange-400 outline-none transition-colors font-mono"
                      />
                      <select 
                         value={toUnit}
                         onChange={e => setToUnit(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 outline-none focus:border-orange-400/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                      >
                         {currentUnits.map(u => <option key={u.id} value={u.id} className="bg-black text-white">{u.label}</option>)}
                      </select>
                   </div>
                </div>

                <div className="text-center font-mono text-xs text-white/30 hidden md:block mt-2">
                   1 {CATEGORIES[category]?.find(u=>u.id===fromUnit)?.label.split(' ')[0]} = {
                      (() => {
                         const f = CATEGORIES[category]?.find(u=>u.id===fromUnit);
                         const t = CATEGORIES[category]?.find(u=>u.id===toUnit);
                         if(!f || !t) return '';
                         let b = 0;
                         if (typeof f.factor === 'function') b = f.factor(1, true);
                         else b = 1 * f.factor;
                         let r = 0;
                         if (typeof t.factor === 'function') r = t.factor(b, false);
                         else r = b / t.factor;
                         return parseFloat(r.toPrecision(6));
                      })()
                   } {CATEGORIES[category]?.find(u=>u.id===toUnit)?.label.split(' ')[0]}
                </div>

             </div>

          </div>
       </div>

    </div>
  );
}
