"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AuthDialog, PageLayout } from "@/components/app";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { getScenarios } from "@/lib/services/store";

export default function MyRecordsPage() {
  const { isLoggedIn, refresh } = useAuthSession();
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  const recentScenarios = useMemo(() => getScenarios().slice(0, 5), []);

  return (
    <PageLayout
      title="我的记录"
      description="你的每一次模拟、复盘与行为轨迹，都会在这里连起来。"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {!isLoggedIn ? (
          <section className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
            <p className="text-sm text-sky-100">登录后，这次记录可以保存下来</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setOpenLoginDialog(true)}
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white"
              >
                登录后保存
              </button>
              <Link
                href="/"
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-200"
              >
                先本地试算
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-3 text-base font-semibold">最近操作</h2>
              {recentScenarios.length === 0 ? (
                <p className="text-sm text-slate-300">还没有最近操作，先去首页试着算一笔。</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-200">
                  {recentScenarios.map((item) => (
                    <li key={item.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                      {item.symbol} · {new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false })}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-2 text-base font-semibold">最近复盘</h2>
              <p className="text-sm text-slate-300">最近复盘将在后续版本持续补全，这里先保留个人入口。</p>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-2 text-base font-semibold">行为标签</h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/15 px-3 py-1 text-slate-300">长期观察（占位）</span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-slate-300">计划执行（占位）</span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-slate-300">情绪波动（占位）</span>
              </div>
            </section>
          </>
        )}
      </div>
      <AuthDialog open={openLoginDialog} onClose={() => setOpenLoginDialog(false)} onLoggedIn={() => void refresh()} />
    </PageLayout>
  );
}
