import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import { CalcProvider } from '@/components/calc-context';
import { Sidebar } from '@/components/sidebar';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const dmMono = DM_Mono({ weight: ['300', '400', '500'], subsets: ['latin'], variable: '--font-dm-mono' });

export const metadata: Metadata = {
  title: 'SolveX Calc - Calculate Everything',
  description: 'SolveX Calc — The Ultimate Advanced Calculator. Featuring 11 powerful modules including Scientific, Graphing, Financial, Programmer, Calculus, and an AI-powered assistant.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-sans antialiased bg-black overflow-hidden select-none h-[100dvh] w-[100dvw]">
        <CalcProvider>
          <div className="flex h-full w-full">
            <Sidebar />
            <main className="flex-1 h-full relative overflow-hidden flex flex-col">
              {children}
            </main>
          </div>
        </CalcProvider>
      </body>
    </html>
  );
}
