import type { Metadata } from 'next';
import { Inter, Syne, DM_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });
const dmMono = DM_Mono({ weight: ['300', '400', '500'], subsets: ['latin'], variable: '--font-dm-mono' });

export const metadata: Metadata = {
  title: 'OmniCalc - Ultimate Calculator Workspace',
  description: 'Premium futuristic calculator web application with scientific, graphing, financial, AI, and unit conversion capabilities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} ${dmMono.variable} font-sans antialiased text-white bg-[#0a0a0f] overflow-hidden`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
