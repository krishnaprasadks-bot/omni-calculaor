"use client";

import { useState } from "react";
const jstat = require("jstat");
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ProbabilityDistributions() {
  const [distType, setDistType] = useState<
    "normal" | "binomial" | "poisson" | "t"
  >("normal");

  // Normal
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [normX, setNormX] = useState(1.96);
  const [normP, setNormP] = useState(0.975);

  // Binomial
  const [binN, setBinN] = useState(10);
  const [binP, setBinP] = useState(0.5);
  const [binK, setBinK] = useState(5);

  // Poisson
  const [poiL, setPoiL] = useState(5);
  const [poiK, setPoiK] = useState(5);

  // T
  const [tDf, setTDf] = useState(10);
  const [tX, setTx] = useState(2.228);

  const renderNormal = () => {
    const pdf = jstat.normal.pdf(normX, mu, sigma);
    const cdf = jstat.normal.cdf(normX, mu, sigma);
    const invCdf = jstat.normal.inv(normP, mu, sigma);

    // generate plot data
    const plotData = [];
    for (let i = -4; i <= 4; i += 0.2) {
      const x = mu + i * sigma;
      plotData.push({
        x: Number(x.toFixed(2)),
        y: jstat.normal.pdf(x, mu, sigma),
      });
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mean (μ)</label>
            <input
              type="number"
              step="any"
              value={mu}
              onChange={(e) => setMu(Number(e.target.value))}
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Std Dev (σ)</label>
            <input
              type="number"
              step="any"
              value={sigma}
              onChange={(e) =>
                setSigma(Math.max(0.0001, Number(e.target.value)))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">X Value</label>
            <input
              type="number"
              step="any"
              value={normX}
              onChange={(e) => setNormX(Number(e.target.value))}
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">PDF f(x)</span>
              <span className="font-mono">{pdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">CDF P(X ≤ x)</span>
              <span className="font-mono">{cdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">P(X &gt; x)</span>
              <span className="font-mono">{(1 - cdf).toFixed(5)}</span>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">
                Inverse CDF (Probability)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={normP}
                  onChange={(e) =>
                    setNormP(Math.max(0, Math.min(1, Number(e.target.value))))
                  }
                  className="flex-1 p-2 bg-muted/50 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">InvCDF x value</span>
              <span className="font-mono">{invCdf.toFixed(5)}</span>
            </div>
          </div>
        </div>

        <ChartWrapper data={plotData} />
      </div>
    );
  };

  const renderBinomial = () => {
    const pdf = jstat.binomial.pdf(binK, binN, binP);
    const cdf = jstat.binomial.cdf(binK, binN, binP);
    const mean = binN * binP;
    const vari = binN * binP * (1 - binP);

    const plotData = [];
    for (let i = 0; i <= binN; i++) {
      plotData.push({ x: i, y: jstat.binomial.pdf(i, binN, binP) });
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trials (n)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={binN}
              onChange={(e) =>
                setBinN(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Probability of Success (p)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={binP}
              onChange={(e) =>
                setBinP(Math.max(0, Math.min(1, Number(e.target.value))))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Successes (k)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={binK}
              onChange={(e) =>
                setBinK(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">P(X = k)</span>
              <span className="font-mono">{pdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">CDF P(X ≤ k)</span>
              <span className="font-mono">{cdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">P(X &gt; k)</span>
              <span className="font-mono">{(1 - cdf).toFixed(5)}</span>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Mean (Expected)</span>
              <span className="font-mono">{mean.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Variance</span>
              <span className="font-mono">{vari.toFixed(5)}</span>
            </div>
          </div>
        </div>
        <ChartWrapper data={plotData} />
      </div>
    );
  };

  const renderPoisson = () => {
    const pdf = jstat.poisson.pdf(poiK, poiL);
    const cdf = jstat.poisson.cdf(poiK, poiL);

    const plotData = [];
    const maxK = Math.max(15, poiL * 2 + 5);
    for (let i = 0; i <= maxK; i++) {
      plotData.push({ x: i, y: jstat.poisson.pdf(i, poiL) });
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate / Mean (λ)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={poiL}
              onChange={(e) => setPoiL(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Events (k)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={poiK}
              onChange={(e) =>
                setPoiK(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">P(X = k)</span>
              <span className="font-mono">{pdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">CDF P(X ≤ k)</span>
              <span className="font-mono">{cdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">P(X &gt; k)</span>
              <span className="font-mono">{(1 - cdf).toFixed(5)}</span>
            </div>
          </div>
        </div>
        <ChartWrapper data={plotData} />
      </div>
    );
  };

  const renderTDist = () => {
    const pdf = jstat.studentt.pdf(tX, tDf);
    const cdf = jstat.studentt.cdf(tX, tDf);

    const plotData = [];
    for (let i = -4; i <= 4; i += 0.2) {
      plotData.push({ x: Number(i.toFixed(2)), y: jstat.studentt.pdf(i, tDf) });
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Degrees of Freedom (df)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={tDf}
              onChange={(e) => setTDf(Math.max(0.001, Number(e.target.value)))}
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">t Value</label>
            <input
              type="number"
              step="any"
              value={tX}
              onChange={(e) => setTx(Number(e.target.value))}
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">PDF f(t)</span>
              <span className="font-mono">{pdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">CDF P(T ≤ t)</span>
              <span className="font-mono">{cdf.toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">
                P(T &gt; t) (1-tail)
              </span>
              <span className="font-mono">{(1 - cdf).toFixed(5)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">2-tail P-value</span>
              <span className="font-mono">
                {(2 * Math.min(cdf, 1 - cdf)).toFixed(5)}
              </span>
            </div>
          </div>
        </div>
        <ChartWrapper data={plotData} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <div className="mb-6 flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          {["normal", "binomial", "poisson", "t"].map((type) => (
            <button
              key={type}
              onClick={() => setDistType(type as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border capitalize ${
                distType === type
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-muted/50 hover:bg-muted border-border"
              }`}
            >
              {type} Distribution
            </button>
          ))}
        </div>

        {distType === "normal" && renderNormal()}
        {distType === "binomial" && renderBinomial()}
        {distType === "poisson" && renderPoisson()}
        {distType === "t" && renderTDist()}
      </div>
    </div>
  );
}

function ChartWrapper({ data }: { data: any[] }) {
  return (
    <div className="w-full h-[250px] mt-6 border rounded-xl overflow-hidden bg-muted/10 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#525252"
            opacity={0.2}
          />
          <XAxis dataKey="x" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(val: number) => val.toFixed(4)}
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke="var(--color-primary, #3b82f6)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
