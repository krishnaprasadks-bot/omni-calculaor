"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function SipPlanner({
  currencySymbol = "$",
}: {
  currencySymbol?: string;
}) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(500);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUpRate, setStepUpRate] = useState(10); // Standard step up

  const calculateSip = () => {
    let futureValue = 0;
    let investedAmount = 0;
    let currentSip = monthlyInvestment;

    const i = returnRate / 100 / 12;

    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        investedAmount += currentSip;
        futureValue = (futureValue + currentSip) * (1 + i);
      }
      currentSip = currentSip * (1 + stepUpRate / 100);
    }

    const estimatedReturns = futureValue - investedAmount;

    return { investedAmount, estimatedReturns, futureValue };
  };

  const { investedAmount, estimatedReturns, futureValue } = calculateSip();

  const data = [
    { name: "Invested Amount", value: investedAmount },
    { name: "Estimated Returns", value: estimatedReturns },
  ];

  const COLORS = ["#a1a1aa", "#18181b"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold">SIP Planner</h2>
          <p className="text-sm text-muted-foreground">
            Estimate your mutual fund returns
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                Monthly Investment ({currencySymbol})
              </label>
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-24 text-right bg-muted border-none px-2 py-1 rounded text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                Expected Return Rate (p.a %)
              </label>
              <input
                type="number"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-20 text-right bg-muted border-none px-2 py-1 rounded text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Time Period (Years)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-20 text-right bg-muted border-none px-2 py-1 rounded text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Annual Step-Up (%)</label>
              <input
                type="number"
                value={stepUpRate}
                onChange={(e) => setStepUpRate(Number(e.target.value))}
                className="w-20 text-right bg-muted border-none px-2 py-1 rounded text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={stepUpRate}
              onChange={(e) => setStepUpRate(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
              Total Value
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {currencySymbol}
              {Math.round(futureValue).toLocaleString()}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
              Est. Returns
            </div>
            <div className="text-3xl font-bold tracking-tight text-emerald-600">
              {currencySymbol}
              {Math.round(estimatedReturns).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center justify-center">
          <div className="h-48 w-full flex items-center gap-4">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `${currencySymbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground text-muted-foreground"></div>
                <div className="text-sm font-medium">
                  Invested <br />
                  <span className="text-muted-foreground font-normal">
                    {currencySymbol}
                    {investedAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="text-sm font-medium">
                  Returns <br />
                  <span className="text-muted-foreground font-normal">
                    {currencySymbol}
                    {Math.round(estimatedReturns).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
