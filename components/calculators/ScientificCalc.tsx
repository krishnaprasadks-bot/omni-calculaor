"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { evaluate, format, complex, type Complex } from "mathjs";
import { useHistoryStore } from "@/store/historyStore";
import { Copy, Check, Search, Delete, Info, ArrowLeftRight, ChevronDown, ChevronRight, X, Maximize2, History } from "lucide-react";
import { format as formatFns } from "date-fns";

type AngleUnit = "DEG" | "RAD" | "GRAD";
type DisplayFormat = "decimal" | "fraction" | "exact";
type ComplexFormat = "rectangular" | "polar" | "euler";

export function ScientificCalc() {
  const [equation, setEquation] = useState("");
  const [currentInput, setCurrentInput] = useState("0");
  const [lastAnswer, setLastAnswer] = useState(0);
  const [liveResult, setLiveResult] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");

  const [angleUnit, setAngleUnit] = useState<AngleUnit>("RAD");
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("decimal");
  const [complexFormat, setComplexFormat] = useState<ComplexFormat>("rectangular");

  const [activeTab, setActiveTab] = useState("trig");
  const [showHistory, setShowHistory] = useState(false);
  const [showConstants, setShowConstants] = useState(false);
  const [showTrigCheatSheet, setShowTrigCheatSheet] = useState(false);

  const [copied, setCopied] = useState(false);
  const [searchConstQuery, setSearchConstQuery] = useState("");

  const { history, addToHistory, deleteItem, clearHistory } = useHistoryStore();
  const displayRef = useRef<HTMLDivElement>(null);
  
  const [argzPlot, setArgzPlot] = useState<{re: number, im: number} | null>(null);

  const CONSTANTS = [
    { sym: "π", val: "pi", desc: "Pi" },
    { sym: "e", val: "e", desc: "Euler's number" },
    { sym: "φ", val: "phi", desc: "Golden ratio" },
    { sym: "γ", val: "0.577215664901532", desc: "Euler-Mascheroni" },
    { sym: "√2", val: "sqrt(2)", desc: "Square root of 2" },
    { sym: "√3", val: "sqrt(3)", desc: "Square root of 3" },
    { sym: "√5", val: "sqrt(5)", desc: "Square root of 5" },
    { sym: "c", val: "299792458", desc: "Speed of light (m/s)" },
    { sym: "g", val: "9.80665", desc: "Standard gravity (m/s²)" },
    { sym: "G", val: "6.6743e-11", desc: "Gravitational constant" },
    { sym: "ℏ", val: "1.054571817e-34", desc: "Reduced Planck const" },
    { sym: "kB", val: "1.380649e-23", desc: "Boltzmann constant" },
    { sym: "NA", val: "6.02214076e23", desc: "Avogadro's number" },
    { sym: "R", val: "8.314462618", desc: "Gas constant" },
  ];

  const TRIG_IDENTS = [
    "sin²θ + cos²θ = 1",
    "tan²θ + 1 = sec²θ",
    "1 + cot²θ = csc²θ",
    "sin(2θ) = 2sinθ cosθ",
    "cos(2θ) = cos²θ - sin²θ",
    "sin(a±b) = sin a cos b ± cos a sin b",
    "cos(a±b) = cos a cos b ∓ sin a sin b",
    "e^(iθ) = cosθ + i sinθ"
  ];

  const toRad = useCallback((x: any) => {
    if (typeof x === "number") {
      if (angleUnit === "DEG") return x * (Math.PI / 180);
      if (angleUnit === "GRAD") return x * (Math.PI / 200);
    }
    return x;
  }, [angleUnit]);

  const fromRad = useCallback((x: any) => {
    if (typeof x === "number") {
      if (angleUnit === "DEG") return x * (180 / Math.PI);
      if (angleUnit === "GRAD") return x * (200 / Math.PI);
    }
    return x;
  }, [angleUnit]);

  const partitionCache: Record<number, number> = {};
  const getPartitions = (n: number) => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 200) return Infinity; 
    if (partitionCache[n]) return partitionCache[n];
    const p = new Array(n + 1).fill(0);
    p[0] = 1;
    for (let i = 1; i <= n; i++) {
      for (let j = i; j <= n; j++) {
        p[j] += p[j - i];
      }
    }
    partitionCache[n] = p[n];
    return p[n];
  };

  const evalContext = useCallback((s: string) => {
    const scope = {
      sin: (x: any) => Math.sin(toRad(x)),
      cos: (x: any) => Math.cos(toRad(x)),
      tan: (x: any) => Math.tan(toRad(x)),
      sec: (x: any) => 1 / Math.cos(toRad(x)),
      csc: (x: any) => 1 / Math.sin(toRad(x)),
      cot: (x: any) => 1 / Math.tan(toRad(x)),
      asin: (x: any) => fromRad(Math.asin(x)),
      acos: (x: any) => fromRad(Math.acos(x)),
      atan: (x: any) => fromRad(Math.atan(x)),
      atan2: (y: any, x: any) => fromRad(Math.atan2(y, x)),

      DoubleFact: (n: number) => {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = n; i > 0; i -= 2) res *= i;
        return res;
      },
      isPrime: (n: number) => {
        if (!Number.isInteger(n) || n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
           if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
      },
      factors: (n: number) => {
        if (!Number.isInteger(n) || n < 2) return [];
        const f = [];
        let d = 2;
        let temp = n;
        while (temp >= 2 && d * d <= temp) {
          if (temp % d === 0) { f.push(d); temp /= d; }
          else d++;
        }
        if (temp > 1) f.push(temp);
        return f;
      },
      partitions: getPartitions,
      rand: Math.random,
      randint: (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a,
      frac: (x: number) => x - Math.trunc(x),
      clamp: (x: number, min: number, max: number) => Math.min(Math.max(x, min), max)
    };
    
    let expr = s.replace(/ANS/g, `(${lastAnswer})`).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    
    try {
      return evaluate(expr, scope);
    } catch {
      throw new Error("Invalid");
    }
  }, [toRad, fromRad, lastAnswer]);

  const formatOutput = useCallback((val: any) => {
    if (val === undefined || val === null) return "";
    
    if (typeof val === "boolean") return val ? "true" : "false";
    
    if (val && typeof val === 'object' && val.isComplex) {
       setArgzPlot({re: val.re, im: val.im});
       if (complexFormat === "polar") {
         const p = val.toPolar();
         let th = p.phi;
         if (angleUnit === "DEG") th = th * 180 / Math.PI;
         if (angleUnit === "GRAD") th = th * 200 / Math.PI;
         return `${format(p.r, {precision: 8})} ∠ ${format(th, {precision: 8})}°`;
       }
       if (complexFormat === "euler") {
         const p = val.toPolar();
         return `${format(p.r, {precision: 8})}e^(${format(p.phi, {precision: 8})}i)`;
       }
       return val.toString();
    }
    
    setArgzPlot(null);

    if (displayFormat === "fraction") {
      try {
        const frac = evaluate(`fraction(${val})`);
        return frac.n + "/" + frac.d;
      } catch (e) {
        return format(val, { precision: 14 });
      }
    }
    
    if (typeof val === "number") {
      if (!isFinite(val)) return "Undefined";
      return format(val, { precision: 14 });
    }

    if (Array.isArray(val) || val.isMatrix) {
       return format(val, { precision: 10 });
    }

    return String(val);
  }, [displayFormat, complexFormat, angleUnit]);

  useEffect(() => {
    if (!equation && currentInput === "0") {
       setLiveResult("");
       return;
    }
    if (isCalculated) return;
    try {
      const exprStr = (equation + (currentInput !== "0" ? currentInput : "")).trim();
      if (!exprStr) { setLiveResult(""); return; }
      
      const res = evalContext(exprStr.replace(/[+\-*/%^,]$/, ""));
      if (typeof res === "function") return setLiveResult("");
      
      setLiveResult(formatOutput(res));
    } catch (e) {
      setLiveResult("");
    }
  }, [equation, currentInput, isCalculated, evalContext, formatOutput]);

  const handleCalculate = () => {
    if (isCalculated) return;
    try {
      const exprStr = (equation + (currentInput !== "0" && currentInput !== "" ? currentInput : "")).trim();
      const res = evalContext(exprStr.replace(/[+\-*/%^,]$/, ""));
      const fmt = formatOutput(res);
      setCurrentInput(fmt);
      setEquation(exprStr + " =");
      setIsCalculated(true);
      setLastAnswer(typeof res === "number" ? res : res);
      
      addToHistory({
        expression: exprStr,
        result: fmt,
        type: "scientific"
      });
      setErrorStatus("");
    } catch (e) {
      setErrorStatus("Syntax Error");
      setIsCalculated(true);
    }
  };

  const handleInput = (val: string, isFunc: boolean = false) => {
    if (isCalculated) {
      if (isFunc) {
        setEquation(val + "(" + currentInput + ") ");
        setCurrentInput("");
      } else {
        setCurrentInput(val);
        setEquation("");
      }
      setIsCalculated(false);
      setErrorStatus("");
    } else {
      if (currentInput === "0" && !isFunc) {
         setCurrentInput(val);
      } else {
         setCurrentInput(currentInput + val + (isFunc ? "(" : ""));
      }
    }
  };

  const handleOp = (op: string) => {
    if (isCalculated) {
      if (currentInput === "Undefined" || currentInput === "Error") {
        setEquation("0 " + op + " ");
      } else {
        setEquation(currentInput + " " + op + " ");
      }
      setCurrentInput("");
      setIsCalculated(false);
      setErrorStatus("");
    } else {
      const expr = equation + currentInput + " " + op + " ";
      setEquation(expr);
      setCurrentInput("");
    }
  };

  const handleClear = (type: "AC" | "DEL") => {
    if (type === "AC") {
      setEquation("");
      setCurrentInput("0");
      setIsCalculated(false);
      setErrorStatus("");
      setArgzPlot(null);
    } else {
      if (isCalculated) {
        setEquation("");
        setIsCalculated(false);
        setErrorStatus("");
      } else if (currentInput.length > 1) {
        setCurrentInput(currentInput.slice(0,-1));
      } else {
        setCurrentInput("0");
      }
    }
  };

  const renderPadBtn = (action: string, label: React.ReactNode, type: "func" | "num" | "op" = "func", isF: boolean = false) => (
    <button
      onClick={() => {
         if (type === "op") handleOp(action);
         else if (type === "num" || type === "func") handleInput(action, isF);
         if (action === "del") handleClear("DEL");
         if (action === "ac") handleClear("AC");
         if (action === "ans") handleInput("ANS");
         if (action === "=") handleCalculate();
         if (action === ".") {
            if (!currentInput.includes(".")) handleInput(".");
         }
      }}
      className={`h-12 md:h-14 rounded-2xl font-medium text-sm transition-all active:scale-95 shadow-sm border ${
        type === "op" ? "text-primary border-primary/20 bg-primary/10 hover:bg-primary/20" :
        type === "num" ? "bg-card hover:bg-muted font-bold md:text-lg" :
        "bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground"
      } ${action === "=" ? "bg-primary text-primary-foreground border-primary shadow-lg hover:bg-primary/90" : ""}
        ${action === "ac" ? "text-destructive bg-destructive/10 border-destructive/20" : ""}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col xl:flex-row p-4 min-h-0 gap-4 w-full max-w-[1500px] mx-auto h-[calc(100vh-64px)] xl:overflow-hidden relative">
      <div className="flex-1 min-w-[320px] max-w-2xl mx-auto w-full flex flex-col gap-4 relative">
        <div className="bg-card shadow-2xl rounded-[2rem] overflow-hidden flex flex-col ring-1 ring-border border-b border-border/50">
          <div className="bg-muted/10 p-5 min-h-[180px] flex flex-col justify-end gap-2 relative border-b">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(currentInput);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <div className="absolute top-4 left-4 flex gap-2">
              <div className="flex items-center bg-card shadow-sm border p-1 rounded-xl">
                {(["DEG", "RAD", "GRAD"] as AngleUnit[]).map(u => (
                  <button key={u} onClick={() => setAngleUnit(u)} className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${angleUnit === u ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>{u}</button>
                ))}
              </div>
              <div className="flex items-center bg-card shadow-sm border p-1 rounded-xl">
                 <button onClick={() => setDisplayFormat(displayFormat === 'decimal' ? 'fraction' : 'decimal')} className="px-2 py-1 text-[10px] font-bold rounded-lg text-muted-foreground hover:text-foreground bg-muted/50">
                    {displayFormat === 'decimal' ? 'DEC' : 'FRAC'}
                 </button>
              </div>
            </div>

            {errorStatus && (
              <div className="absolute bottom-4 left-4 text-xs font-semibold px-2 py-1 bg-destructive/10 text-destructive rounded-md">
                {errorStatus}
              </div>
            )}

            <div className="text-muted-foreground/80 font-mono text-sm h-6 break-all w-full text-right flex items-center justify-end gap-2 pr-2">
              <span>{equation}</span>
              {!isCalculated && liveResult && (
                <span className="text-muted-foreground/50 text-xs hidden sm:inline-block">
                  = {liveResult}
                </span>
              )}
            </div>
            <div className={`w-full text-right font-light tracking-tighter tabular-nums break-all transition-opacity duration-150 ${errorStatus.includes("Error") ? "text-destructive" : ""} ${
                currentInput.length > 20 ? "text-3xl" : currentInput.length > 12 ? "text-4xl" : "text-5xl md:text-6xl"
              }`} ref={displayRef}>
              {currentInput || "0"}
            </div>
          </div>
          
          <div className="px-4 py-2 bg-muted/30 border-b flex overflow-x-auto scrollbar-hide gap-2">
             {["trig", "func", "comb", "cplx", "advanced"].map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)} 
                 className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors whitespace-nowrap ${activeTab === tab ? "bg-primary/20 text-primary border border-primary/20" : "hover:bg-muted text-muted-foreground"}`}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="p-4 bg-muted/20 min-h-[140px]">
             {activeTab === "trig" && (
                <div className="grid grid-cols-5 gap-2">
                   {renderPadBtn("sin", "sin", "func", true)}
                   {renderPadBtn("cos", "cos", "func", true)}
                   {renderPadBtn("tan", "tan", "func", true)}
                   {renderPadBtn("sec", "sec", "func", true)}
                   {renderPadBtn("csc", "csc", "func", true)}
                   
                   {renderPadBtn("asin", "sin⁻¹", "func", true)}
                   {renderPadBtn("acos", "cos⁻¹", "func", true)}
                   {renderPadBtn("atan", "tan⁻¹", "func", true)}
                   {renderPadBtn("atan2", "atan2", "func", true)}
                   {renderPadBtn("cot", "cot", "func", true)}

                   {renderPadBtn("sinh", "sinh", "func", true)}
                   {renderPadBtn("cosh", "cosh", "func", true)}
                   {renderPadBtn("tanh", "tanh", "func", true)}
                   {renderPadBtn("asinh", "asinh", "func", true)}
                   <button onClick={() => setShowTrigCheatSheet(true)} className="h-12 md:h-14 border rounded-2xl bg-card hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1"><Info className="w-3 h-3"/> IDs</button>
                </div>
             )}

             {activeTab === "func" && (
                <div className="grid grid-cols-5 gap-2">
                   {renderPadBtn('log(', "ln", "func")}
                   {renderPadBtn('log10(', "log₁₀", "func")}
                   {renderPadBtn('log2(', "log₂", "func")}
                   {renderPadBtn('log(', "logₙ(x,n)", "func")}
                   {renderPadBtn("exp", "eˣ", "func", true)}
                   {renderPadBtn("10^", "10ˣ", "func")}

                   {renderPadBtn("sqrt", "√", "func", true)}
                   {renderPadBtn("cbrt", "∛", "func", true)}
                   {renderPadBtn("nthRoot", "ⁿ√", "func", true)}
                   {renderPadBtn("^2", "x²", "func")}
                   {renderPadBtn("^", "xʸ", "op")}
                </div>
             )}

             {activeTab === "comb" && (
                <div className="grid grid-cols-5 gap-2">
                   {renderPadBtn("!", "n!", "func")}
                   {renderPadBtn("DoubleFact", "n!!", "func", true)}
                   {renderPadBtn("permutations", "nPr", "func", true)}
                   {renderPadBtn("combinations", "nCr", "func", true)}
                   {renderPadBtn("partitions", "P(n)", "func", true)}
                   
                   {renderPadBtn("gcd", "GCD", "func", true)}
                   {renderPadBtn("lcm", "LCM", "func", true)}
                   {renderPadBtn("isPrime", "Prime?", "func", true)}
                   {renderPadBtn("factors", "factors", "func", true)}
                   {renderPadBtn("mod", "mod", "op")}
                </div>
             )}

             {activeTab === "cplx" && (
                <div className="grid grid-cols-5 gap-2">
                   {renderPadBtn("i", "i", "num")}
                   {renderPadBtn("re", "Re(z)", "func", true)}
                   {renderPadBtn("im", "Im(z)", "func", true)}
                   {renderPadBtn("arg", "arg(z)", "func", true)}
                   {renderPadBtn("conj", "z̄", "func", true)}
                   
                   <div className="col-span-5 flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-muted-foreground mr-2">CPLX Display:</span>
                      {(["rectangular", "polar", "euler"] as ComplexFormat[]).map(fmt => (
                        <button key={fmt} onClick={() => setComplexFormat(fmt)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${complexFormat === fmt ? 'bg-primary border-primary text-primary-foreground' : 'bg-card hover:bg-muted text-muted-foreground'}`}>{fmt}</button>
                      ))}
                   </div>
                </div>
             )}

             {activeTab === "advanced" && (
                <div className="grid grid-cols-5 gap-2">
                   {renderPadBtn("abs", "|x|", "func", true)}
                   {renderPadBtn("ceil", "ceil", "func", true)}
                   {renderPadBtn("floor", "floor", "func", true)}
                   {renderPadBtn("round", "round", "func", true)}
                   {renderPadBtn("trunc", "trunc", "func", true)}
                   
                   {renderPadBtn("sign", "sign", "func", true)}
                   {renderPadBtn("frac", "frac", "func", true)}
                   {renderPadBtn("min", "min", "func", true)}
                   {renderPadBtn("max", "max", "func", true)}
                   {renderPadBtn("clamp", "clamp", "func", true)}
                   
                   {renderPadBtn("rand", "rand", "func", true)}
                   {renderPadBtn("randint", "randint", "func", true)}
                   <button onClick={() => setShowConstants(true)} className="col-span-2 h-12 md:h-14 border rounded-2xl bg-card hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1">CONSTANTS</button>
                </div>
             )}
          </div>

          <div className="p-4 grid grid-cols-5 gap-2 bg-card">
             {renderPadBtn("7", "7", "num")}
             {renderPadBtn("8", "8", "num")}
             {renderPadBtn("9", "9", "num")}
             {renderPadBtn("del", <Delete className="w-5 h-5 mx-auto"/>, "func")}
             {renderPadBtn("ac", "AC", "func")}

             {renderPadBtn("4", "4", "num")}
             {renderPadBtn("5", "5", "num")}
             {renderPadBtn("6", "6", "num")}
             {renderPadBtn("×", "×", "op")}
             {renderPadBtn("÷", "÷", "op")}

             {renderPadBtn("1", "1", "num")}
             {renderPadBtn("2", "2", "num")}
             {renderPadBtn("3", "3", "num")}
             {renderPadBtn("+", "+", "op")}
             {renderPadBtn("−", "−", "op")}

             {renderPadBtn("0", "0", "num")}
             {renderPadBtn(".", ".", "num")}
             {renderPadBtn(",", ",", "func")}
             {renderPadBtn("ans", "ANS", "func")}
             {renderPadBtn("=", "=", "func")}
             
             {renderPadBtn("(", "(", "func")}
             {renderPadBtn(")", ")", "func")}
             {renderPadBtn("E", "EXP", "func")}
             {renderPadBtn("pi", "π", "num")}
             {renderPadBtn("e", "e", "num")}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-sm flex flex-col gap-4">
        {argzPlot && (
          <div className="bg-card border rounded-[2rem] p-6 shadow-sm flex flex-col items-center">
             <h3 className="text-sm font-bold tracking-tight mb-4 w-full border-b pb-2 text-primary">Argand Diagram (Complex Plane)</h3>
             <div className="relative w-48 h-48 border border-border/50 bg-muted/20 rounded-full flex items-center justify-center isolate">
                {/* Axes */}
                <div className="absolute w-full h-[1px] bg-foreground/20" />
                <div className="absolute h-full w-[1px] bg-foreground/20" />
                
                {/* Labels */}
                <span className="absolute top-1 right-1/2 translate-x-1/2 text-[10px] text-muted-foreground mr-2 -mt-1">Im</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground mb-4">Re</span>

                {/* Point */}
                <div className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_2px_rgba(var(--primary),0.5)] z-10" 
                     style={{
                       left: `calc(50% + ${Math.min(Math.max(argzPlot.re * 20, -100), 100)}px)`, 
                       top: `calc(50% - ${Math.min(Math.max(argzPlot.im * 20, -100), 100)}px)`,
                       transform: 'translate(-50%, -50%)'
                     }} 
                />
             </div>
             <div className="mt-4 text-xs font-mono text-muted-foreground text-center">
                z = {format(argzPlot.re, {precision: 4})} {argzPlot.im >= 0 ? "+" : "-"} {format(Math.abs(argzPlot.im), {precision: 4})}i
             </div>
          </div>
        )}

        <div className="bg-card border rounded-[2rem] p-4 shadow-sm flex-1 flex flex-col xl:h-full overflow-hidden max-h-[500px]">
          <div className="flex justify-between items-center px-2 mb-4 border-b pb-2">
             <h3 className="font-bold flex items-center gap-2 text-sm"><History className="w-4 h-4 text-primary"/> Tape</h3>
             <button onClick={clearHistory} className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition-colors">Clear</button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pr-2 flex flex-col gap-2">
             {history.filter(h => h.type === "scientific").length === 0 ? (
                <div className="text-center text-muted-foreground text-xs mt-10">No scientific history yet</div>
             ) : (
                history.filter(h => h.type === "scientific").slice().reverse().map(item => (
                   <div key={item.id} 
                        className="p-3 bg-muted/40 hover:bg-muted border border-transparent hover:border-border rounded-2xl flex flex-col items-end gap-1 cursor-pointer transition-colors group relative"
                        onClick={() => {
                           setEquation("");
                           setCurrentInput(String(item.result));
                           setIsCalculated(true);
                        }}>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded-md"><X className="w-3 h-3"/></button>
                      <div className="text-xs text-muted-foreground w-full text-right break-all pl-6 font-mono">{item.expression}</div>
                      <div className="text-sm font-bold text-foreground w-full text-right break-all pl-6 font-mono">{item.result}</div>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>

      {showConstants && (
         <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-[2rem] p-6 shadow-2xl border flex flex-col h-[70vh]">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold tracking-tight">Constants</h2>
                 <button onClick={() => setShowConstants(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80"><X className="w-5 h-5"/></button>
               </div>
               <div className="relative mb-4">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                 <input type="text" placeholder="Search constant..." value={searchConstQuery} onChange={(e) => setSearchConstQuery(e.target.value)} className="w-full bg-muted py-2 pl-9 pr-4 rounded-xl text-sm border-none outline-none focus:ring-1 focus:ring-primary/50" />
               </div>
               <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-2 pr-1">
                  {CONSTANTS.filter(c => c.desc.toLowerCase().includes(searchConstQuery.toLowerCase()) || c.sym.toLowerCase().includes(searchConstQuery.toLowerCase())).map(c => (
                     <button key={c.sym} 
                             onClick={() => { handleInput(c.val); setShowConstants(false); }}
                             className="flex flex-col text-left p-3 rounded-xl hover:bg-muted border border-transparent hover:border-border transition-colors">
                        <div className="flex justify-between items-center w-full">
                           <span className="font-serif font-bold text-primary text-xl">{c.sym}</span>
                           <span className="text-xs text-muted-foreground font-mono">{evalContext(c.val).toPrecision(6)}</span>
                        </div>
                        <span className="text-sm text-foreground/80 mt-1">{c.desc}</span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}

      {showTrigCheatSheet && (
         <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-card w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border flex flex-col">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold tracking-tight">Trigonometry Identities</h2>
                 <button onClick={() => setShowTrigCheatSheet(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80"><X className="w-5 h-5"/></button>
               </div>
               <div className="flex flex-col gap-3 mt-2 pr-2 overflow-y-auto max-h-[60vh]">
                  {TRIG_IDENTS.map((id, i) => (
                     <div key={i} className="p-3 bg-muted/40 rounded-xl font-mono text-sm text-center border">
                       {id}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
