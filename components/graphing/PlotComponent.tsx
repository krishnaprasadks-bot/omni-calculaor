"use client";

import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

const Plot = createPlotlyComponent(Plotly);

export default function PlotComponent(props: PlotParams) {
  return <Plot {...props} />;
}
