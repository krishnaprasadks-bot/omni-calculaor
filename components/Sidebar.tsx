'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calculator, 
  FlaskConical, 
  Landmark, 
  BarChart2, 
  Binary, 
  FunctionSquare, 
  Grid3X3, 
  Bot,
  LineChart,
  ArrowRightLeft,
  SquareSigma
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Standard', href: '/basic', icon: Calculator, color: 'text-cyan-400' },
  { name: 'Scientific', href: '/scientific', icon: FlaskConical, color: 'text-violet-400' },
  { name: 'Graphing', href: '/graph', icon: LineChart, color: 'text-rose-400' },
  { name: 'Financial', href: '/financial', icon: Landmark, color: 'text-amber-400' },
  { name: 'Unit Converter', href: '/convert', icon: ArrowRightLeft, color: 'text-orange-400' },
  { name: 'Statistics', href: '/statistics', icon: BarChart2, color: 'text-blue-400' },
  { name: 'Matrix', href: '/matrix', icon: Grid3X3, color: 'text-indigo-400' },
  { name: 'Programmer', href: '/numbersystems', icon: Binary, color: 'text-emerald-400' },
  { name: 'Calculus', href: '/calculus', icon: FunctionSquare, color: 'text-purple-400' },
  { name: 'Solver', href: '/solver', icon: SquareSigma, color: 'text-pink-400' },
  { name: 'AI Assist', href: '/ai', icon: Bot, color: 'text-[#00d4ff]' },
];

export function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center font-syne font-bold text-sm text-black shadow-lg shadow-cyan-500/20">Σ</div>
          <span className="font-syne font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">ANTIGRAVITY</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={onItemClick} prefetch={true}>
              <div className={cn("relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group overflow-hidden", isActive ? "text-white" : "text-gray-400 hover:text-gray-200")}>
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl border border-white/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                )}
                {!isActive && (
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                )}
                <div className={cn("relative z-10 flex items-center justify-center transition-all duration-300", isActive ? item.color : "text-gray-500 group-hover:text-gray-300", isActive && "drop-shadow-[0_0_8px_currentColor]")}>
                  <item.icon className={cn("w-5 h-5", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                </div>
                <span className="relative z-10 font-syne tracking-wide">{item.name}</span>
                {isActive && (
                   <div className={cn("absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full shadow-[0_0_10px_currentColor]", item.color, "bg-current")} />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="w-72 border-r border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl h-full flex-col hidden md:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20">
      <SidebarContent />
    </aside>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const currentItem = navItems.find((t) => t.href === pathname) || navItems[0];
  
  return (
    <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-card shrink-0 w-full z-30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-black font-syne shadow-lg shadow-cyan-500/20">
          Σ
        </div>
        <span className="font-syne font-bold tracking-wider">{currentItem.name}</span>
      </div>
      <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-72 bg-[#0a0a0f] h-full flex flex-col border-r border-white/10 shadow-2xl animate-in slide-in-from-left-full">
            <SidebarContent onItemClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
