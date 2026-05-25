import * as math from "mathjs";
const jstat = require("jstat");

export function parseDataset(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
}

// Descriptive Statistics
export function calculateDescriptive(data: number[]) {
  if (data.length === 0) return null;

  const count = data.length;
  const sum = jstat.sum(data);
  const mean = jstat.mean(data);
  const median = jstat.median(data);
  const mode = jstat.mode(data);
  const range = jstat.range(data);
  const varPop = jstat.variance(data, true);
  const varSamp = jstat.variance(data);
  const stdevPop = jstat.stdev(data, true);
  const stdevSamp = jstat.stdev(data);
  const skewness = jstat.skewness(data);
  const kurtosis = jstat.kurtosis(data);
  const quartiles = jstat.quartiles(data);
  const iqr = quartiles[2] - quartiles[0];
  const min = jstat.min(data);
  const max = jstat.max(data);

  return {
    count,
    sum,
    mean,
    median,
    mode,
    range,
    varPop,
    varSamp,
    stdevPop,
    stdevSamp,
    skewness,
    kurtosis,
    quartiles,
    iqr,
    min,
    max,
  };
}
