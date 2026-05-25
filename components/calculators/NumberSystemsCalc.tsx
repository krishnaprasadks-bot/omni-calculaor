'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Binary, 
  Hash, 
  Settings2, 
  ArrowRightLeft, 
  Cpu, 
  Code2, 
  Palette,
  Info,
  Type,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

type Base = 2 | 8 | 10 | 16;

export function NumberSystemsCalc() {
  // --- Main Conversion State ---
  const [inputValue, setInputValue] = useState('0');
  const [inputBase, setInputBase] = useState<Base>(10);
  const [bitSize, setBitSize] = useState<8 | 16 | 32 | 64>(32);

  // --- Bitwise State ---
  const [valA, setValA] = useState('0');
  const [valB, setValB] = useState('0');
  const [bitwiseOp, setBitwiseOp] = useState<'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR' | 'LSH' | 'RSH'>('AND');
  const [bitwiseBase, setBitwiseBase] = useState<Base>(10);

  // --- Floating Point State ---
  const [floatValue, setFloatValue] = useState('123.45');
  const [floatPrecision, setFloatPrecision] = useState<'32' | '64'>('32');

  // --- Text/ASCII State ---
  const [textValue, setTextValue] = useState('Hello');
  
  // --- Color State ---
  const [hexColor, setHexColor] = useState('#6366f1');

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<'bases' | 'bitwise' | 'float' | 'text' | 'color'>('bases');

  // Helper: BigInt safely
  const toBigInt = (val: string, base: number) => {
    try {
      if (base === 10) return BigInt(val.split('.')[0]); // Truncate decimals for integer-only bases
      return BigInt(`0${base === 16 ? 'x' : base === 8 ? 'o' : 'b'}${val}`);
    } catch {
      return 0n;
    }
  };

  const currentBigInt = useMemo(() => {
    try {
      if (!inputValue) return 0n;
      if (inputBase === 10) return BigInt(inputValue);
      const prefix = inputBase === 16 ? '0x' : inputBase === 8 ? '0o' : '0b';
      return BigInt(prefix + inputValue);
    } catch {
      return 0n;
    }
  }, [inputValue, inputBase]);

  // Derived values for multiple bases
  const representations = useMemo(() => {
    const val = currentBigInt;
    return {
      bin: val.toString(2),
      oct: val.toString(8),
      dec: val.toString(10),
      hex: val.toString(16).toUpperCase(),
    };
  }, [currentBigInt]);

  // Two's Complement
  const twosComplement = useMemo(() => {
    const val = currentBigInt;
    const mask = (1n << BigInt(bitSize)) - 1n;
    const masked = val & mask;
    return masked.toString(2).padStart(bitSize, '0');
  }, [currentBigInt, bitSize]);

  // IEEE 754 Logic
  const ieeeBits = useMemo(() => {
    const num = parseFloat(floatValue) || 0;
    if (floatPrecision === '32') {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, num);
      const bits = view.getUint32(0).toString(2).padStart(32, '0');
      return {
        sign: bits[0],
        exponent: bits.slice(1, 9),
        mantissa: bits.slice(9)
      };
    } else {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setFloat64(0, num);
      const high = view.getUint32(0).toString(2).padStart(32, '0');
      const low = view.getUint32(4).toString(2).padStart(32, '0');
      const bits = high + low;
      return {
        sign: bits[0],
        exponent: bits.slice(1, 12),
        mantissa: bits.slice(12)
      };
    }
  }, [floatValue, floatPrecision]);

  // Text/ASCII Logic
  const textOutput = useMemo(() => {
    return textValue.split('').map(char => {
      const code = char.charCodeAt(0);
      return {
        char,
        dec: code,
        hex: code.toString(16).toUpperCase().padStart(2, '0'),
        bin: code.toString(2).padStart(8, '0')
      };
    });
  }, [textValue]);

  // Color logic
  const colorData = useMemo(() => {
    let r=0, g=0, b=0;
    const hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }

    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    let h=0, s=0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r/255: h = (g/255 - b/255) / d + (g < b ? 6 : 0); break;
        case g/255: h = (b/255 - r/255) / d + 2; break;
        case b/255: h = (r/255 - g/255) / d + 4; break;
      }
      h /= 6;
    }

    return {
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
      r, g, b
    };
  }, [hexColor]);

  // Bitwise Calculation
  const bitwiseResult = useMemo(() => {
    const a = toBigInt(valA, bitwiseBase);
    const b = toBigInt(valB, bitwiseBase);
    let res = 0n;
    switch(bitwiseOp) {
      case 'AND': res = a & b; break;
      case 'OR': res = a | b; break;
      case 'XOR': res = a ^ b; break;
      case 'NAND': res = ~(a & b); break;
      case 'NOR': res = ~(a | b); break;
      case 'XNOR': res = ~(a ^ b); break;
      case 'LSH': res = a << b; break;
      case 'RSH': res = a >> b; break;
    }
    return res.toString(bitwiseBase).toUpperCase();
  }, [valA, valB, bitwiseOp, bitwiseBase]);

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-syne font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Binary className="w-6 h-6" />
            </div>
            Number Systems
          </h1>
          <p className="text-muted-foreground mt-1">Multi-base conversion, bitwise logic, and digital signals.</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
          {[
            { id: 'bases', label: 'Bases', icon: Hash },
            { id: 'bitwise', label: 'Bitwise', icon: Zap },
            { id: 'float', label: 'IEEE 754', icon: Cpu },
            { id: 'text', label: 'Unicode', icon: Type },
            { id: 'color', label: 'Colors', icon: Palette },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-syne font-bold uppercase tracking-wider transition-all",
                activeTab === tab.id ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'bases' && (
              <motion.div
                key="bases"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-syne font-bold text-sm flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                      INPUT VALUE
                    </h3>
                    <div className="flex bg-black/20 rounded-lg p-1">
                      {[10, 2, 8, 16].map(b => (
                        <button
                          key={b}
                          onClick={() => setInputBase(b as Base)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                            inputBase === b ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" : "text-gray-500"
                          )}
                        >
                          {b === 10 ? 'DEC' : b === 2 ? 'BIN' : b === 8 ? 'OCT' : 'HEX'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-2xl font-mono focus:border-cyan-500 focus:outline-none transition-all placeholder:text-gray-800"
                    placeholder="Enter value..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { base: 'Decimal', val: representations.dec, color: 'text-indigo-400' },
                    { base: 'Binary', val: representations.bin, color: 'text-cyan-400' },
                    { base: 'Hexadecimal', val: representations.hex, color: 'text-violet-400' },
                    { base: 'Octal', val: representations.oct, color: 'text-emerald-400' }
                  ].map(row => (
                    <div key={row.base} className="bg-white/5 border border-white/10 rounded-xl p-4 group">
                      <div className="text-[10px] uppercase font-syne font-bold text-gray-500 mb-1 tracking-widest">{row.base}</div>
                      <div className={cn("font-mono text-lg break-all group-hover:text-white transition-colors cursor-copy", row.color)} onClick={() => navigator.clipboard.writeText(row.val)}>
                        {row.val}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-syne font-bold text-sm flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-gray-400" />
                      TWO&apos;S COMPLEMENT
                    </h3>
                    <select 
                      value={bitSize} 
                      onChange={(e) => setBitSize(parseInt(e.target.value) as any)}
                      className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs outline-none"
                    >
                      {[8, 16, 32, 64].map(n => <option key={n} value={n}>{n}-bit</option>)}
                    </select>
                  </div>
                  <div className="p-4 bg-black/40 rounded-xl font-mono text-sm break-all leading-relaxed tracking-wider text-cyan-300">
                    {twosComplement.match(/.{1,4}/g)?.join(' ') || twosComplement}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bitwise' && (
              <motion.div
                key="bitwise"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-syne font-bold text-sm">BITWISE LOGIC</h3>
                    <div className="flex bg-black/20 rounded-lg p-1">
                      {[10, 2, 16].map(b => (
                        <button key={b} onClick={() => setBitwiseBase(b as Base)} className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", bitwiseBase === b ? "bg-indigo-500 text-white" : "text-gray-500")}>
                          {b === 10 ? 'DEC' : b === 2 ? 'BIN' : 'HEX'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Input A</label>
                      <input type="text" value={valA} onChange={(e) => setValA(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 font-mono focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Input B</label>
                      <input type="text" value={valB} onChange={(e) => setValB(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 font-mono focus:border-indigo-500 focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'XNOR', 'LSH', 'RSH'].map(op => (
                      <button
                        key={op}
                        onClick={() => setBitwiseOp(op as any)}
                        className={cn(
                          "py-2 rounded-lg text-[10px] font-bold transition-all border",
                          bitwiseOp === op ? "bg-indigo-500 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        )}
                      >
                        {op}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Result</label>
                    <div className="text-2xl font-mono text-indigo-400 mt-1">{bitwiseResult}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'float' && (
              <motion.div
                key="float"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-syne font-bold text-sm">IEEE 754 VISUALIZER</h3>
                    <div className="flex bg-black/20 rounded-lg p-1">
                      {['32', '64'].map(p => (
                        <button key={p} onClick={() => setFloatPrecision(p as any)} className={cn("px-4 py-1 rounded-md text-[10px] font-bold transition-all", floatPrecision === p ? "bg-emerald-500 text-black" : "text-gray-500")}>
                          {p === '32' ? 'Single' : 'Double'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="text" value={floatValue} onChange={(e) => setFloatValue(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-3 text-xl font-mono focus:border-emerald-500 focus:outline-none" />
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-3">Memory Layout</div>
                    <div className="flex flex-wrap gap-1 font-mono text-xs overflow-x-auto pb-2">
                       <span className="px-1.5 py-1 bg-red-500/20 text-red-400 rounded" title="Sign Bit">{ieeeBits.sign}</span>
                       <span className="px-1.5 py-1 bg-blue-500/20 text-blue-400 rounded" title="Exponent">{ieeeBits.exponent}</span>
                       <span className="px-1.5 py-1 bg-emerald-500/20 text-emerald-400 rounded" title="Mantissa">{ieeeBits.mantissa}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                      <div className="text-[10px] font-bold text-red-400 mb-1">SIGN</div>
                      <div className="font-mono text-lg">{ieeeBits.sign}</div>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                      <div className="text-[10px] font-bold text-blue-400 mb-1">EXPONENT</div>
                      <div className="font-mono text-lg truncate" title={ieeeBits.exponent}>{ieeeBits.exponent}</div>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                      <div className="text-[10px] font-bold text-emerald-400 mb-1">MANTISSA</div>
                      <div className="font-mono text-lg truncate" title={ieeeBits.mantissa}>{ieeeBits.mantissa}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="font-syne font-bold text-sm mb-4 uppercase">Text Encoder</h3>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-lg focus:border-violet-500 focus:outline-none min-h-[100px] resize-none"
                    placeholder="Type words..."
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {textOutput.map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold mb-2">{item.char}</div>
                      <div className="space-y-1 text-[10px] font-mono text-gray-500">
                        <div>DEC: {item.dec}</div>
                        <div>HEX: {item.hex}</div>
                        <div className="truncate">BIN: {item.bin}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'color' && (
              <motion.div
                key="color"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                     <h3 className="font-syne font-bold text-sm mb-4 uppercase">Color Picker</h3>
                     <div className="flex gap-4">
                       <input 
                         type="color" 
                         value={hexColor} 
                         onChange={(e) => setHexColor(e.target.value)}
                         className="w-16 h-16 rounded-xl bg-transparent border-none outline-none cursor-pointer"
                       />
                       <input 
                         type="text" 
                         value={hexColor} 
                         onChange={(e) => setHexColor(e.target.value)}
                         className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 text-xl font-mono focus:border-cyan-500 focus:outline-none"
                       />
                     </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500">RGB</span>
                        <span className="font-mono text-sm">{colorData.rgb}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500">HSL</span>
                        <span className="font-mono text-sm">{colorData.hsl}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-red-500/10 rounded-xl p-4 text-center">
                     <div className="text-[10px] font-bold text-red-400 mb-1">RED</div>
                     <div className="font-mono">{colorData.r}</div>
                   </div>
                   <div className="bg-green-500/10 rounded-xl p-4 text-center">
                     <div className="text-[10px] font-bold text-green-400 mb-1">GREEN</div>
                     <div className="font-mono">{colorData.g}</div>
                   </div>
                   <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                     <div className="text-[10px] font-bold text-blue-400 mb-1">BLUE</div>
                     <div className="font-mono">{colorData.b}</div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-syne font-bold text-sm mb-4 flex items-center gap-2 uppercase">
              <Info className="w-4 h-4 text-gray-400" />
              Quick Guide
            </h3>
            <div className="space-y-4 text-sm text-gray-400 font-syne">
              <p>Everything in the digital world is a sequence of bits. This module helps you translate between human and machine representations.</p>
              
              <div className="space-y-2">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-white font-bold text-xs mb-1">Base Conversion</div>
                  <p className="text-[10px]">Switch between DEC, HEX, BIN, and OCT instantly. Large numbers supported via BigInt.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-white font-bold text-xs mb-1">Floating Point</div>
                  <p className="text-[10px]">Visualize how decimals are stored in memory using the IEEE 754 standard (32/64 bit).</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-white font-bold text-xs mb-1">Logic Gates</div>
                  <p className="text-[10px]">Test bitwise operators like XOR or NAND which are fundamental to computer circuitry.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
