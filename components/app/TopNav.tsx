"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "先别急着动" },
  { href: "/behavior", label: "你最近怎么动的" },
  { href: "/shadow", label: "如果你当时没动" },
  { href: "/report", label: "我的复盘" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1017]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-semibold text-white hover:text-sky-300"
        >
          AI 成本模拟器
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md border border-transparent px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "border-sky-500/60 bg-sky-500/10 text-sky-300"
                  : "text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
