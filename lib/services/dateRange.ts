import type { DateRangeInput } from "./types";

export function inDateRange(iso: string, range?: DateRangeInput): boolean {
  if (!range) return true;
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return false;
  if (range.dateFrom) {
    const from = new Date(`${range.dateFrom}T00:00:00`).getTime();
    if (!Number.isNaN(from) && ts < from) return false;
  }
  if (range.dateTo) {
    const to = new Date(`${range.dateTo}T23:59:59`).getTime();
    if (!Number.isNaN(to) && ts > to) return false;
  }
  return true;
}
