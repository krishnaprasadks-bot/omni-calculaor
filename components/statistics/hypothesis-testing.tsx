"use client";

import { useState } from "react";
const jstat = require("jstat");

export function HypothesisTesting() {
  const [testType, setTestType] = useState<"one-sample-t" | "two-sample-t">(
    "one-sample-t",
  );

  // One Sample T-Test
  const [oneData, setOneData] = useState("1.2, 2.4, 3.1, 2.8, 2.5, 3.3, 1.9");
  const [popMean, setPopMean] = useState(2.0);
  const [oneTail, setOneTail] = useState<1 | 2>(2);

  // Two Sample T-Test
  const [twoData1, setTwoData1] = useState("12, 14, 15, 18, 20");
  const [twoData2, setTwoData2] = useState("10, 11, 14, 15, 16");
  const [twoTail, setTwoTail] = useState<1 | 2>(2);

  const parseArray = (str: string) =>
    str
      .split(/[\s,]+/)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n));

  const renderOneSampleT = () => {
    const data = parseArray(oneData);
    let tScore = 0;
    let pValue = 0;
    let n = data.length;
    let mean = 0;
    let stdev = 0;

    if (n > 1) {
      mean = jstat.mean(data);
      stdev = jstat.stdev(data, true); // true for sample standard deviation
      tScore = (mean - popMean) / (stdev / Math.sqrt(n));
      pValue = jstat.studentt.cdf(-Math.abs(tScore), n - 1) * oneTail;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sample Data</label>
            <textarea
              value={oneData}
              onChange={(e) => setOneData(e.target.value)}
              className="w-full h-24 p-2 bg-muted/50 border rounded-md"
            />
            <div className="text-xs text-muted-foreground">Count: {n}</div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Population Mean (μ₀)
              </label>
              <input
                type="number"
                step="any"
                value={popMean}
                onChange={(e) => setPopMean(Number(e.target.value))}
                className="w-full p-2 bg-muted/50 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tails</label>
              <select
                value={oneTail}
                onChange={(e) => setOneTail(Number(e.target.value) as 1 | 2)}
                className="w-full p-2 bg-muted/50 border rounded-md"
              >
                <option value={1}>1-Tail</option>
                <option value={2}>2-Tail</option>
              </select>
            </div>
          </div>
        </div>

        {n > 1 && (
          <div className="bg-muted/30 p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Sample Mean</div>
              <div className="text-xl font-mono">{mean.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sample StdDev</div>
              <div className="text-xl font-mono">{stdev.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">t-statistic</div>
              <div className="text-xl font-bold font-mono text-primary">
                {tScore.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">p-value</div>
              <div className="text-xl font-bold font-mono text-emerald-500">
                {pValue.toFixed(5)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTwoSampleT = () => {
    const d1 = parseArray(twoData1);
    const d2 = parseArray(twoData2);

    let tScore = 0;
    let pValue = 0;
    let df = 0;

    if (d1.length > 1 && d2.length > 1) {
      const m1 = jstat.mean(d1);
      const m2 = jstat.mean(d2);
      const var1 = jstat.variance(d1, true); // true = sample
      const var2 = jstat.variance(d2, true);
      const n1 = d1.length;
      const n2 = d2.length;

      // Welch's t-test
      const se = Math.sqrt(var1 / n1 + var2 / n2);
      tScore = (m1 - m2) / se;

      // Welch-Satterthwaite df
      const dfNum = Math.pow(var1 / n1 + var2 / n2, 2);
      const dfDen =
        Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
      df = dfNum / dfDen;

      pValue = jstat.studentt.cdf(-Math.abs(tScore), df) * twoTail;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sample 1 Data</label>
            <textarea
              value={twoData1}
              onChange={(e) => setTwoData1(e.target.value)}
              className="w-full h-24 p-2 bg-muted/50 border rounded-md"
            />
            <div className="text-xs text-muted-foreground">
              Count: {d1.length} | Mean:{" "}
              {d1.length ? jstat.mean(d1).toFixed(2) : 0}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sample 2 Data</label>
            <textarea
              value={twoData2}
              onChange={(e) => setTwoData2(e.target.value)}
              className="w-full h-24 p-2 bg-muted/50 border rounded-md"
            />
            <div className="text-xs text-muted-foreground">
              Count: {d2.length} | Mean:{" "}
              {d2.length ? jstat.mean(d2).toFixed(2) : 0}
            </div>
          </div>
        </div>

        <div className="max-w-[200px] space-y-2">
          <label className="text-sm font-medium">Tails</label>
          <select
            value={twoTail}
            onChange={(e) => setTwoTail(Number(e.target.value) as 1 | 2)}
            className="w-full p-2 bg-muted/50 border rounded-md"
          >
            <option value={1}>1-Tail</option>
            <option value={2}>2-Tail</option>
          </select>
        </div>

        {d1.length > 1 && d2.length > 1 && (
          <div className="bg-muted/30 p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Degrees of Freedom
              </div>
              <div className="text-xl font-mono">{df.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">t-statistic</div>
              <div className="text-xl font-bold font-mono text-primary">
                {tScore.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">p-value</div>
              <div className="text-xl font-bold font-mono text-emerald-500">
                {pValue.toFixed(5)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <div className="mb-6 border-b pb-4">
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value as any)}
            className="px-3 py-2 bg-muted border border-border rounded-lg font-medium text-sm outline-none"
          >
            <option value="one-sample-t">One-Sample T-Test</option>
            <option value="two-sample-t">
              Two-Sample T-Test (Welch&#39;s)
            </option>
          </select>
        </div>

        {testType === "one-sample-t" && renderOneSampleT()}
        {testType === "two-sample-t" && renderTwoSampleT()}
      </div>
    </div>
  );
}
