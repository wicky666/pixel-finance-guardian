import { describe, it, expect } from "vitest";
import {
  checkSensitiveWording,
  getSensitivePhrases,
} from "./sensitive-wording";

describe("checkSensitiveWording", () => {
  it("returns no match for neutral text", () => {
    const r = checkSensitiveWording("This is a simulation result.");
    expect(r.matched).toBe(false);
    expect(r.matches).toHaveLength(0);
  });

  it("detects Chinese phrases", () => {
    const r = checkSensitiveWording("建议买入更多");
    expect(r.matched).toBe(true);
    expect(r.matches.some((m) => m.phrase.includes("建议买入"))).toBe(true);
    expect(r.suggestedNeutral).toBe("simulation scenario");
  });

  it("detects English phrases case-insensitively", () => {
    expect(checkSensitiveWording("Strong Buy signal").matched).toBe(true);
    expect(checkSensitiveWording("STRONG SELL").matched).toBe(true);
    expect(checkSensitiveWording("financial advice").matched).toBe(true);
  });

  it("returns multiple matches", () => {
    const r = checkSensitiveWording("建议买入 and strong sell");
    expect(r.matched).toBe(true);
    expect(r.matches.length).toBeGreaterThanOrEqual(2);
  });

  it("handles empty or invalid input", () => {
    expect(checkSensitiveWording("").matched).toBe(false);
    expect(checkSensitiveWording("   ").matched).toBe(false);
  });
});

describe("getSensitivePhrases", () => {
  it("returns list of matched phrases", () => {
    const phrases = getSensitivePhrases("抄底机会 strong buy");
    expect(phrases.length).toBeGreaterThanOrEqual(1);
    expect(phrases.some((p) => p.includes("strong buy") || p.includes("抄底"))).toBe(true);
  });

  it("returns empty array when no match", () => {
    expect(getSensitivePhrases("neutral text")).toEqual([]);
  });
});
