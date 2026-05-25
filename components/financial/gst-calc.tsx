"use client";

import { useState } from "react";

export function GstCalc({ currencySymbol = "$" }: { currencySymbol?: string }) {
  const [baseAmount, setBaseAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const [calcMode, setCalcMode] = useState<"add" | "remove">("add");

  const performCalc = () => {
    let gstAmount = 0;
    let netAmount = 0;
    let originalAmount = baseAmount;

    if (calcMode === "add") {
      gstAmount = (baseAmount * gstRate) / 100;
      netAmount = baseAmount + gstAmount;
    } else {
      gstAmount = baseAmount - baseAmount * (100 / (100 + gstRate));
      netAmount = baseAmount - gstAmount;
      originalAmount = netAmount; // The amount without GST
    }

    return { gstAmount, netAmount, originalAmount };
  };

  const { gstAmount, netAmount, originalAmount } = performCalc();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold">GST Calculator</h2>
          <p className="text-sm text-muted-foreground">
            Add or remove GST from an amount
          </p>
        </div>

        <div className="p-1 bg-muted rounded-lg flex">
          <button
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${calcMode === "add" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setCalcMode("add")}
          >
            Add GST
          </button>
          <button
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${calcMode === "remove" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setCalcMode("remove")}
          >
            Remove GST
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Initial Amount ({currencySymbol})
            </label>
            <input
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-sm font-medium border-b pb-2 block">
              Common GST Rates
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 12, 18, 28].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setGstRate(rate)}
                  className={`px-4 py-2 rounded-md text-sm transition-colors border ${gstRate === rate ? "bg-primary border-primary text-primary-foreground font-medium" : "bg-card border-border hover:bg-muted"}`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom GST Rate (%)</label>
            <input
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center space-y-6">
        <div className="flex justify-between items-center px-4 py-3 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground font-medium">
            Net Amount (without GST)
          </span>
          <span className="font-semibold">
            {currencySymbol}
            {originalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground font-medium">
            GST Amount ({gstRate}%)
          </span>
          <span className="font-semibold text-amber-600">
            {calcMode === "add" ? "+" : "-"}
            {currencySymbol}
            {gstAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between items-center px-4 py-4 bg-primary text-primary-foreground rounded-lg shadow-md">
          <span className="font-medium uppercase tracking-wider text-sm text-primary-foreground/80">
            Total Amount (with GST)
          </span>
          <span className="text-2xl font-bold">
            {currencySymbol}
            {(calcMode === "add" ? netAmount : baseAmount).toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
