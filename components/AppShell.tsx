'use client';

import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { HistoryPanel } from '@/components/HistoryPanel';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0f]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <TopBar />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
        <HistoryPanel />
      </div>
    </div>
  );
}
