"use client";

import { useState } from "react";

export function SimpleInterestCalc({
  currencySymbol = "$",
}: {
  currencySymbol?: string;
}) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(5);

  const interest = (principal * rate * time) / 100;
  const totalAmount = principal + interest;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold">Simple Interest</h2>
          <p className="text-sm text-muted-foreground">
            Calculate SI and total amount
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Principal Amount ({currencySymbol})
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rate of Interest (%)</label>
            <input
              type="number"
              value={rate}
              step="0.1"
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time (Years)</label>
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center space-y-8 text-center">
        <div>
          <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">
            Total Interest
          </div>
          <div className="text-4xl font-bold text-primary">
            {currencySymbol}
            {interest.toLocaleString()}
          </div>
        </div>

        <div className="w-full h-px bg-muted"></div>

        <div>
          <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">
            Total Amount (P + I)
          </div>
          <div className="text-4xl font-bold text-primary">
            {currencySymbol}
            {totalAmount.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
