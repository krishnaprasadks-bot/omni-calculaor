"use client";

import { useState, useEffect, useCallback } from "react";
import { evaluate, format } from "mathjs";

export function BasicCalc() {
  const [equation, setEquation] = useState("");
  const [currentInput, setCurrentInput] = useState("0");
  const [memory, setMemory] = useState(0);
  const [lastAnswer, setLastAnswer] = useState(0);
  const [liveResult, setLiveResult] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const [memoryRecallAnim, setMemoryRecallAnim] = useState(false);

  const handleCalculate = useCallback(() => {
    if (isCalculated) return;
    try {
      let exprString = (
        equation + (currentInput !== "" ? currentInput : "")
      ).trim();
      if (!exprString) return;

      exprString = exprString.replace(/×/g, "*").replace(/÷/g, "/");
      if (/[+\-*/]$/.test(exprString)) {
        exprString = exprString.slice(0, -1);
      }

      const res = evaluate(exprString);
      if (typeof res === "number") {
        if (!isFinite(res)) {
          setCurrentInput("Undefined");
          setEquation(equation + currentInput + " = ");
          setIsCalculated(true);
          setErrorStatus("Division by zero");
          return;
        }
        const formatted = format(res, { precision: 15 });
        setCurrentInput(String(formatted));
        setLastAnswer(Number(res));
        setEquation(equation + currentInput + " =");
        setIsCalculated(true);
        setLiveResult("");
        setErrorStatus("");
      } else {
        setCurrentInput(String(res));
        setIsCalculated(true);
      }
    } catch (e) {
      setErrorStatus("Invalid equation");
    }
  }, [equation, currentInput, isCalculated]);

  const handleNumber = useCallback(
    (num: string) => {
      if (isCalculated) {
        setCurrentInput(num);
        setEquation("");
        setIsCalculated(false);
        setErrorStatus("");
      } else {
        if (
          currentInput === "0" ||
          currentInput === "Undefined" ||
          currentInput === "Error"
        ) {
          setCurrentInput(num);
          setErrorStatus("");
        } else {
          if (currentInput.replace(/[^0-9]/g, "").length < 15) {
            setCurrentInput(currentInput + num);
          }
        }
      }
    },
    [isCalculated, currentInput],
  );

  const handleOperator = useCallback(
    (op: string) => {
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
    },
    [isCalculated, currentInput, equation],
  );

  const handleDecimal = useCallback(() => {
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
  }, [isCalculated, currentInput]);

  const handleToggleSign = useCallback(() => {
    if (isCalculated) {
      if (currentInput !== "0" && currentInput !== "Undefined") {
        const newNum = currentInput.startsWith("-")
          ? currentInput.slice(1)
          : "-" + currentInput;
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
  }, [isCalculated, currentInput]);

  const handlePercent = useCallback(() => {
    if (currentInput === "" || currentInput === "Undefined") return;
    try {
      const val = Number(currentInput);
      if (!isNaN(val)) {
        const newVal = format(val / 100, { precision: 15 });
        setCurrentInput(String(newVal));
        if (isCalculated) {
          setEquation("");
          setIsCalculated(false);
        }
      }
    } catch (e) {}
  }, [currentInput, isCalculated]);

  const handleClear = useCallback(
    (type: "AC" | "CE") => {
      if (type === "AC") {
        setEquation("");
        setCurrentInput("0");
        setIsCalculated(false);
        setErrorStatus("");
        setLiveResult("");
      } else {
        setCurrentInput("0");
        if (isCalculated) {
          setEquation("");
          setIsCalculated(false);
        }
        setErrorStatus("");
      }
    },
    [isCalculated],
  );

  const handleBackspace = useCallback(() => {
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
  }, [isCalculated, currentInput]);

  const handleAns = useCallback(() => {
    setCurrentInput(String(format(lastAnswer, { precision: 15 })));
    if (isCalculated) {
      setEquation("");
      setIsCalculated(false);
    }
    setErrorStatus("");
  }, [lastAnswer, isCalculated]);

  const handleMemory = useCallback(
    (op: string) => {
      const val = Number(currentInput || liveResult || 0);
      if (isNaN(val)) return;

      if (op === "MC") setMemory(0);
      if (op === "MR") {
        setCurrentInput(String(format(memory, { precision: 15 })));
        if (isCalculated) {
          setEquation("");
          setIsCalculated(false);
        }
        setMemoryRecallAnim(true);
        setTimeout(() => setMemoryRecallAnim(false), 200);
      }
      if (op === "M+") setMemory(memory + val);
      if (op === "M-") setMemory(memory - val);
      if (op === "MS") setMemory(val);
    },
    [currentInput, liveResult, memory, isCalculated],
  );

  useEffect(() => {
    if (isCalculated) {
      setLiveResult("");
      return;
    }
    try {
      const exprString = (equation + currentInput).trim();
      if (!exprString || exprString === "-" || equation === "") {
        setLiveResult("");
        return;
      }
      let expr = exprString.replace(/×/g, "*").replace(/÷/g, "/");

      if (/[+\-*/]$/.test(expr)) {
        expr = expr.slice(0, -1);
      }

      if (!expr) {
        setLiveResult("");
        return;
      }

      const res = evaluate(expr);
      if (typeof res === "number") {
        if (!isFinite(res)) {
          setLiveResult("");
        } else {
          setLiveResult(format(res, { precision: 15 }));
        }
      }
    } catch (e) {
      setLiveResult("");
    }
  }, [equation, currentInput, isCalculated]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleNumber(key);
      }
      if (key === "+" || key === "-") {
        e.preventDefault();
        handleOperator(key);
      }
      if (key === "*" || key === "x") {
        e.preventDefault();
        handleOperator("×");
      }
      if (key === "/") {
        e.preventDefault();
        handleOperator("÷");
      }
      if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalculate();
      }
      if (key === ".") {
        e.preventDefault();
        handleDecimal();
      }
      if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      }
      if (key === "Escape") {
        e.preventDefault();
        handleClear("AC");
      }
      if (key === "%") {
        e.preventDefault();
        handlePercent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleNumber,
    handleOperator,
    handleCalculate,
    handleDecimal,
    handleBackspace,
    handleClear,
    handlePercent,
  ]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-full">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
        {/* Memory Row */}
        <div className="flex items-center justify-between px-2 text-xs font-medium text-muted-foreground/80">
          <button
            onClick={() => handleMemory("MC")}
            disabled={memory === 0}
            className="hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1 bg-card border rounded shadow-sm"
          >
            MC
          </button>
          <button
            onClick={() => handleMemory("MR")}
            disabled={memory === 0}
            className="hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1 bg-card border rounded shadow-sm"
          >
            MR
          </button>
          <button
            onClick={() => handleMemory("M+")}
            className="hover:text-foreground transition-colors px-3 py-1 bg-card border rounded shadow-sm"
          >
            M+
          </button>
          <button
            onClick={() => handleMemory("M-")}
            className="hover:text-foreground transition-colors px-3 py-1 bg-card border rounded shadow-sm"
          >
            M-
          </button>
          <button
            onClick={() => handleMemory("MS")}
            className="hover:text-foreground transition-colors px-3 py-1 bg-card border rounded shadow-sm"
          >
            MS
          </button>
        </div>

        {/* Selected Memory Indicator */}
        <div className="h-4 flex items-center justify-end px-2 text-xs font-bold text-primary">
          {memory !== 0 ? `M = ${format(memory, { precision: 10 })}` : ""}
        </div>

        <div className="bg-card border-none shadow-2xl rounded-3xl overflow-hidden flex flex-col ring-1 ring-border/50">
          {/* Display */}
          <div className="bg-primary/[0.03] p-6 min-h-[160px] flex flex-col items-end justify-end gap-2 border-b relative">
            {errorStatus && (
              <div className="absolute top-4 left-4 text-xs font-medium text-destructive px-2 py-1 bg-destructive/10 rounded-md">
                {errorStatus}
              </div>
            )}

            <div className="text-muted-foreground/80 font-medium text-sm h-6 break-all w-full text-right flex items-center justify-end gap-2">
              <span>{equation}</span>
              {!isCalculated && liveResult && (
                <span className="text-muted-foreground/50 text-xs hidden sm:inline-block">
                  = {liveResult}
                </span>
              )}
            </div>
            <div
              className={`w-full text-right font-light tracking-tighter tabular-nums break-all transition-opacity duration-150 ${memoryRecallAnim ? "opacity-30" : "opacity-100"} ${
                currentInput.length > 12 ? "text-4xl" : "text-5xl"
              }`}
            >
              {currentInput || "0"}
            </div>
          </div>

          {/* Keypad */}
          <div className="p-4 grid grid-cols-4 gap-3 bg-muted/40">
            <button
              onClick={handlePercent}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-lg"
            >
              %
            </button>
            <button
              onClick={() => handleClear("CE")}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-lg text-primary"
            >
              CE
            </button>
            <button
              onClick={() => handleClear("AC")}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-lg text-destructive"
            >
              AC
            </button>
            <button
              onClick={handleBackspace}
              className="py-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors font-medium text-lg text-primary flex items-center justify-center"
            >
              ⌫
            </button>

            {[7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(String(num))}
                className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleOperator("÷")}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl text-primary"
            >
              ÷
            </button>

            {[4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(String(num))}
                className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleOperator("×")}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl text-primary"
            >
              ×
            </button>

            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(String(num))}
                className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleOperator("-")}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl text-primary"
            >
              −
            </button>

            <button
              onClick={handleToggleSign}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl"
            >
              ±
            </button>
            <button
              onClick={() => handleNumber("0")}
              className="py-4 rounded-xl bg-card/60 border hover:bg-muted transition-colors font-semibold text-xl"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl"
            >
              .
            </button>
            <button
              onClick={() => handleOperator("+")}
              className="py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-xl text-primary"
            >
              +
            </button>

            <button
              onClick={handleAns}
              className="col-span-2 py-4 rounded-xl bg-card border shadow-sm hover:bg-muted transition-colors font-medium text-sm tracking-wider uppercase"
            >
              ANS
            </button>
            <button
              onClick={handleCalculate}
              className="col-span-2 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-md text-xl"
            >
              =
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
