import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { HistoryPanel } from "@/components/layout/history-panel";
import { PageTransition } from "@/components/layout/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OmniCalc Workspace",
  description: "Advanced multi-mode calculator workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background flex h-screen overflow-hidden`}
      >
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 h-full">
          <MobileNav />
          <div className="flex-1 overflow-y-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        <HistoryPanel />
      </body>
    </html>
  );
}
