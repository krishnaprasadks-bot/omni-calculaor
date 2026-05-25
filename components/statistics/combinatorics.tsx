"use client";

import { useState } from "react";
const jstat = require("jstat");
import * as math from "mathjs";

export function Combinatorics() {
  const [n, setN] = useState(10);
  const [r, setR] = useState(3);

  // Bayes
  const [pA, setPA] = useState(0.01); // Base rate P(A)
  const [pBA, setPBA] = useState(0.95); // True positive P(B|A)
  const [pBnotA, setPBnotA] = useState(0.05); // False positive P(B|not A)

  let combinations = 0;
  let permutations = 0;

  try {
    combinations = Number(math.combinations(n, r));
    permutations = Number(math.permutations(n, r));
  } catch (e) {
    // ignore
  }

  // Bayes Thm
  // P(not A) = 1 - P(A)
  // P(B) = P(B|A)*P(A) + P(B|notA)*P(notA)
  // P(A|B) = P(B|A) * P(A) / P(B)
  const pNotA = 1 - pA;
  const pB = pBA * pA + pBnotA * pNotA;
  const pAB = (pBA * pA) / pB;

  return (
    <div className="space-y-6">
      {/* nPr / nCr */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          Combinatorics (Permutations & Combinations)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Items (n)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={n}
              onChange={(e) => setN(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Items Selected (r)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={r}
              onChange={(e) => setR(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              Combinations (nCr) - Order doesn&#39;t matter
            </div>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              {n >= r ? combinations.toLocaleString() : "0"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              Permutations (nPr) - Order matters
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
              {n >= r ? permutations.toLocaleString() : "0"}
            </div>
          </div>
        </div>
      </div>

      {/* Bayes */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          Bayes&#39; Theorem Calculator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">P(A)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={pA}
              onChange={(e) =>
                setPA(Math.max(0, Math.min(1, Number(e.target.value))))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              Prior probability of event A
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">P(B|A)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={pBA}
              onChange={(e) =>
                setPBA(Math.max(0, Math.min(1, Number(e.target.value))))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
            <p className="text-xs text-muted-foreground">True positive rate</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">P(B|¬A)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={pBnotA}
              onChange={(e) =>
                setPBnotA(Math.max(0, Math.min(1, Number(e.target.value))))
              }
              className="w-full p-2 bg-muted/50 border rounded-md"
            />
            <p className="text-xs text-muted-foreground">False positive rate</p>
          </div>
        </div>

        <div className="bg-muted/30 p-5 rounded-xl border flex flex-col items-center justify-center text-center">
          <div className="text-sm text-muted-foreground mb-2">
            Posterior Probability P(A|B)
          </div>
          <div className="text-3xl font-bold font-mono text-primary mb-2">
            {(pAB * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            = {pAB.toFixed(6)}
          </div>
          <div className="mt-4 text-xs text-muted-foreground text-left w-full max-w-md mx-auto border-t pt-4">
            <div className="flex justify-between">
              <span>P(¬A)</span> <span>{pNotA.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>P(B)</span> <span>{pB.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
