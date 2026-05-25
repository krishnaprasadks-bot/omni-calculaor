"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Calculator, 
  FlaskConical, 
  LineChart, 
  Coins, 
  ArrowRightLeft, 
  BarChart2, 
  Grid3X3, 
  Binary, 
  FunctionSquare, 
  Variable, 
  Bot
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/basic", label: "Standard", icon: Calculator },
  { href: "/scientific", label: "Scientific", icon: FlaskConical },
  { href: "/graph", label: "Graphing", icon: LineChart },
  { href: "/financial", label: "Financial", icon: Coins },
  { href: "/convert", label: "Converter", icon: ArrowRightLeft },
  { href: "/statistics", label: "Statistics", icon: BarChart2 },
  { href: "/matrix", label: "Matrix", icon: Grid3X3 },
  { href: "/numbersystems", label: "Number Sys", icon: Binary },
  { href: "/calculus", label: "Calculus", icon: FunctionSquare },
  { href: "/solver", label: "Solver", icon: Variable },
  { href: "/ai", label: "AI Assist", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-16 md:w-64 border-r bg-muted/20 flex flex-col h-full bg-card shrink-0">
      <div className="p-4 border-b flex items-center gap-2 h-16 shrink-0">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
          <Calculator className="w-5 h-5" />
        </div>
        <span className="font-bold hidden md:block">OmniCalc</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
