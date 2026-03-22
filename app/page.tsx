"use client";

import { useMemo, useState } from "react";
import {
  analyzeDecision,
  createRealShadowFromScenario,
  saveScenario,
} from "@/lib/services";
import type { DecisionAction, DecisionInputMode } from "@/lib/services";
import { PageLayout } from "@/components/app";
import { isApiSyncEnabled } from "@/lib/api/client";
import { syncScenarioToApi, syncShadowPairToApi } from "@/lib/api/syncScenario";

interface SymbolSuggestion {
  symbol: string;
  shortName: string;
  exchange?: string;
}

function toNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function HomePage() {
  const [symbol, setSymbol] = useState("BTC");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [action, setAction] = useState<DecisionAction>("add");
  const [inputMode, setInputMode] = useState<DecisionInputMode>("amount");
  const [changeValue, setChangeValue] = useState("");
  const [tried, setTried] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [searchingCode, setSearchingCode] = useState(false);
  const [gettingPrice, setGettingPrice] = useState(false);
  const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
  const [quoteMsg, setQuoteMsg] = useState("");
  const [cashBudget, setCashBudget] = useState("");

  const floating = useMemo(() => {
    const qty = toNum(currentQuantity);
    const c = toNum(costPrice);
    const p = toNum(currentPrice);
    if (!qty || !p) return 0;
    return (p - c) * qty;
  }, [currentQuantity, costPrice, currentPrice]);

  const result = useMemo(
    () =>
      analyzeDecision({
        currentQuantity,
        costPrice,
        currentPrice,
        action,
        inputMode,
        changeValue,
      }),
    [currentQuantity, costPrice, currentPrice, action, inputMode, changeValue]
  );

  const canSave = tried && result.valid;
  const qtyNum = toNum(currentQuantity);
  const costNum = toNum(costPrice);
  const currentNum = toNum(currentPrice);
  const changeNum = toNum(changeValue);
  const hasPriceCompare = costNum > 0 && currentNum > 0;
  const costVsCurrentPct = hasPriceCompare ? ((costNum - currentNum) / currentNum) * 100 : 0;
  const costHigherThanCurrent = costVsCurrentPct >= 0;
  const trendColorClass = costHigherThanCurrent ? "text-rose-400" : "text-emerald-400";
  const trendIcon = costHigherThanCurrent ? "▲" : "▼";
  const actionInputLabel =
    inputMode === "amount"
      ? action === "add"
        ? "加仓预算（元）"
        : "减仓金额（元）"
      : action === "add"
        ? "加仓股数（股）"
        : "减仓股数（股）";
  const estimatedShares =
    inputMode === "amount" && currentNum > 0 && changeNum > 0 ? changeNum / currentNum : 0;
  const marketValue = qtyNum > 0 && currentNum > 0 ? qtyNum * currentNum : 0;
  const estimatedTradeAmount =
    changeNum > 0
      ? inputMode === "amount"
        ? changeNum
        : currentNum > 0
          ? changeNum * currentNum
          : 0
      : 0;
  const tradeVsPositionPct = marketValue > 0 ? (estimatedTradeAmount / marketValue) * 100 : 0;
  const afterPositionValue =
    action === "add"
      ? marketValue + estimatedTradeAmount
      : action === "reduce"
        ? Math.max(0, marketValue - estimatedTradeAmount)
        : marketValue;
  const afterChangePct =
    marketValue > 0 ? ((afterPositionValue - marketValue) / marketValue) * 100 : 0;
  const barPct = Math.min(100, Math.max(0, tradeVsPositionPct));
  const amountSuggestion =
    action === "add"
      ? changeNum <= 0
        ? "先定这次计划投入，再拆成两到三笔。"
        : changeNum <= 20000
          ? "这笔不大，适合试探。留足下一笔。"
          : changeNum <= 80000
            ? "中等投入，建议分两笔，不追一次打满。"
            : "投入偏大，建议至少拆三笔，给自己留回旋。"
      : changeNum <= 0
        ? "先定这次要回收多少现金。"
        : changeNum <= 20000
          ? "小幅减仓，更像先降波动。"
          : changeNum <= 80000
            ? "中等减仓，先把不确定性降下来。"
            : "这笔回收较大，留意是否影响原计划。";

  const applyBudgetRatio = (ratio: number) => {
    const budget = toNum(cashBudget);
    if (budget <= 0) {
      setQuoteMsg("先输入可用资金，再点快捷比例。");
      return;
    }
    setChangeValue(String(Math.round(budget * ratio)));
    setInputMode("amount");
    setQuoteMsg("");
  };
  const applyReduceRatio = (ratio: number) => {
    if (qtyNum <= 0) {
      setQuoteMsg("先填写当前持仓股数，再用减仓比例。");
      return;
    }
    const reduceQty = qtyNum * ratio;
    if (inputMode === "amount") {
      if (currentNum <= 0) {
        setQuoteMsg("当前价为空，无法按金额换算。");
        return;
      }
      setChangeValue(String(Math.round(reduceQty * currentNum)));
    } else {
      setChangeValue(String(Number(reduceQty.toFixed(2))));
    }
    setQuoteMsg("");
  };

  const onSearchSymbol = async () => {
    const q = symbol.trim();
    if (q.length < 2) {
      setQuoteMsg("至少输入 2 个字符再搜索。");
      return;
    }
    setSearchingCode(true);
    setQuoteMsg("");
    try {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { items?: SymbolSuggestion[] };
      const items = data.items ?? [];
      setSuggestions(items);
      if (items.length === 0) {
        setQuoteMsg("没搜到匹配代码，试试更完整的名称。");
      }
    } catch {
      setQuoteMsg("代码搜索失败，请稍后再试。");
    } finally {
      setSearchingCode(false);
    }
  };

  const onGetLatestPrice = async (nextSymbol?: string) => {
    const target = (nextSymbol ?? symbol).trim();
    if (!target) {
      setQuoteMsg("请先输入代码。");
      return;
    }
    setGettingPrice(true);
    setQuoteMsg("");
    try {
      const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(target)}`);
      const data = (await res.json()) as { ok?: boolean; symbol?: string; price?: number; message?: string };
      if (!res.ok || !data.ok || typeof data.price !== "number") {
        setQuoteMsg(data.message ?? "没有拿到最新价。");
        return;
      }
      setSymbol(data.symbol ?? target);
      setCurrentPrice(String(data.price));
      setQuoteMsg("已更新最新价。");
    } catch {
      setQuoteMsg("获取最新价失败，请稍后再试。");
    } finally {
      setGettingPrice(false);
    }
  };

  const onSave = () => {
    if (!result.valid) return;
    const record = saveScenario({
      symbol: symbol.trim() || "SIM",
      currentQuantity: currentQuantity || "0",
      currentAverageCost: costPrice || "0",
      currentPrice: currentPrice || "0",
      addAmount: action === "add" ? result.addAmountForSave : "0",
      addQuantity: action === "add" ? result.addQuantityForSave : "0",
      newAverageCost: result.newAverageCost === "—" ? costPrice || "0" : result.newAverageCost,
      costImprovementEfficiency: "0",
      breakevenReboundPct: "0",
    });
    createRealShadowFromScenario({
      id: record.id,
      symbol: record.symbol,
      currentQuantity: record.currentQuantity,
      currentAverageCost: record.currentAverageCost,
      currentPrice: record.currentPrice,
      addQuantity: record.addQuantity,
      addAmount: record.addAmount,
      newAverageCost: record.newAverageCost,
    });
    if (isApiSyncEnabled()) {
      void syncScenarioToApi(record);
      void syncShadowPairToApi({
        id: record.id,
        symbol: record.symbol,
        currentQuantity: record.currentQuantity,
        currentAverageCost: record.currentAverageCost,
        currentPrice: record.currentPrice,
        addQuantity: record.addQuantity,
        addAmount: record.addAmount,
        newAverageCost: record.newAverageCost,
      });
      setSavedMsg(
        "已保留这次模拟，并已同步到后端（内存）。你可打开管理端查看记录。"
      );
    } else {
      setSavedMsg("已保留这次模拟，你可以去“如果你当时没动”看看差异。");
    }
  };

  return (
    <PageLayout
      title="这笔操作，先算清楚"
      description="这不是建议，只是把结果提前摆出来。"
    >
      <div className="mx-auto max-w-3xl space-y-5">
        {/* 区块1：当前持仓 */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-3 text-base font-semibold">当前持仓</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-slate-300">
                股票代码 / 名称
                <span className="ml-2 text-slate-500">输入如 600519 或 贵州茅台</span>
              </label>
              <input className="w-full rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="股票名称或代码（如 贵州茅台 / 600519）" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSearchSymbol}
                  disabled={searchingCode}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-40"
                >
                  {searchingCode ? "搜索中..." : "搜索代码"}
                </button>
                <button
                  type="button"
                  onClick={() => onGetLatestPrice()}
                  disabled={gettingPrice}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-40"
                >
                  {gettingPrice ? "获取中..." : "获取最新价"}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">
                当前持仓（股）
                <span className="ml-2 text-slate-500">你现在持有的总股数</span>
              </label>
              <input className="w-full rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2" value={currentQuantity} onChange={(e) => setCurrentQuantity(e.target.value)} placeholder="例如 1200" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">
                成本价（元）
                <span className="ml-2 text-slate-500">你的持仓平均成本</span>
              </label>
              <input className="w-full rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="例如 1480" />
              {hasPriceCompare && (
                <p className={`text-xs ${trendColorClass}`}>
                  {trendIcon} 成本价相对现价 {costVsCurrentPct >= 0 ? "+" : ""}
                  {costVsCurrentPct.toFixed(2)}%
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">
                当前价（元）
                <span className="ml-2 text-slate-500">可点“获取最新价”自动填入</span>
              </label>
              <input className="w-full rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="例如 1445" />
            </div>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={`${item.symbol}-${item.exchange ?? ""}`}
                  type="button"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-200"
                  onClick={() => {
                    setSymbol(item.symbol);
                    setSuggestions([]);
                    void onGetLatestPrice(item.symbol);
                  }}
                >
                  {item.shortName} · {item.symbol}
                </button>
              ))}
            </div>
          )}
          {quoteMsg && <p className="mt-2 text-xs text-slate-300">{quoteMsg}</p>}
          <p className="mt-3 text-sm text-slate-300">
            {floating >= 0 ? "浮盈" : "浮亏"}：{floating.toFixed(2)}
          </p>
        </section>

        {/* 区块2：这次想怎么动 */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-3 text-base font-semibold">这次想怎么动</h2>
          <p className="mb-3 text-xs text-slate-400">
            先选动作，再输入金额。系统会自动帮你换算股数和结果。
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {([
              ["add", "加仓（买入）"],
              ["reduce", "减仓（卖出）"],
              ["hold", "不动（先观察）"],
            ] as const).map(([v, t]) => (
              <button
                key={v}
                type="button"
                onClick={() => setAction(v)}
                className={`rounded-lg px-3 py-1.5 text-sm ${action === v ? "bg-sky-500/20 text-sky-300" : "bg-white/[0.05] text-slate-300"}`}
              >
                {t}
              </button>
            ))}
          </div>
          {action !== "hold" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setInputMode("amount")} className={`rounded-lg px-3 py-1.5 text-sm ${inputMode === "amount" ? "bg-sky-500/20 text-sky-300" : "bg-white/[0.05] text-slate-300"}`}>按金额（推荐）</button>
                  <button type="button" onClick={() => setInputMode("quantity")} className={`rounded-lg px-3 py-1.5 text-sm ${inputMode === "quantity" ? "bg-sky-500/20 text-sky-300" : "bg-white/[0.05] text-slate-300"}`}>按股数</button>
                </div>
                <p className="text-xs text-slate-400">默认用金额更直观</p>
              </div>
              {action === "add" && (
                <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <label className="mb-2 block text-xs text-slate-300">
                    可用资金（元）
                    <span className="ml-2 text-slate-500">用于快捷分配</span>
                  </label>
                  <input
                    className="mb-2 w-full rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2"
                    value={cashBudget}
                    onChange={(e) => setCashBudget(e.target.value)}
                    placeholder="例如 200000"
                  />
                  <div className="flex flex-wrap gap-2">
                    {([
                      [0.25, "试探仓"],
                      [0.5, "平衡仓"],
                      [0.75, "进攻仓"],
                      [1, "满额仓"],
                    ] as const).map(([ratio, label]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => applyBudgetRatio(ratio)}
                        className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/[0.06]"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {action === "reduce" && (
                <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="mb-2 text-xs text-slate-300">
                    减仓快捷比例
                    <span className="ml-2 text-slate-500">按当前持仓一键换算</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      [0.1, "减 10%"],
                      [0.25, "减 25%"],
                      [0.5, "减 50%"],
                    ] as const).map(([ratio, label]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => applyReduceRatio(ratio)}
                        className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/[0.06]"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    当前持仓 {qtyNum > 0 ? qtyNum.toFixed(2) : "0"} 股。
                    {inputMode === "amount"
                      ? " 点击后会自动换算成金额。"
                      : " 点击后会直接填入减仓股数。"}
                  </p>
                </div>
              )}
              <label className="mb-2 block text-xs text-slate-300">
                {actionInputLabel}
                <span className="ml-2 text-slate-500">
                  {inputMode === "amount" ? "例如 50000" : "例如 300"}
                </span>
              </label>
              <input
                className="w-full rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2"
                value={changeValue}
                onChange={(e) => setChangeValue(e.target.value)}
                placeholder={inputMode === "amount" ? "输入金额，如 50000" : "输入股数，如 300"}
              />
              <div className="mt-2 rounded-lg bg-white/[0.04] p-3 text-xs text-slate-300">
                {inputMode === "amount" ? (
                  currentNum > 0 && changeNum > 0 ? (
                    <p>
                      你输入了 {changeNum.toFixed(0)} 元，按当前价 {currentNum.toFixed(2)} 元，
                      约等于 {estimatedShares.toFixed(2)} 股。
                    </p>
                  ) : (
                    <p>先输入金额（如 50000），系统会自动换算成约多少股。</p>
                  )
                ) : (
                  <p>
                    你输入的是股数，系统会按当前价自动换算金额。
                    {action === "reduce" && qtyNum > 0 ? ` 当前最多可减 ${qtyNum.toFixed(2)} 股。` : ""}
                  </p>
                )}
              </div>
              {inputMode === "amount" ? (
                <div className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/10 p-3">
                  <p className="text-xs text-sky-100">资金使用建议：{amountSuggestion}</p>
                </div>
              ) : (
                estimatedTradeAmount > 0 &&
                marketValue > 0 && (
                  <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <p className="mb-2 text-xs text-slate-300">
                      本次预计动用 {estimatedTradeAmount.toFixed(2)} 元，
                      约占当前持仓市值 {tradeVsPositionPct.toFixed(2)}%。
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full bg-sky-400 transition-all"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      操作后持仓市值变化约 {afterChangePct >= 0 ? "+" : ""}
                      {afterChangePct.toFixed(2)}%。
                    </p>
                  </div>
                )
              )}
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setTried(true)} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-400">
              试着算一下
            </button>
            <button type="button" onClick={onSave} disabled={!canSave} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 disabled:opacity-40">
              保留这次模拟
            </button>
          </div>
        </section>

        {/* 区块3：动了以后会怎样 */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-3 text-base font-semibold">动了以后会怎样</h2>
          {!tried ? (
            <p className="text-sm text-slate-300">先写下这次想动的念头，再看看结果会怎样。</p>
          ) : !result.valid ? (
            <p className="text-sm text-amber-300">{result.reminder}</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-200">
              <p>新成本：{result.newAverageCost}</p>
              <p>回本价：{result.breakevenPrice}</p>
              <p>风险变化：{result.riskChange}</p>
              <div className="mt-2 rounded-lg bg-white/[0.04] p-3 text-slate-300">
                {result.explanationLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 区块4：系统提醒 */}
        <section className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
          <h2 className="mb-2 text-base font-semibold text-sky-200">系统提醒</h2>
          <p className="text-sm text-sky-100">{tried ? result.reminder : "先别急着动，先算清楚这次操作会带来什么变化。"}</p>
          {savedMsg && <p className="mt-2 text-sm text-emerald-300">{savedMsg}</p>}
        </section>
      </div>
    </PageLayout>
  );
}
