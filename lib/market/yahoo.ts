export interface MarketSuggestion {
  symbol: string;
  shortName: string;
  exchange?: string;
}

function normalizeCnQuoteCode(input: string): string | null {
  const raw = input.trim().toUpperCase();
  if (/^\d{6}$/.test(raw)) return raw.startsWith("6") ? `sh${raw}` : `sz${raw}`;
  if (/^\d{6}\.SS$/.test(raw)) return `sh${raw.slice(0, 6)}`;
  if (/^\d{6}\.SZ$/.test(raw)) return `sz${raw.slice(0, 6)}`;
  return null;
}

function normalizeSymbol(input: string): string {
  const raw = input.trim().toUpperCase();
  if (/^\d{6}$/.test(raw)) {
    // A-share quick mapping: 6xxxxxx -> SSE, others -> SZSE
    return raw.startsWith("6") ? `${raw}.SS` : `${raw}.SZ`;
  }
  return raw;
}

export async function searchSymbols(query: string): Promise<MarketSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=zh-Hans-CN&region=CN&quotesCount=8&newsCount=0`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    quotes?: Array<{
      symbol?: string;
      shortname?: string;
      exchDisp?: string;
      quoteType?: string;
    }>;
  };
  return (data.quotes ?? [])
    .filter((qItem) => qItem.quoteType === "EQUITY" && qItem.symbol)
    .slice(0, 6)
    .map((qItem) => ({
      symbol: qItem.symbol ?? "",
      shortName: qItem.shortname ?? qItem.symbol ?? "",
      exchange: qItem.exchDisp,
    }));
}

export async function getLatestPrice(inputSymbol: string): Promise<{
  symbol: string;
  price: number | null;
  currency?: string;
}> {
  const cnCode = normalizeCnQuoteCode(inputSymbol);
  if (cnCode) {
    try {
      // Tencent quote is usually reachable in mainland China.
      const cnUrl = `https://qt.gtimg.cn/q=${encodeURIComponent(cnCode)}`;
      const cnRes = await fetch(cnUrl, {
        cache: "no-store",
        headers: {
          Referer: "https://gu.qq.com",
          "User-Agent": "Mozilla/5.0",
        },
      });
      if (cnRes.ok) {
        const raw = await cnRes.text();
        const body = raw.split("=\"")[1]?.split("\";")[0] ?? "";
        const parts = body.split("~");
        const parsed = Number(parts[3]);
        if (Number.isFinite(parsed) && parsed > 0) {
          return { symbol: inputSymbol.trim().toUpperCase(), price: parsed, currency: "CNY" };
        }
      }
    } catch {
      // fallback to Yahoo below
    }
  }

  const symbol = normalizeSymbol(inputSymbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { symbol, price: null };
  }
  const data = (await res.json()) as {
    chart?: {
      result?: Array<{
        meta?: { regularMarketPrice?: number; currency?: string };
      }>;
    };
  };
  const meta = data.chart?.result?.[0]?.meta;
  const price = typeof meta?.regularMarketPrice === "number" ? meta.regularMarketPrice : null;
  return { symbol, price, currency: meta?.currency };
}
