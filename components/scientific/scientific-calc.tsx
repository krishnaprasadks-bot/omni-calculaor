"use client";

import { useState, useEffect, useRef } from "react";
import { create, all } from "mathjs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Delete, Check } from "lucide-react";

const math = create(all, {});

type AngleUnit = "DEG" | "RAD" | "GRAD";

const Btn = ({ onClick, children, variant = 'default', className = "" }: any) => {
  const vClass = variant === 'secondary' ? 'bg-muted hover:bg-muted/80 text-foreground' : 
                 variant === 'primary' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 
                 variant === 'danger' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' :
                 'bg-card border hover:bg-muted text-foreground';
  return (
    <button onClick={onClick} className={`py-4 px-2 rounded-2xl text-sm md:text-base font-medium transition-colors shadow-sm active:scale-95 ${vClass} ${className}`}>
      {children}
    </button>
  );
}

export function ScientificCalc() {
  const [equation, setEquation] = useState("");
  const [liveResult, setLiveResult] = useState("");
  const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>("RAD");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const evaluateEquation = (expr: string) => {
    if (!expr.trim()) return "";
    try {
      const toRad = (x: any) => {
        if (typeof x === "number") {
          if (angleUnit === "DEG") return x * (Math.PI / 180);
          if (angleUnit === "GRAD") return x * (Math.PI / 200);
        }
        return x;
      };
      const fromRad = (x: any) => {
        if (typeof x === "number") {
          if (angleUnit === "DEG") return x * (180 / Math.PI);
          if (angleUnit === "GRAD") return x * (200 / Math.PI);
        }
        return x;
      };

      const scope = {
        sin: (x: any) => math.sin(toRad(x)),
        cos: (x: any) => math.cos(toRad(x)),
        tan: (x: any) => math.tan(toRad(x)),
        sec: (x: any) => math.sec(toRad(x)),
        csc: (x: any) => math.csc(toRad(x)),
        cot: (x: any) => math.cot(toRad(x)),
        asin: (x: any) => fromRad(math.asin(x)),
        acos: (x: any) => fromRad(math.acos(x)),
        atan: (x: any) => fromRad(math.atan(x)),
        atan2: (y: any, x: any) => fromRad(math.atan2(y, x)),
        
        ln: math.log,
        log: math.log10,
        log2: math.log2,
        logn: (x: any, b: any) => math.log(x, b),
        
        P: (n: any, k: any) => math.permutations(n, k),
        C: (n: any, k: any) => math.combinations(n, k),
        doubleFactorial: (n: number) => {
          if (n < 0) return NaN;
          if (n === 0 || n === 1) return 1;
          let res = 1;
          for (let i = n; i > 0; i -= 2) res *= i;
          return res;
        },
        
        gamma: 0.5772156649015329,
        c: 299792458,
        g: 9.80665,
        hbar: 1.054571817e-34,
        sqrt2: Math.SQRT2,
        sqrt3: Math.sqrt(3),

        isPrime: (n: number) => {
          if (!Number.isInteger(n) || n <= 1) return false;
          if (n <= 3) return true;
          if (n % 2 === 0 || n % 3 === 0) return false;
          for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
          }
          return true;
        },
        primeFactors: (n: number) => {
          if (!Number.isInteger(n) || n < 2) return [];
          const factors = [];
          let divisor = 2;
          let temp = n;
          while (temp >= 2 && divisor * divisor <= temp) {
            if (temp % divisor === 0) {
              factors.push(divisor);
              temp = temp / divisor;
            } else {
              divisor++;
            }
          }
          if (temp > 1) factors.push(temp);
          return factors;
        },
        
        polar: (x: any) => {
          const c = math.complex(x);
          return `r: ${math.round(c.toPolar().r, 6)}, φ: ${math.round(c.toPolar().phi, 6)} rad`;
        }
      };

      const result = math.evaluate(expr, scope);
      
      if (typeof result === "function") return "";
      
      if (Array.isArray(result) || result?.isMatrix) {
         return math.format(result, { precision: 14 });
      }
      
      if (typeof result === "object") {
         if (result.isComplex) {
            return math.format(result, { precision: 14 });
         }
      }
      
      if (typeof result === "number") {
         return math.format(result, { precision: 14 });
      }
      if (typeof result === "string") return result;

      return String(result);
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    const res = evaluateEquation(equation);
    setLiveResult(res);
  }, [equation, angleUnit]);

  const handleCalculate = () => {
    const res = evaluateEquation(equation);
    if (res && res !== "") {
      setHistory(prev => [...prev, { eq: equation, res }]);
      setEquation(res);
      setLiveResult("");
      inputRef.current?.focus();
    }
  };

  const insertText = (text: string, cursorOffset: number = 0) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || equation.length;
      const end = inputRef.current.selectionEnd || equation.length;
      const newEq = equation.substring(0, start) + text + equation.substring(end);
      setEquation(newEq);
      
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = start + text.length + cursorOffset;
          inputRef.current.selectionStart = newPos;
          inputRef.current.selectionEnd = newPos;
          inputRef.current.focus();
        }
      }, 0);
    } else {
      setEquation(equation + text);
    }
  };

  const insertFunc = (func: string) => insertText(`${func}()`, -1);

  const copyResult = () => {
    if (liveResult || equation) {
      navigator.clipboard.writeText(liveResult || equation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Top Display Panel */}
      <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden ring-1 ring-border/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center bg-muted/50 p-1 rounded-xl">
            {(['DEG', 'RAD', 'GRAD'] as AngleUnit[]).map(unit => (
              <button 
                key={unit} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${angleUnit === unit ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setAngleUnit(unit)}
              >
                 {unit}
              </button>
            ))}
          </div>
          <button onClick={copyResult} className="p-2.5 bg-muted/50 hover:bg-muted rounded-xl text-muted-foreground transition-colors" title="Copy Result">
            {copied ? <Check className="w-4 h-4 text-emerald-600"/> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-right flex flex-col gap-2 min-h-[140px] justify-end mt-2">
          {history.length > 0 && (
            <div className="text-sm text-muted-foreground mb-4 opacity-70 flex flex-col gap-1 items-end max-h-[120px] overflow-y-auto w-full font-mono">
              {history.slice(-3).map((h, i) => (
                 <div key={i} className="flex gap-2">
                   <span>{h.eq} =</span>
                   <span className="font-bold text-foreground">{h.res}</span>
                 </div>
              ))}
            </div>
          )}

          <input 
            ref={inputRef}
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="w-full text-right bg-transparent text-4xl md:text-5xl font-light tracking-tighter outline-none placeholder:text-muted-foreground/30 font-mono"
            placeholder="0"
            spellCheck="false"
            autoComplete="off"
          />
          <div className="text-primary font-medium text-xl min-h-[28px] font-mono">
            {liveResult ? `= ${liveResult}` : ""}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Advanced Panel */}
        <div className="bg-card border rounded-3xl p-4 md:p-6 shadow-sm col-span-1">
           <Tabs defaultValue="trig" className="w-full flex justify-between flex-col h-full">
               <TabsList className="w-full flex-wrap justify-start h-auto bg-muted/30 p-1.5 rounded-xl gap-1">
                 <TabsTrigger value="trig" className="text-xs rounded-lg py-1.5 px-3">Trig</TabsTrigger>
                 <TabsTrigger value="logexp" className="text-xs rounded-lg py-1.5 px-3">Log/Exp</TabsTrigger>
                 <TabsTrigger value="comb" className="text-xs rounded-lg py-1.5 px-3">Comb</TabsTrigger>
                 <TabsTrigger value="numthy" className="text-xs rounded-lg py-1.5 px-3">Num/Th</TabsTrigger>
                 <TabsTrigger value="const" className="text-xs rounded-lg py-1.5 px-3">Const</TabsTrigger>
                 <TabsTrigger value="complex" className="text-xs rounded-lg py-1.5 px-3">Cplx</TabsTrigger>
               </TabsList>
               
               <div className="mt-4 flex-1">
                 <TabsContent value="trig" className="outline-none m-0">
                   <div className="grid grid-cols-4 gap-2">
                     <Btn onClick={() => insertFunc('sin')} variant="secondary">sin</Btn>
                     <Btn onClick={() => insertFunc('cos')} variant="secondary">cos</Btn>
                     <Btn onClick={() => insertFunc('tan')} variant="secondary">tan</Btn>
                     <Btn onClick={() => insertFunc('cot')} variant="secondary">cot</Btn>
                     
                     <Btn onClick={() => insertFunc('sec')} variant="secondary">sec</Btn>
                     <Btn onClick={() => insertFunc('csc')} variant="secondary">csc</Btn>
                     <Btn onClick={() => insertFunc('asin')} variant="secondary">sin⁻¹</Btn>
                     <Btn onClick={() => insertFunc('acos')} variant="secondary">cos⁻¹</Btn>
                     
                     <Btn onClick={() => insertFunc('atan')} variant="secondary">tan⁻¹</Btn>
                     <Btn onClick={() => insertText('atan2(, )', -3)} variant="secondary">atan2</Btn>
                     <Btn onClick={() => insertFunc('sinh')} variant="secondary">sinh</Btn>
                     <Btn onClick={() => insertFunc('cosh')} variant="secondary">cosh</Btn>
                     
                     <Btn onClick={() => insertFunc('tanh')} variant="secondary">tanh</Btn>
                     <Btn onClick={() => insertFunc('asinh')} variant="secondary">sinh⁻¹</Btn>
                     <Btn onClick={() => insertFunc('acosh')} variant="secondary">cosh⁻¹</Btn>
                     <Btn onClick={() => insertFunc('atanh')} variant="secondary">tanh⁻¹</Btn>
                   </div>
                 </TabsContent>

                 <TabsContent value="logexp" className="outline-none m-0">
                   <div className="grid grid-cols-4 gap-2">
                     <Btn onClick={() => insertFunc('ln')} variant="secondary">ln</Btn>
                     <Btn onClick={() => insertFunc('log')} variant="secondary">log₁₀</Btn>
                     <Btn onClick={() => insertFunc('log2')} variant="secondary">log₂</Btn>
                     <Btn onClick={() => insertText('logn(, )', -3)} variant="secondary">logₙ</Btn>
                     
                     <Btn onClick={() => insertText('e^')} variant="secondary">eˣ</Btn>
                     <Btn onClick={() => insertText('10^')} variant="secondary">10ˣ</Btn>
                     <Btn onClick={() => insertText('2^')} variant="secondary">2ˣ</Btn>
                     <Btn onClick={() => insertText('^')} variant="secondary">xʸ</Btn>
                     
                     <Btn onClick={() => insertFunc('sqrt')} variant="secondary">√</Btn>
                     <Btn onClick={() => insertFunc('cbrt')} variant="secondary">∛</Btn>
                     <Btn onClick={() => insertText('nthRoot(, )', -3)} variant="secondary">ⁿ√</Btn>
                   </div>
                 </TabsContent>

                 <TabsContent value="comb" className="outline-none m-0">
                    <div className="grid grid-cols-4 gap-2">
                      <Btn onClick={() => insertText('!')} variant="secondary">n!</Btn>
                      <Btn onClick={() => insertText('P(, )', -3)} variant="secondary">nPr</Btn>
                      <Btn onClick={() => insertText('C(, )', -3)} variant="secondary">nCr</Btn>
                      <Btn onClick={() => insertFunc('doubleFactorial')} variant="secondary">n!!</Btn>
                    </div>
                 </TabsContent>

                 <TabsContent value="const" className="outline-none m-0">
                   <div className="grid grid-cols-4 gap-2 font-serif text-lg">
                     <Btn onClick={() => insertText('pi')} variant="secondary">π</Btn>
                     <Btn onClick={() => insertText('e')} variant="secondary">e</Btn>
                     <Btn onClick={() => insertText('phi')} variant="secondary">φ</Btn>
                     <Btn onClick={() => insertText('gamma')} variant="secondary">γ</Btn>
                     <Btn onClick={() => insertText('sqrt2')} variant="secondary">√2</Btn>
                     <Btn onClick={() => insertText('sqrt3')} variant="secondary">√3</Btn>
                     <Btn onClick={() => insertText('c')} variant="secondary">c</Btn>
                     <Btn onClick={() => insertText('g')} variant="secondary">g</Btn>
                     <Btn onClick={() => insertText('hbar')} variant="secondary">ℏ</Btn>
                   </div>
                 </TabsContent>

                 <TabsContent value="numthy" className="outline-none m-0">
                   <div className="grid grid-cols-4 gap-2">
                     <Btn onClick={() => insertText('gcd(, )', -3)} variant="secondary">GCD</Btn>
                     <Btn onClick={() => insertText('lcm(, )', -3)} variant="secondary">LCM</Btn>
                     <Btn onClick={() => insertText(' mod ')} variant="secondary">mod</Btn>
                     <Btn onClick={() => insertFunc('isPrime')} variant="secondary">prime?</Btn>
                     <Btn onClick={() => insertFunc('primeFactors')} variant="secondary">factors</Btn>
                     <Btn onClick={() => insertFunc('abs')} variant="secondary">|x|</Btn>
                     <Btn onClick={() => insertFunc('ceil')} variant="secondary">ceil</Btn>
                     <Btn onClick={() => insertFunc('floor')} variant="secondary">floor</Btn>
                     <Btn onClick={() => insertFunc('round')} variant="secondary">round</Btn>
                   </div>
                 </TabsContent>

                 <TabsContent value="complex" className="outline-none m-0">
                   <div className="grid grid-cols-4 gap-2">
                     <Btn onClick={() => insertText('i')} variant="secondary">i</Btn>
                     <Btn onClick={() => insertFunc('re')} variant="secondary">Re(x)</Btn>
                     <Btn onClick={() => insertFunc('im')} variant="secondary">Im(x)</Btn>
                     <Btn onClick={() => insertFunc('arg')} variant="secondary">arg(x)</Btn>
                     <Btn onClick={() => insertFunc('conj')} variant="secondary">conj(x)</Btn>
                     <Btn onClick={() => insertFunc('polar')} variant="secondary">polar</Btn>
                   </div>
                 </TabsContent>
               </div>
           </Tabs>
        </div>

        {/* Basic Numpad Panel */}
        <div className="bg-card border rounded-3xl p-4 md:p-6 shadow-sm col-span-1 border-primary/20 bg-gradient-to-b from-card to-muted/20">
           <div className="grid grid-cols-4 gap-3">
             <Btn onClick={() => {
                 setEquation('');
                 setLiveResult('');
             }} variant="danger">AC</Btn>
             <Btn onClick={() => {
                 if(inputRef.current) {
                    const s = inputRef.current.selectionStart || equation.length;
                    if (s > 0) {
                       const newEq = equation.substring(0, s - 1) + equation.substring(inputRef.current.selectionEnd || s);
                       setEquation(newEq);
                       setTimeout(() => {
                          inputRef.current!.selectionStart = s - 1;
                          inputRef.current!.selectionEnd = s - 1;
                          inputRef.current!.focus();
                       }, 0);
                    }
                 }
             }} variant="secondary"><Delete className="w-5 h-5 mx-auto"/></Btn>
             
             <Btn onClick={() => insertText('(')} variant="secondary">(</Btn>
             <Btn onClick={() => insertText(')')} variant="secondary">)</Btn>

             <Btn onClick={() => insertText('7')} className="text-xl">7</Btn>
             <Btn onClick={() => insertText('8')} className="text-xl">8</Btn>
             <Btn onClick={() => insertText('9')} className="text-xl">9</Btn>
             <Btn onClick={() => insertText(' / ')} variant="secondary" className="text-xl">÷</Btn>

             <Btn onClick={() => insertText('4')} className="text-xl">4</Btn>
             <Btn onClick={() => insertText('5')} className="text-xl">5</Btn>
             <Btn onClick={() => insertText('6')} className="text-xl">6</Btn>
             <Btn onClick={() => insertText(' * ')} variant="secondary" className="text-xl">×</Btn>

             <Btn onClick={() => insertText('1')} className="text-xl">1</Btn>
             <Btn onClick={() => insertText('2')} className="text-xl">2</Btn>
             <Btn onClick={() => insertText('3')} className="text-xl">3</Btn>
             <Btn onClick={() => insertText(' - ')} variant="secondary" className="text-xl">−</Btn>

             <Btn onClick={() => insertText('0')} className="text-xl">0</Btn>
             <Btn onClick={() => insertText('.')} className="text-xl">.</Btn>
             <Btn onClick={() => insertText(', ')} className="text-xl text-primary/80">,</Btn>
             <Btn onClick={handleCalculate} variant="primary" className="text-xl">=</Btn>
             
             <Btn onClick={() => insertText(' + ')} variant="secondary" className="col-span-4 text-xl">+</Btn>
           </div>
        </div>
      </div>
    </div>
  );
}
