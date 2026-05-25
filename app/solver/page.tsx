"use client";

import React, { useState } from "react";
import { Variable, Calculator, LibrarySquare, Cuboid, PenTool, Braces } from "lucide-react";
import PolynomialSolver from "@/components/solver/polynomial-solver";
import AlgebraSolver from "@/components/solver/algebra-solver";
import SystemSolver from "@/components/solver/system-solver";
import ExpressionSolver from "@/components/solver/expression-solver";
import GeometrySolver from "@/components/solver/geometry-solver";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Solver() {
  return (
    <div className="flex-1 overflow-auto bg-muted/10 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <Variable className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-syne font-bold tracking-tight">Equation Solver</h1>
            <p className="text-muted-foreground">Step-by-step math engine and symbolic computation solvers.</p>
          </div>
        </header>

        <Tabs defaultValue="polynomial" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-muted p-1 rounded-2xl justify-start inline-flex min-w-max">
              <TabsTrigger value="polynomial" className="rounded-xl px-6 py-3 font-syne uppercase tracking-wider text-xs">
                <Calculator className="w-4 h-4 mr-2" /> Polynomials
              </TabsTrigger>
              <TabsTrigger value="algebra" className="rounded-xl px-6 py-3 font-syne uppercase tracking-wider text-xs">
                <PenTool className="w-4 h-4 mr-2" /> Algebra (Step-by-Step)
              </TabsTrigger>
              <TabsTrigger value="systems" className="rounded-xl px-6 py-3 font-syne uppercase tracking-wider text-xs">
                <LibrarySquare className="w-4 h-4 mr-2" /> Systems
              </TabsTrigger>
              <TabsTrigger value="expressions" className="rounded-xl px-6 py-3 font-syne uppercase tracking-wider text-xs">
                <Braces className="w-4 h-4 mr-2" /> Expressions
              </TabsTrigger>
              <TabsTrigger value="geometry" className="rounded-xl px-6 py-3 font-syne uppercase tracking-wider text-xs">
                <Cuboid className="w-4 h-4 mr-2" /> Geometry
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="polynomial" className="outline-none">
              <PolynomialSolver />
            </TabsContent>
            
            <TabsContent value="algebra" className="outline-none">
              <AlgebraSolver />
            </TabsContent>

            <TabsContent value="systems" className="outline-none">
              <SystemSolver />
            </TabsContent>
            
            <TabsContent value="expressions" className="outline-none">
              <ExpressionSolver />
            </TabsContent>

            <TabsContent value="geometry" className="outline-none">
              <GeometrySolver />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
