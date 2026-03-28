"use client";

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { generateDailyReview } from "@/lib/services";
import type { ReviewStyle, ReviewTone } from "@/lib/services";
import { AuthDialog, PageLayout } from "@/components/app";
import { ComplianceNotice } from "@/components/compliance";
import { PixelButton } from "@/components/ui";
import { useAuthSession } from "@/lib/auth/useAuthSession";

export default function ReportPage() {
  const [style, setStyle] = useState<ReviewStyle>("standard");
  const [tone, setTone] = useState<ReviewTone>("real");
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [loginHint, setLoginHint] = useState("");
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const { isLoggedIn, refresh } = useAuthSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const review = useMemo(
    () => generateDailyReview(style, refreshKey, tone),
    [style, refreshKey, tone]
  );
  const toneLabel = tone === "calm" ? "克制" : tone === "sharp" ? "锋利" : "真实";

  const exportImage = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#090d14",
        scale: 2,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-review-${Date.now()}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageLayout
      title="我的复盘"
      description="像自己写的一段复盘。短句。克制。能截图分享。"
    >
      <div className="mx-auto max-w-2xl space-y-5">
        <div
          ref={cardRef}
          className="rounded-2xl border border-white/10 bg-[#0f141d] p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">今天的复盘</h2>
            <p className="text-xs text-slate-400">人格：{toneLabel}</p>
          </div>

          <section className="mb-5">
            <p className="mb-2 text-xs text-slate-400">1. 今天做了什么</p>
            <div className="space-y-1.5 text-base leading-8 text-slate-100">
              {review.fact.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section className="mb-5">
            <p className="mb-2 text-xs text-slate-400">2. 今天是什么环境</p>
            <div className="space-y-1.5 text-base leading-8 text-slate-100">
              {review.context.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <p className="mb-2 text-xs text-slate-400">3. 我今天怎么做决策</p>
            <div className="space-y-1.5 text-base leading-8 text-slate-100">
              {review.decision.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section className="mb-2">
            <p className="mb-2 text-xs text-slate-400">4. 最关键一句</p>
            <div className="space-y-1.5 text-xl font-medium leading-9 text-white">
              {review.keyline.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <p className="mt-6 text-right text-xs text-slate-500">@先别急着动</p>
        </div>

        <div className="flex gap-2">
          <PixelButton
            variant="primary"
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                setLoginHint("登录后，这次记录可以保存下来");
                setOpenLoginDialog(true);
                return;
              }
              setRefreshKey((v) => v + 1);
            }}
          >
            生成今天的复盘
          </PixelButton>
          <PixelButton
            variant="neutral"
            type="button"
            onClick={() =>
              setStyle((s) => (s === "standard" ? "share" : "standard"))
            }
          >
            切换风格（{style === "standard" ? "标准" : "分享"}）
          </PixelButton>
          <PixelButton
            variant="neutral"
            type="button"
            onClick={() =>
              setTone((t) =>
                t === "calm" ? "real" : t === "real" ? "sharp" : "calm"
              )
            }
          >
            切换人格（{toneLabel}）
          </PixelButton>
          <PixelButton
            variant="ghost"
            type="button"
            onClick={exportImage}
            disabled={exporting}
          >
            {exporting ? "生成中..." : "生成图片"}
          </PixelButton>
        </div>

        {loginHint && <p className="text-sm text-sky-200">{loginHint}</p>}
        <ComplianceNotice variant="block" />
      <AuthDialog open={openLoginDialog} onClose={() => setOpenLoginDialog(false)} onLoggedIn={() => void refresh()} />
      </div>
    </PageLayout>
  );
}
