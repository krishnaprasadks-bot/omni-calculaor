"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function LoanEmiCalc({
  currencySymbol = "$",
}: {
  currencySymbol?: string;
}) {
  const [principal, setPrincipal] = useState(300000);
  const [rate, setRate] = useState(5.5);
  const [tenureYears, setTenureYears] = useState(30);

  const p = principal;
  const r = rate / 12 / 100;
  const n = tenureYears * 12;

  const emi =
    r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;

  const data = [
    { name: "Principal", value: p },
    { name: "Interest", value: totalInterest },
  ];

  const COLORS = ["#18181b", "#a1a1aa"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold">Loan Parameters</h2>
          <p className="text-sm text-muted-foreground">
            Adjust your loan details to calculate EMI
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                Principal Amount ({currencySymbol})
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-28 text-right bg-muted border-none px-2 py-1 rounded text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <input
              type="range"
              min="1000"
              max="2000000"
              step="1000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Interest Rate (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-20 text-right bg-muted border-none px-2 py-1 rounded text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-20 text-right bg-muted border-none px-2 py-1 rounded text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider mb-2">
            Monthly EMI
          </div>
          <div className="text-5xl font-bold tracking-tighter">
            {currencySymbol}
            {emi.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div className="flex gap-8 mt-8 w-full">
            <div className="flex-1">
              <div className="text-primary-foreground/70 text-xs mb-1">
                Total Principal
              </div>
              <div className="font-medium">
                {currencySymbol}
                {p.toLocaleString()}
              </div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="flex-1">
              <div className="text-primary-foreground/70 text-xs mb-1">
                Total Interest
              </div>
              <div className="font-medium">
                {currencySymbol}
                {totalInterest.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
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
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="text-sm font-medium">
                  Principal <br />
                  <span className="text-muted-foreground font-normal">
                    {((p / totalPayment) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground text-muted-foreground"></div>
                <div className="text-sm font-medium">
                  Interest <br />
                  <span className="text-muted-foreground font-normal">
                    {((totalInterest / totalPayment) * 100).toFixed(1)}%
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
