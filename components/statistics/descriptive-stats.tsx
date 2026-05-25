"use client";

import { useState, useMemo } from "react";
import { parseDataset, calculateDescriptive } from "@/lib/statistics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function DescriptiveStats() {
  const [input, setInput] = useState("1, 2, 2, 3, 4, 7, 9");

  const data = useMemo(() => parseDataset(input), [input]);
  const stats = useMemo(() => calculateDescriptive(data), [data]);

  const histogramData = useMemo(() => {
    if (data.length === 0) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const bins = 10;
    const binSize = (max - min) / bins;
    if (binSize === 0) return [{ bin: min.toFixed(2), count: data.length }];

    const hist = new Array(bins).fill(0);
    data.forEach((val) => {
      let idx = Math.floor((val - min) / binSize);
      if (idx >= bins) idx = bins - 1;
      hist[idx]++;
    });

    return hist.map((count, i) => {
      const start = min + i * binSize;
      const end = start + binSize;
      return {
        bin: `${start.toFixed(1)} - ${end.toFixed(1)}`,
        count,
      };
    });
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Descriptive Statistics</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Data Set (comma or space separated)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-24 p-3 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. 10 20 30 40 50"
            />
            <div className="text-xs text-muted-foreground mt-2">
              N = {data.length}
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="font-semibold mb-4 text-primary">Summary</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <StatRow label="Count (N)" value={stats.count} />
              <StatRow label="Sum" value={stats.sum} />
              <StatRow label="Mean (μ)" value={stats.mean} />
              <StatRow label="Median" value={stats.median} />
              <StatRow
                label="Mode"
                value={
                  Array.isArray(stats.mode) ? stats.mode.join(", ") : stats.mode
                }
              />
              <StatRow
                label="Min / Max"
                value={`${stats.min} / ${stats.max}`}
              />
              <StatRow label="Range" value={stats.range} />
              <StatRow label="Pop. Variance (σ²)" value={stats.varPop} />
              <StatRow label="Sample Variance (s²)" value={stats.varSamp} />
              <StatRow label="Pop. Std Dev (σ)" value={stats.stdevPop} />
              <StatRow label="Sample Std Dev (s)" value={stats.stdevSamp} />
              <StatRow label="Skewness" value={stats.skewness} />
              <StatRow label="Kurtosis" value={stats.kurtosis} />
            </div>

            <h3 className="font-semibold mt-6 mb-4 text-primary">Quartiles</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <StatRow label="Q1 (25%)" value={stats.quartiles[0]} />
              <StatRow label="Q2 (50%)" value={stats.quartiles[1]} />
              <StatRow label="Q3 (75%)" value={stats.quartiles[2]} />
              <StatRow label="IQR" value={stats.iqr} />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col">
            <h3 className="font-semibold mb-4 text-primary">Histogram</h3>
            <div className="flex-1 w-full h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={histogramData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#525252"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="bin"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "#3f3f46", opacity: 0.1 }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-primary, #3b82f6)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  const displayValue =
    typeof value === "number"
      ? Number.isInteger(value)
        ? value
        : value.toFixed(4)
      : value || "N/A";
  return (
    <>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-right">{displayValue}</div>
    </>
  );
}
