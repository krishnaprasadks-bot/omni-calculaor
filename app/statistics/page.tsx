"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DescriptiveStats } from "@/components/statistics/descriptive-stats";
import { ProbabilityDistributions } from "@/components/statistics/probability-distributions";
import { HypothesisTesting } from "@/components/statistics/hypothesis-testing";
import { RegressionAnalysis } from "@/components/statistics/regression-analysis";
import { Combinatorics } from "@/components/statistics/combinatorics";

export default function StatisticsCalculator() {
  const [activeTab, setActiveTab] = useState("descriptive");

  return (
    <div className="flex-1 flex flex-col min-h-full bg-muted/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto w-full mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Statistics Calculator
        </h1>
        <p className="text-muted-foreground mt-1">
          Analyze data, solve probabilities, and run statistical tests.
        </p>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto rounded-lg mb-6 gap-2 bg-transparent p-0">
            <TabsTrigger
              value="descriptive"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md border border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border"
            >
              Descriptive
            </TabsTrigger>
            <TabsTrigger
              value="distributions"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md border border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border"
            >
              Distributions
            </TabsTrigger>
            <TabsTrigger
              value="hypothesis"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md border border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border"
            >
              Hypothesis Test
            </TabsTrigger>
            <TabsTrigger
              value="regression"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md border border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border"
            >
              Regression
            </TabsTrigger>
            <TabsTrigger
              value="probability"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md border border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border"
            >
              Probability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="descriptive" className="mt-0 outline-none">
            <DescriptiveStats />
          </TabsContent>
          <TabsContent value="distributions" className="mt-0 outline-none">
            <ProbabilityDistributions />
          </TabsContent>
          <TabsContent value="hypothesis" className="mt-0 outline-none">
            <HypothesisTesting />
          </TabsContent>
          <TabsContent value="regression" className="mt-0 outline-none">
            <RegressionAnalysis />
          </TabsContent>
          <TabsContent value="probability" className="mt-0 outline-none">
            <Combinatorics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
