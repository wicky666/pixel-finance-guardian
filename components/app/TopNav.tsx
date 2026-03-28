"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { logoutSession } from "@/lib/auth/client";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { AuthDialog } from "@/components/app/AuthDialog";

const navItems = [
  { href: "/", label: "先别急着动" },
  { href: "/behavior", label: "你最近怎么动的" },
  { href: "/shadow", label: "如果你当时没动" },
  { href: "/report", label: "我的复盘" },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const { isLoggedIn, displayName, isAdmin, refresh, loading } = useAuthSession();
  const [openMenu, setOpenMenu] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const onLogout = async () => {
    await logoutSession();
    setOpenMenu(false);
    await refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1017]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="font-semibold text-white hover:text-sky-300">
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

          <div className="relative flex items-center gap-2">
            {!loading && !isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpenDialog(true)}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/5"
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDialog(true)}
                  className="rounded-md bg-sky-500/20 px-3 py-1.5 text-sm text-sky-200 hover:bg-sky-500/30"
                >
                  保存我的记录
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setOpenMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/5"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/25 text-xs text-sky-200">
                    {displayName.slice(0, 1).toUpperCase() || "我"}
                  </span>
                  <span>{displayName || "我的账户"}</span>
                </button>
                {openMenu && (
                  <div className="absolute right-0 top-11 w-44 rounded-lg border border-white/10 bg-[#111827] p-1 text-sm shadow-xl">
                    <Link href="/my" onClick={() => setOpenMenu(false)} className="block rounded-md px-3 py-2 text-slate-200 hover:bg-white/5">
                      我的记录
                    </Link>
                    <Link href="/report" onClick={() => setOpenMenu(false)} className="block rounded-md px-3 py-2 text-slate-200 hover:bg-white/5">
                      我的复盘
                    </Link>
                    {isAdmin && (
                      <a href="http://localhost:5173" className="block rounded-md px-3 py-2 text-slate-200 hover:bg-white/5">
                        管理后台
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={onLogout}
                      className="block w-full rounded-md px-3 py-2 text-left text-slate-200 hover:bg-white/5"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      <AuthDialog open={openDialog} onClose={() => setOpenDialog(false)} onLoggedIn={() => void refresh()} />
    </>
  );
}
