"use client";

import { useState } from "react";
import { parseDataset } from "@/lib/statistics";
const jstat = require("jstat");
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";

export function RegressionAnalysis() {
  const [xInput, setXInput] = useState("1, 2, 3, 4, 5, 6, 7");
  const [yInput, setYInput] = useState("2.1, 4.0, 6.2, 8.1, 9.8, 11.9, 14.2");

  const xData = parseDataset(xInput);
  const yData = parseDataset(yInput);

  let n = Math.min(xData.length, yData.length);
  let r = 0;
  let slope = 0;
  let intercept = 0;
  let r2 = 0;
  let plotData: any[] = [];
  let lineData: any[] = [];

  if (n > 1) {
    const x = xData.slice(0, n);
    const y = yData.slice(0, n);

    // Pearson correlation
    r = jstat.corrcoeff(x, y);
    r2 = r * r;

    const xM = jstat.mean(x);
    const yM = jstat.mean(y);

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - xM) * (y[i] - yM);
      den += Math.pow(x[i] - xM, 2);
    }

    slope = den === 0 ? 0 : num / den;
    intercept = yM - slope * xM;

    for (let i = 0; i < n; i++) {
      plotData.push({ x: x[i], y: y[i] });
    }

    const minX = jstat.min(x);
    const maxX = jstat.max(x);
    const padding = (maxX - minX) * 0.1 || 1;

    lineData = [
      { x: minX - padding, lineY: slope * (minX - padding) + intercept },
      { x: maxX + padding, lineY: slope * (maxX + padding) + intercept },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          Linear Regression & Correlation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              X Values (Independent)
            </label>
            <textarea
              value={xInput}
              onChange={(e) => setXInput(e.target.value)}
              className="w-full h-24 p-2 bg-muted/50 border rounded-md"
            />
            <div className="text-xs text-muted-foreground">
              Count: {xData.length}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Y Values (Dependent)</label>
            <textarea
              value={yInput}
              onChange={(e) => setYInput(e.target.value)}
              className="w-full h-24 p-2 bg-muted/50 border rounded-md"
            />
            <div className="text-xs text-muted-foreground">
              Count: {yData.length}
            </div>
          </div>
        </div>

        {n > 1 && (
          <div className="bg-muted/30 p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 w-full overflow-hidden">
            <div>
              <div className="text-sm text-muted-foreground truncate">
                Correlation (r)
              </div>
              <div className="text-xl font-mono">{r.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground truncate">
                R-Squared (r²)
              </div>
              <div className="text-xl font-mono text-primary">
                {r2.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground truncate">
                Slope (m)
              </div>
              <div className="text-xl font-mono">{slope.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground truncate">
                Intercept (b)
              </div>
              <div className="text-xl font-mono">{intercept.toFixed(4)}</div>
            </div>
            <div className="col-span-2 sm:col-span-4 mt-2">
              <div className="text-sm text-muted-foreground">Equation</div>
              <div className="text-lg font-bold font-mono">
                y = {slope.toFixed(4)}x {intercept >= 0 ? "+" : "-"}{" "}
                {Math.abs(intercept).toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {n > 1 && (
          <div className="w-full h-[300px] mt-6 border rounded-xl overflow-hidden bg-muted/10 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#525252"
                  opacity={0.2}
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="X"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  name="Y"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Scatter data={plotData} fill="var(--color-primary, #3b82f6)" />
                <Line
                  data={lineData}
                  dataKey="lineY"
                  stroke="var(--color-primary, #3b82f6)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
