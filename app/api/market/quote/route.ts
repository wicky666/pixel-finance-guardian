import { NextResponse } from "next/server";
import { getLatestPrice } from "@/lib/market/yahoo";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = (url.searchParams.get("symbol") ?? "").trim();
  if (!symbol) {
    return NextResponse.json({ ok: false, message: "缺少代码" }, { status: 400 });
  }
  try {
    const quote = await getLatestPrice(symbol);
    if (quote.price == null) {
      return NextResponse.json({ ok: false, message: "未找到最新价", symbol: quote.symbol }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...quote });
  } catch {
    return NextResponse.json({ ok: false, message: "行情服务暂不可用" }, { status: 502 });
  }
}
