"use client";

import { useState, useMemo } from "react";
import * as math from "mathjs";

export function LoanCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(12);
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("months");

  const results = useMemo(() => {
    const p = principal;
    const r = rate / 100 / 12;
    const n = tenureUnit === "years" ? tenure * 12 : tenure;

    if (r === 0) return { emi: p / n, total: p, interest: 0 };

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - p;

    return { emi, total, interest };
  }, [principal, rate, tenure, tenureUnit]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-syne text-violet-300">
          Loan Details
        </h2>
        <div className="space-y-4">
          <Input
            label="Principal Amount"
            value={principal}
            onChange={setPrincipal}
          />
          <Input label="Interest Rate (%)" value={rate} onChange={setRate} />
          <div className="flex gap-4">
            <Input label="Tenure" value={tenure} onChange={setTenure} />
            <select
              value={tenureUnit}
              onChange={(e) => setTenureUnit(e.target.value as any)}
              className="bg-black/30 border border-white/5 rounded-xl px-4 py-2 mt-7 text-gray-300 outline-none"
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-violet-950/30 to-black/30 p-6 rounded-2xl border border-white/5 space-y-6">
        <ResultItem label="Monthly EMI" value={results.emi.toFixed(2)} />
        <ResultItem
          label="Total Interest"
          value={results.interest.toFixed(2)}
        />
        <ResultItem label="Total Payment" value={results.total.toFixed(2)} />
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-400 font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500/50"
      />
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl">
      <span className="text-gray-400">{label}</span>
      <span className="text-2xl font-bold font-dm-mono text-cyan-400">
        {value}
      </span>
    </div>
  );
}
