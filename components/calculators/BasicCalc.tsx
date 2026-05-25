"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { evaluate, format, typeof as mathTypeof } from "mathjs";
import { useHistoryStore } from "@/store/historyStore";
import { Copy, Trash2, Check, Download, Search, X, History, Calculator, Keyboard, Settings2 } from "lucide-react";
import { format as formatFns, isToday, isYesterday } from "date-fns";
import * as Tooltip from "@radix-ui/react-tooltip";

type SeparatorType = "comma" | "dot" | "space" | "none";

function formatValue(
  val: any,
  precision: number,
  trailingZeros: boolean,
  sep: SeparatorType
): string {
  if (val === undefined || val === null) return "";
  if (typeof val !== "number") return String(val);
  if (!isFinite(val)) return String(val);

  if (Math.abs(val) > 1e15 || (Math.abs(val) < 1e-10 && val !== 0)) {
    return val.toExponential(precision).replace(/\+?0+e/, "e").replace(/\.e/, "e");
  }

  let str = val.toFixed(precision);
  if (!trailingZeros && str.includes(".")) {
    str = str.replace(/0+$/, "").replace(/\.$/, "");
  }

  let [intPart, decPart] = str.split(".");
  let sign = "";
  if (intPart.startsWith("-")) {
    sign = "-";
    intPart = intPart.substring(1);
  }

  if (sep !== "none") {
    const sepChar = sep === "comma" ? "," : sep === "dot" ? "." : " ";
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sepChar);
  }
  const decChar = sep === "dot" ? "," : ".";
  if (decPart !== undefined) {
    return sign + intPart + decChar + decPart;
  }
  return sign + intPart;
}

export function BasicCalc() {
  const [equation, setEquation] = useState("");
  const [currentInput, setCurrentInput] = useState("0");
  const [lastAnswer, setLastAnswer] = useState(0);
  const [liveResult, setLiveResult] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const [integerDivisionMode, setIntegerDivisionMode] = useState(false);

  // Settings
  const [precision, setPrecision] = useState(10);
  const [showTrailingZeros, setShowTrailingZeros] = useState(false);
  const [separator, setSeparator] = useState<SeparatorType>("comma");
  const [showSettings, setShowSettings] = useState(false);

  // Memory
  const [memoryBank, setMemoryBank] = useState<{ name: string; value: number }[]>([
    { name: "M1", value: 0 },
    { name: "M2", value: 0 },
    { name: "M3", value: 0 },
    { name: "M4", value: 0 },
    { name: "M5", value: 0 },
  ]);
  const [activeMemIdx, setActiveMemIdx] = useState(0);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { history, addToHistory, deleteItem, clearHistory } = useHistoryStore();

  const [copied, setCopied] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Undo/Redo
  const [undoStack, setUndoStack] = useState<{ eq: string; inp: string }[]>([]);
  const [redoStack, setRedoStack] = useState<{ eq: string; inp: string }[]>([]);

  const displayRef = useRef<HTMLDivElement>(null);

  const saveStateToUndo = useCallback(() => {
    setUndoStack((prev) => [...prev, { eq: equation, inp: currentInput }].slice(-50));
    setRedoStack([]);
  }, [equation, currentInput]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, { eq: equation, inp: currentInput }]);
    setUndoStack((prev) => prev.slice(0, -1));
    setEquation(last.eq);
    setCurrentInput(last.inp);
    setIsCalculated(false);
    setErrorStatus("");
  }, [undoStack, equation, currentInput]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, { eq: equation, inp: currentInput }]);
    setRedoStack((prev) => prev.slice(0, -1));
    setEquation(next.eq);
    setCurrentInput(next.inp);
    setIsCalculated(false);
    setErrorStatus("");
  }, [redoStack, equation, currentInput]);

  const parseContext = (s: string) => {
    let p = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/mod/g, "%");
    p = p.replace(/ANS/g, `(${lastAnswer})`);
    return p;
  };

  const handleCalculate = useCallback(() => {
    if (isCalculated) return;
    saveStateToUndo();

    if (integerDivisionMode) {
      try {
        const parts = equation.split("÷ rem");
        if (parts.length === 2 && currentInput !== "") {
          const a = evaluate(parseContext(parts[0]));
          const b = evaluate(parseContext(currentInput));
          if (b === 0) {
            setErrorStatus("Division by zero");
            setCurrentInput("Undefined");
            setEquation(equation + " " + currentInput + " =");
            setIsCalculated(true);
            return;
          }
          const q = Math.floor(a / b);
          const r = a % b;
          const fmt = `${formatValue(q, precision, showTrailingZeros, separator)} R ${formatValue(r, precision, showTrailingZeros, separator)}`;
          setCurrentInput(fmt);
          setLastAnswer(q);
          setEquation(equation + " " + currentInput + " =");
          setIsCalculated(true);
          setIntegerDivisionMode(false);
          addToHistory({
            expression: equation + " " + currentInput,
            result: fmt,
            type: "basic",
          });
          return;
        }
      } catch (e) {
        setErrorStatus("Invalid equation");
      }
      return;
    }

    try {
      let exprStr = (equation + (currentInput !== "" ? currentInput : "")).trim();
      if (!exprStr) return;

      if (/[+\-*/%]$/.test(exprStr.replace(/×/g, "*").replace(/÷/g, "/").replace(/mod/g, "%"))) {
        exprStr = exprStr.slice(0, -1);
      }

      const parsed = parseContext(exprStr);
      let res = evaluate(parsed);
      
      if (typeof res === "number") {
        if (!isFinite(res)) {
          setCurrentInput("Undefined");
          if (res > 1e300 || res < -1e300) setErrorStatus("Result too large");
          else setErrorStatus("Division by zero");
          setEquation(equation + currentInput + " =");
          setIsCalculated(true);
          return;
        }
        
        let fmtString = formatValue(res, precision, showTrailingZeros, separator);
        setCurrentInput(fmtString);
        setLastAnswer(res);
        setEquation(equation + currentInput + " =");
        setIsCalculated(true);
        setLiveResult("");
        setErrorStatus("");
        addToHistory({
          expression: exprStr,
          result: fmtString,
          type: "basic",
        });
      } else {
        setCurrentInput(String(res));
        setIsCalculated(true);
      }
    } catch (e) {
      setErrorStatus("Invalid equation");
    }
  }, [isCalculated, equation, currentInput, integerDivisionMode, lastAnswer, precision, showTrailingZeros, separator, saveStateToUndo, addToHistory]);

  const handleNumber = useCallback((num: string) => {
    saveStateToUndo();
    if (isCalculated) {
      setCurrentInput(num);
      setEquation("");
      setIsCalculated(false);
      setErrorStatus("");
    } else {
      if (currentInput === "0" || currentInput === "Undefined" || currentInput === "Error") {
        setCurrentInput(num);
        setErrorStatus("");
      } else {
        if (currentInput.replace(/[^0-9]/g, "").length < 15) {
          setCurrentInput(currentInput + num);
        }
      }
    }
  }, [isCalculated, currentInput, saveStateToUndo]);

  const handleOperator = useCallback((op: string) => {
    saveStateToUndo();
    if (op === "÷ rem") {
      setIntegerDivisionMode(true);
      if (isCalculated) {
        setEquation(currentInput + " ÷ rem ");
        setCurrentInput("");
      } else {
        setEquation(equation + currentInput + " ÷ rem ");
        setCurrentInput("");
      }
      setIsCalculated(false);
      return;
    }

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
      if (currentInput === "" || currentInput === "-") {
        if (equation.length > 0) {
          setEquation(equation.slice(0, -3) + " " + op + " ");
        }
      } else {
        setEquation(equation + currentInput + " " + op + " ");
        setCurrentInput("");
      }
    }
  }, [isCalculated, currentInput, equation, saveStateToUndo]);

  const handleDecimal = useCallback(() => {
    saveStateToUndo();
    if (isCalculated) {
      setCurrentInput("0.");
      setEquation("");
      setIsCalculated(false);
      setErrorStatus("");
    } else {
      if (currentInput === "") {
        setCurrentInput("0.");
      } else if (!currentInput.includes(".")) {
        setCurrentInput(currentInput + ".");
      }
    }
  }, [isCalculated, currentInput, saveStateToUndo]);

  const handleToggleSign = useCallback(() => {
    saveStateToUndo();
    if (isCalculated) {
      if (currentInput !== "0" && currentInput !== "Undefined") {
        const newNum = currentInput.startsWith("-") ? currentInput.slice(1) : "-" + currentInput;
        setCurrentInput(newNum);
        setEquation("");
        setIsCalculated(false);
      }
    } else {
      if (currentInput === "" || currentInput === "0") return;
      if (currentInput.startsWith("-")) {
        setCurrentInput(currentInput.slice(1));
      } else {
        setCurrentInput("-" + currentInput);
      }
    }
  }, [isCalculated, currentInput, saveStateToUndo]);

  const handlePercent = useCallback(() => {
    saveStateToUndo();
    if (currentInput === "" || currentInput === "Undefined") return;
    try {
      const parsed = parseContext(equation ? equation.slice(0, -3) : currentInput);
      const val = Number(currentInput);
      if (!isNaN(val)) {
        // standalone % means val / 100
        const newVal = formatValue(val / 100, precision, showTrailingZeros, separator);
        setCurrentInput(newVal);
      }
    } catch (e) {}
  }, [currentInput, equation, precision, showTrailingZeros, separator, saveStateToUndo]);

  const handleQuickOp = useCallback((op: "recip" | "sq" | "cube") => {
     saveStateToUndo();
     if (currentInput === "" || currentInput === "Undefined") return;
     try {
       const val = Number(currentInput);
       if (!isNaN(val)) {
         let res = 0;
         if (op === "recip") res = 1 / val;
         if (op === "sq") res = val * val;
         if (op === "cube") res = val * val * val;
         
         const fmt = formatValue(res, precision, showTrailingZeros, separator);
         setCurrentInput(fmt);
         if (isCalculated) {
           setEquation("");
           setIsCalculated(false);
           setLastAnswer(res);
         }
       }
     } catch(e) {}
  }, [currentInput, precision, showTrailingZeros, separator, isCalculated, saveStateToUndo]);

  const handleClear = useCallback((type: "AC" | "CE") => {
    saveStateToUndo();
    if (type === "AC") {
      setEquation("");
      setCurrentInput("0");
      setIsCalculated(false);
      setErrorStatus("");
      setLiveResult("");
      setIntegerDivisionMode(false);
    } else {
      setCurrentInput("0");
      if (isCalculated) {
        setEquation("");
        setIsCalculated(false);
      }
      setErrorStatus("");
    }
  }, [isCalculated, saveStateToUndo]);

  const handleBackspace = useCallback(() => {
    saveStateToUndo();
    if (isCalculated) {
      setEquation("");
      setIsCalculated(false);
      setErrorStatus("");
    } else {
      if (currentInput.length > 1) {
        if (currentInput.length === 2 && currentInput.startsWith("-")) {
          setCurrentInput("0");
        } else {
          setCurrentInput(currentInput.slice(0, -1));
        }
      } else if (currentInput.length === 1 && currentInput !== "0") {
        setCurrentInput("0");
      }
    }
  }, [isCalculated, currentInput, saveStateToUndo]);

  const handleAns = useCallback(() => {
    saveStateToUndo();
    setCurrentInput(String(lastAnswer));
    if (isCalculated) {
      setEquation("");
      setIsCalculated(false);
    }
    setErrorStatus("");
  }, [lastAnswer, isCalculated, saveStateToUndo]);

  const handleMemory = useCallback((op: string) => {
    const val = Number(currentInput === "Undefined" ? 0 : currentInput.replace(/,/g, "").replace(/\s/g, ""));
    const newBank = [...memoryBank];

    if (op === "MC") newBank[activeMemIdx].value = 0;
    if (op === "MR") {
      setCurrentInput(String(newBank[activeMemIdx].value));
      if (isCalculated) {
        setEquation("");
        setIsCalculated(false);
      }
    }
    if (op === "M+") newBank[activeMemIdx].value += isNaN(val) ? 0 : val;
    if (op === "M-") newBank[activeMemIdx].value -= isNaN(val) ? 0 : val;
    if (op === "MS") newBank[activeMemIdx].value = isNaN(val) ? 0 : val;

    setMemoryBank(newBank);
  }, [currentInput, isCalculated, memoryBank, activeMemIdx]);

  useEffect(() => {
    if (isCalculated) {
      setLiveResult("");
      return;
    }
    try {
      const exprStr = (equation + currentInput).trim();
      if (!exprStr || exprStr === "-" || equation === "") {
        setLiveResult("");
        return;
      }
      
      if (integerDivisionMode) {
        setLiveResult("");
        return;
      }

      let expr = parseContext(exprStr);
      if (/[+\-*/%]$/.test(expr)) expr = expr.slice(0, -1);
      
      if (!expr) {
        setLiveResult("");
        return;
      }

      const res = evaluate(expr);
      if (typeof res === "number") {
        if (isFinite(res)) {
          setLiveResult(formatValue(res, precision, showTrailingZeros, separator));
        } else {
          setLiveResult("");
        }
      }
    } catch (e) {
      setLiveResult("");
    }
  }, [equation, currentInput, isCalculated, precision, showTrailingZeros, separator, integerDivisionMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (showHistory || showSettings || showMemoryPanel) return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) { e.preventDefault(); handleNumber(key); }
      if (key === "+" || key === "-") { e.preventDefault(); handleOperator(key); }
      if (key === "*" || key === "x") { e.preventDefault(); handleOperator("×"); }
      if (key === "/") { e.preventDefault(); handleOperator("÷"); }
      if (key === "Enter" || key === "=") { e.preventDefault(); handleCalculate(); }
      if (key === ".") { e.preventDefault(); handleDecimal(); }
      if (key === "Backspace") { e.preventDefault(); handleBackspace(); }
      if (key === "Escape") { e.preventDefault(); handleClear("AC"); }
      if (key === "%") { e.preventDefault(); handleOperator("mod"); }
      if (key === "z" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
      if (key === "y" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); redo(); }
      if (key === "?") { e.preventDefault(); setShowShortcuts(true); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleNumber, handleOperator, handleCalculate, handleDecimal,
    handleBackspace, handleClear, undo, redo, showHistory, showSettings, showMemoryPanel
  ]);
  
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text");
      if (text) {
        const numPattern = /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?$/;
        if (numPattern.test(text.trim())) {
          handleNumber(text.trim());
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleNumber]);

  let wheelTimer: NodeJS.Timeout | null = null;
  const handleWheelHistory = (e: React.WheelEvent) => {
      if (e.deltaY < -50 && !showHistory) {
         if (wheelTimer) clearTimeout(wheelTimer);
         wheelTimer = setTimeout(() => {
            setShowHistory(true);
         }, 100);
      }
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row p-4 min-h-0 gap-4 w-full max-w-[1400px] mx-auto h-[calc(100vh-64px)] xl:overflow-hidden relative">
      
      {/* Settings Panel Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card w-full max-w-sm rounded-[2rem] border shadow-2xl p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 bg-muted rounded-full text-foreground/50 hover:text-foreground"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Decimal Precision ({precision})</label>
              <input type="range" min="0" max="15" value={precision} onChange={(e) => setPrecision(Number(e.target.value))} className="w-full" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Thousands Separator</label>
              <select value={separator} onChange={(e) => setSeparator(e.target.value as any)} className="bg-muted p-2 rounded-lg text-sm border-none outline-none">
                <option value="comma">1,000,000.00 (Comma)</option>
                <option value="dot">1.000.000,00 (Dot)</option>
                <option value="space">1 000 000.00 (Space)</option>
                <option value="none">1000000.00 (None)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Trailing Zeros</label>
              <input type="checkbox" checked={showTrailingZeros} onChange={(e) => setShowTrailingZeros(e.target.checked)} className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Calc */}
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-4 relative">
        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
           <div className="flex items-center gap-2">
              <button onClick={() => setShowKeyboardShortcuts(true)} className="p-2 hover:bg-muted rounded-md transition-colors"><Keyboard className="w-4 h-4" /></button>
              <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-muted rounded-md transition-colors"><Settings2 className="w-4 h-4" /></button>
           </div>
           
           <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
             {memoryBank.map((m, idx) => (
                <button
                  key={m.name}
                  onClick={() => setActiveMemIdx(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${idx === activeMemIdx ? "bg-card shadow text-primary" : "text-foreground/50 hover:text-foreground"}`}
                >
                  {m.name} {m.value !== 0 && <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block ml-1" />}
                </button>
             ))}
           </div>
        </div>

        {/* Calc Display */}
        <div 
          className="bg-card border-none shadow-2xl rounded-[2rem] overflow-hidden flex flex-col ring-1 ring-border/50 relative"
          onWheel={handleWheelHistory}
        >
          <div className="bg-primary/[0.03] p-6 min-h-[160px] flex flex-col items-end justify-end gap-2 border-b relative">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(currentInput);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-xl transition-colors text-foreground/40 hover:text-foreground"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {errorStatus && (
              <div className="absolute top-4 left-4 text-xs font-medium text-destructive px-2 py-1 bg-destructive/10 rounded-md">
                {errorStatus}
              </div>
            )}

            <div className="text-muted-foreground/80 font-medium text-sm h-6 break-all w-full text-right flex items-center justify-end gap-2 pr-2">
              <span>{equation}</span>
              {!isCalculated && liveResult && (
                <span className="text-muted-foreground/50 text-xs hidden sm:inline-block">
                  = {liveResult}
                </span>
              )}
            </div>
            <div
              className={`w-full text-right font-light tracking-tighter tabular-nums break-all transition-opacity duration-150 ${errorStatus.includes("Error") ? "text-destructive" : ""} ${
                currentInput.length > 14 ? "text-3xl" : currentInput.length > 10 ? "text-4xl" : "text-5xl"
              }`}
            >
              <div className="overflow-x-auto scrollbar-hide w-full" ref={displayRef}>
                {currentInput || "0"}
              </div>
            </div>
          </div>

          {/* Memory Row */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b text-xs font-bold text-foreground/70">
              <button onClick={() => handleMemory("MC")} disabled={memoryBank[activeMemIdx].value === 0} className="hover:text-foreground flex-1 disabled:opacity-30">MC</button>
              <button onClick={() => handleMemory("MR")} disabled={memoryBank[activeMemIdx].value === 0} className="hover:text-foreground flex-1 disabled:opacity-30">MR</button>
              <button onClick={() => handleMemory("M+")} className="hover:text-foreground flex-1">M+</button>
              <button onClick={() => handleMemory("M-")} className="hover:text-foreground flex-1">M-</button>
              <button onClick={() => handleMemory("MS")} className="hover:text-foreground flex-1 text-primary">MS</button>
          </div>

          {/* Keypad */}
          <div className="p-4 grid grid-cols-4 gap-2 sm:gap-3 bg-muted/40">
             {/* Extra functions row */}
             <button onClick={() => handleQuickOp("recip")} className="py-3 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-sm">1/x</button>
             <button onClick={() => handleQuickOp("sq")} className="py-3 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-sm">x²</button>
             <button onClick={() => handleOperator("mod")} className="py-3 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-sm">mod</button>
             <button onClick={() => handleOperator("÷ rem")} className="py-3 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-sm">÷ rem</button>

            <button onClick={handlePercent} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-lg">%</button>
            <button onClick={() => handleClear("CE")} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-lg text-primary">CE</button>
            <button onDoubleClick={() => handleClear("AC")} onClick={() => handleClear("AC")} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-lg text-destructive">AC</button>
            <button onClick={handleBackspace} className="py-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors font-medium text-lg text-primary flex items-center justify-center">⌫</button>

            {[7, 8, 9].map((num) => (
              <button key={num} onClick={() => handleNumber(String(num))} className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl">{num}</button>
            ))}
            <button onClick={() => handleOperator("÷")} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-2xl text-primary font-mono">÷</button>

            {[4, 5, 6].map((num) => (
              <button key={num} onClick={() => handleNumber(String(num))} className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl">{num}</button>
            ))}
            <button onClick={() => handleOperator("×")} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl text-primary font-mono">×</button>

            {[1, 2, 3].map((num) => (
              <button key={num} onClick={() => handleNumber(String(num))} className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl">{num}</button>
            ))}
            <button onClick={() => handleOperator("-")} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-2xl text-primary font-mono">−</button>

            <button onClick={handleToggleSign} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl">±</button>
            <button onClick={() => handleNumber("0")} className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl">0</button>
            <button onClick={handleDecimal} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-2xl font-mono">.</button>
            <button onClick={() => handleOperator("+")} className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-2xl text-primary font-mono">+</button>

            <button onClick={handleAns} className="col-span-2 py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-sm tracking-wider uppercase">ANS</button>
            <button onClick={handleCalculate} className="col-span-2 py-4 rounded-[1.25rem] bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg text-2xl">=</button>
          </div>
        </div>
      </div>

       {/* Mobile History Toggle */}
       <div className="xl:hidden w-full flex justify-center mt-2">
         <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-6 py-2 bg-card rounded-full border shadow-sm text-sm font-medium">
           <History className="w-4 h-4" /> View History
         </button>
       </div>

      {/* History Side Panel */}
      <div className={`xl:relative absolute right-0 top-0 bottom-0 z-40 bg-card/95 backdrop-blur shadow-2xl xl:shadow-none border-l xl:border border-border/50 transition-transform duration-300 xl:translate-x-0 ${showHistory ? "translate-x-0" : "translate-x-[120%]"} w-full md:w-80 xl:w-96 p-6 xl:rounded-[2rem] flex flex-col gap-4 h-full xl:h-auto`}>
         <div className="flex justify-between items-center">
            <h3 className="font-bold tracking-tight text-lg flex items-center gap-2"><History className="w-5 h-5 text-primary" /> History Log</h3>
            <div className="flex gap-2">
              <button onClick={() => setShowHistory(false)} className="xl:hidden p-2 bg-muted rounded-full hover:bg-muted/80"><X className="w-4 h-4"/></button>
            </div>
         </div>
         
         <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input type="text" placeholder="Search history..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-muted pl-9 pr-4 py-2 rounded-xl text-sm border-none outline-none focus:ring-1 ring-primary/50" />
         </div>

         <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4 scrollbar-hide pr-2">
            {history.filter(h => h.type === "basic" && (h.expression.includes(searchQuery) || String(h.result).includes(searchQuery))).slice().reverse().map(item => (
                <div key={item.id} className="relative group p-4 rounded-2xl bg-muted/40 border hover:border-primary/30 transition-colors cursor-pointer flex flex-col gap-1 items-end"
                     onClick={() => {
                        setEquation("");
                        setCurrentInput(String(item.result));
                        setIsCalculated(true);
                     }}>
                    <span className="text-[10px] text-foreground/40 absolute top-3 left-4">{formatFns(item.timestamp, "MMM d, yyyy HH:mm")}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                    
                    <div className="text-foreground/60 text-sm mt-3 w-full text-right break-all">{item.expression}</div>
                    <div className="text-foreground font-bold text-xl w-full text-right break-all break-words">{item.result}</div>
                </div>
            ))}
            {history.filter(h => h.type === "basic").length === 0 && (
                <div className="text-center text-foreground/40 mt-10 text-sm">No history yet</div>
            )}
         </div>

         <div className="pt-4 border-t flex justify-between">
            <button onClick={() => {
              const data = history.filter(h => h.type === "basic").map(h => `${formatFns(h.timestamp, "yyyy-MM-dd HH:mm")}: ${h.expression} = ${h.result}`).join("\n");
              const blob = new Blob([data], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "calc-history.txt";
              a.click();
            }} className="p-2 hover:bg-muted rounded-xl text-primary"><Download className="w-5 h-5"/></button>
            <button onClick={clearHistory} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors">Clear All</button>
         </div>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
           <div className="bg-card w-full max-w-sm rounded-[2rem] p-6 flex flex-col gap-4 border shadow-2xl">
             <div className="flex justify-between items-center"><h3 className="font-bold">Keyboard Shortcuts</h3><button onClick={() => setShowShortcuts(false)}><X className="w-5 h-5"/></button></div>
             <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div className="flex justify-between border-b pb-2"><span>Num Pad</span><span className="font-mono bg-muted px-2 py-0.5 rounded">0-9</span></div>
                <div className="flex justify-between border-b pb-2"><span>Operators</span><span className="font-mono bg-muted px-2 py-0.5 rounded">+-*/</span></div>
                <div className="flex justify-between border-b pb-2"><span>Calculate</span><span className="font-mono bg-muted px-2 py-0.5 rounded">Enter</span></div>
                <div className="flex justify-between border-b pb-2"><span>Backspace</span><span className="font-mono bg-muted px-2 py-0.5 rounded">Bksp</span></div>
                <div className="flex justify-between border-b pb-2"><span>Clear All</span><span className="font-mono bg-muted px-2 py-0.5 rounded">Esc</span></div>
                <div className="flex justify-between border-b pb-2"><span>Undo</span><span className="font-mono bg-muted px-2 py-0.5 rounded">Ctrl+Z</span></div>
                <div className="flex justify-between border-b pb-2"><span>Modulo</span><span className="font-mono bg-muted px-2 py-0.5 rounded">%</span></div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
