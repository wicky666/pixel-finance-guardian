import type { Metadata } from "next";
import "@/styles/globals.css";
import { TopNav } from "@/components/app";

export const metadata: Metadata = {
  title: "AI 成本模拟器",
  description:
    "先算清楚再决定的成本模拟与行为提醒工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#090d14] text-slate-100">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
