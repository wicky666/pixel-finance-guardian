import { NextResponse } from "next/server";
import { searchSymbols } from "@/lib/market/yahoo";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ items: [] });
  }
  try {
    const items = await searchSymbols(q);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
