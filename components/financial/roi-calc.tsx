"use client";

import { useState } from "react";

export function RoiCalc({ currencySymbol = "$" }: { currencySymbol?: string }) {
  const [amountInvested, setAmountInvested] = useState(10000);
  const [returnAmount, setReturnAmount] = useState(12500);
  const [investmentPeriod, setInvestmentPeriod] = useState(2);

  const netProfit = returnAmount - amountInvested;
  const roi = amountInvested > 0 ? (netProfit / amountInvested) * 100 : 0;
  const annualizedRoi =
    investmentPeriod > 0
      ? (Math.pow(returnAmount / amountInvested, 1 / investmentPeriod) - 1) *
        100
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold">Return on Investment (ROI)</h2>
          <p className="text-sm text-muted-foreground">
            Calculate the efficiency of an investment
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount Invested ({currencySymbol})
            </label>
            <input
              type="number"
              value={amountInvested}
              onChange={(e) => setAmountInvested(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount Returned ({currencySymbol})
            </label>
            <input
              type="number"
              value={returnAmount}
              onChange={(e) => setReturnAmount(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Investment Period (Years)
            </label>
            <input
              type="number"
              value={investmentPeriod}
              onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center gap-6">
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50 text-center">
          <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
            Net Profit / Loss
          </div>
          <div
            className={`text-3xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-destructive"}`}
          >
            {netProfit >= 0 ? "+" : "-"}
            {currencySymbol}
            {Math.abs(netProfit).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50 text-center">
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
              Total ROI
            </div>
            <div
              className={`text-2xl font-bold ${roi >= 0 ? "text-emerald-600" : "text-destructive"}`}
            >
              {roi.toFixed(2)}%
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border/50 text-center">
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
              Annualized ROI
            </div>
            <div
              className={`text-2xl font-bold ${annualizedRoi >= 0 ? "text-emerald-600" : "text-destructive"}`}
            >
              {annualizedRoi.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
