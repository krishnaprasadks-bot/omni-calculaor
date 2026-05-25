"use client";

import { History, Search, Download, Trash2, Pin } from "lucide-react";
import { useState } from "react";

export function HistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-muted/80 backdrop-blur-md p-2 rounded-l-xl border border-r-0 shadow-lg text-muted-foreground hover:text-foreground transition-colors z-40"
      >
        <History className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="w-80 border-l bg-card flex flex-col h-full shrink-0 relative z-40 shadow-2xl md:shadow-none">
      <div className="p-4 border-b flex items-center justify-between h-16 shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <History className="w-5 h-5" />
          <span>History & Workspace</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search history..." 
            className="w-full bg-muted rounded-md pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 ring-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Placeholder History Items */}
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today</div>
        
        <HistoryItem 
          category="Financial" 
          title="Home Loan EMI" 
          expression="P: $300k, R: 5.5%, T: 30y"
          result="$1,703.37 / mo"
          pinned
        />
        
        <HistoryItem 
          category="Basic" 
          title="Calculation" 
          expression="450 * 1.08"
          result="486"
        />

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">Yesterday</div>
        
        <HistoryItem 
          category="Statistics" 
          title="Mean & Variance" 
          expression="[4, 8, 15, 16, 23, 42]"
          result="μ: 18, σ²: 161.6"
        />
      </div>

      <div className="p-3 border-t flex justify-between gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 border rounded-md text-sm hover:bg-muted transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
        <button className="flex items-center justify-center p-1.5 border rounded-md text-destructive hover:bg-destructive/10 transition-colors" title="Clear History">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function HistoryItem({ category, title, expression, result, pinned = false }: any) {
  return (
    <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors group cursor-pointer relative">
      <div className="flex justify-between items-start mb-1">
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-muted px-1.5 py-0.5 rounded">{category}</div>
        <button className={`p-1 -mr-1 -mt-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${pinned ? 'opacity-100 text-yellow-500' : 'text-muted-foreground hover:text-foreground'}`}>
          <Pin className="w-3 h-3" fill={pinned ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="font-medium text-sm truncate">{title}</div>
      <div className="text-xs text-muted-foreground font-mono mt-1 line-clamp-2">{expression}</div>
      <div className="text-sm font-semibold text-right mt-2 text-primary">{result}</div>
    </div>
  )
}

function ArrowRightIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}
