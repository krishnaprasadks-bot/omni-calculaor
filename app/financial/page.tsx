"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoanEmiCalc } from "@/components/financial/loan-emi-calc";
import { CompoundInterestCalc } from "@/components/financial/compound-interest";
import { SipPlanner } from "@/components/financial/sip-planner";
import { SimpleInterestCalc } from "@/components/financial/simple-interest";
import { RoiCalc } from "@/components/financial/roi-calc";
import { GstCalc } from "@/components/financial/gst-calc";

const currencies = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
];

export default function FinancialCalculator() {
  const [activeTab, setActiveTab] = useState("loan");
  const [currency, setCurrency] = useState(currencies[0]);

  return (
    <div className="flex-1 flex flex-col min-h-full bg-muted/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Financial Calculator
            </h1>
            <p className="text-muted-foreground mt-1">
              Tools for managing loans, investments, and taxes.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mr-2">Currency:</label>
            <select
              value={currency.value}
              onChange={(e) =>
                setCurrency(
                  currencies.find((c) => c.value === e.target.value) ||
                    currencies[0],
                )
              }
              className="bg-background border rounded-md px-3 py-1.5 text-sm"
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg flex-wrap gap-1">
            <TabsTrigger
              value="loan"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Loan & EMI
            </TabsTrigger>
            <TabsTrigger
              value="compound"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Compound Interest
            </TabsTrigger>
            <TabsTrigger
              value="sip"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              SIP Planner
            </TabsTrigger>
            <TabsTrigger
              value="simple"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Simple Interest
            </TabsTrigger>
            <TabsTrigger
              value="roi"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              ROI Calc
            </TabsTrigger>
            <TabsTrigger
              value="gst"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              GST/Tax
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loan" className="mt-6 outline-none">
            <LoanEmiCalc currencySymbol={currency.symbol} />
          </TabsContent>
          <TabsContent value="compound" className="mt-6 outline-none">
            <CompoundInterestCalc currencySymbol={currency.symbol} />
          </TabsContent>
          <TabsContent value="sip" className="mt-6 outline-none">
            <SipPlanner currencySymbol={currency.symbol} />
          </TabsContent>
          <TabsContent value="simple" className="mt-6 outline-none">
            <SimpleInterestCalc currencySymbol={currency.symbol} />
          </TabsContent>
          <TabsContent value="roi" className="mt-6 outline-none">
            <RoiCalc currencySymbol={currency.symbol} />
          </TabsContent>
          <TabsContent value="gst" className="mt-6 outline-none">
            <GstCalc currencySymbol={currency.symbol} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
