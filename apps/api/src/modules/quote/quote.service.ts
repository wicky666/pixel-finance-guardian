import { Injectable } from "@nestjs/common";

@Injectable()
export class QuoteService {
  async search(query: string) {
    const q = query.trim();
    if (q.length < 2) return [];
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=zh-Hans-CN&region=CN&quotesCount=8&newsCount=0`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      quotes?: Array<{ symbol?: string; shortname?: string; exchDisp?: string; quoteType?: string }>;
    };
    return (data.quotes ?? [])
      .filter((item) => item.quoteType === "EQUITY" && item.symbol)
      .slice(0, 6)
      .map((item) => ({
        symbol: item.symbol ?? "",
        shortName: item.shortname ?? item.symbol ?? "",
        exchange: item.exchDisp,
      }));
  }

  async latest(symbolInput: string) {
    const symbol = symbolInput.trim().toUpperCase();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { ok: false, symbol, message: "未找到最新价" as const };
    const data = (await res.json()) as {
      chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; currency?: string } }> };
    };
    const meta = data.chart?.result?.[0]?.meta;
    if (typeof meta?.regularMarketPrice !== "number") {
      return { ok: false, symbol, message: "未找到最新价" as const };
    }
    return { ok: true, symbol, price: meta.regularMarketPrice, currency: meta.currency };
  }
}
