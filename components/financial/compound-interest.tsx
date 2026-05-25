"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function CompoundInterestCalc({
  currencySymbol = "$",
}: {
  currencySymbol?: string;
}) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(12);

  const calculateData = () => {
    let data = [];
    const r = rate / 100;
    const n = frequency;
    for (let t = 0; t <= years; t++) {
      const amount = principal * Math.pow(1 + r / n, n * t);
      data.push({
        year: t,
        balance: Math.round(amount),
        principal: principal,
        interest: Math.round(amount - principal),
      });
    }
    return data;
  };

  const data = calculateData();
  const finalAmount = data[data.length - 1].balance;
  const totalInterest = finalAmount - principal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6 lg:col-span-1">
        <div>
          <h2 className="text-xl font-bold">Compound Growth</h2>
          <p className="text-sm text-muted-foreground">
            See how your money grows over time
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Initial Investment ({currencySymbol})
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Interest Rate (%)</label>
            <input
              type="number"
              value={rate}
              step="0.1"
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Years</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Compounding Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
            >
              <option value={1}>Annually (1/yr)</option>
              <option value={2}>Semi-Annually (2/yr)</option>
              <option value={4}>Quarterly (4/yr)</option>
              <option value={12}>Monthly (12/yr)</option>
              <option value={365}>Daily (365/yr)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
              Final Balance
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {currencySymbol}
              {finalAmount.toLocaleString()}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
              Total Interest Earned
            </div>
            <div className="text-3xl font-bold tracking-tight text-emerald-600">
              {currencySymbol}
              {totalInterest.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm h-[320px]">
          <h3 className="text-sm font-medium mb-4">Growth Over Time</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e4e4e7"
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#71717a" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#71717a" }}
                tickFormatter={(val) => `${currencySymbol}${val / 1000}k`}
              />
              <Tooltip
                formatter={(value: number) =>
                  `${currencySymbol}${value.toLocaleString()}`
                }
                labelFormatter={(label) => `Year ${label}`}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#18181b"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="principal"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
