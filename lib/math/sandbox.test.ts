import { describe, it, expect } from "vitest";
import {
  calculateAddQuantityFromAmount,
  calculateNewAverageCost,
  calculateCostImprovementEfficiency,
  calculateBreakevenReboundPct,
  calculateAddQuantityFromAmountInteger,
} from "./sandbox";

describe("calculateAddQuantityFromAmount", () => {
  it("computes quantity from amount and price", () => {
    expect(calculateAddQuantityFromAmount(10000, 10)).toBe("1000.00000000");
    expect(calculateAddQuantityFromAmount(5000, 2.5)).toBe("2000.00000000");
  });

  it("allows fractional shares with 8 decimal precision", () => {
    expect(calculateAddQuantityFromAmount(100, 3)).toBe("33.33333333");
  });

  it("returns null when currentPrice <= 0", () => {
    expect(calculateAddQuantityFromAmount(100, 0)).toBeNull();
    expect(calculateAddQuantityFromAmount(100, -1)).toBeNull();
  });

  it("returns null when addAmount <= 0", () => {
    expect(calculateAddQuantityFromAmount(0, 10)).toBeNull();
    expect(calculateAddQuantityFromAmount(-100, 10)).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(calculateAddQuantityFromAmount(null as unknown as number, 10)).toBeNull();
    expect(calculateAddQuantityFromAmount(100, undefined as unknown as number)).toBeNull();
    expect(calculateAddQuantityFromAmount(NaN, 10)).toBeNull();
    expect(calculateAddQuantityFromAmount(100, Infinity)).toBeNull();
  });

  it("accepts string and Decimal-like values", () => {
    expect(calculateAddQuantityFromAmount("10000", "10")).toBe("1000.00000000");
  });
});

describe("calculateNewAverageCost", () => {
  it("computes new average: (Q0*C0 + Q1*P) / (Q0 + Q1)", () => {
    // 100 shares @ 10, add 50 @ 8 → (1000+400)/150 = 9.333...
    expect(calculateNewAverageCost(100, 10, 50, 8)).toBe("9.33333333");
  });

  it("when currentQuantity = 0, result is current price", () => {
    expect(calculateNewAverageCost(0, 0, 100, 5)).toBe("5.00000000");
  });

  it("when addQuantity = 0, result is current average cost", () => {
    expect(calculateNewAverageCost(100, 10, 0, 8)).toBe("10.00000000");
  });

  it("returns null when total quantity would be 0", () => {
    expect(calculateNewAverageCost(0, 10, 0, 5)).toBeNull();
  });

  it("returns null for negative inputs", () => {
    expect(calculateNewAverageCost(-1, 10, 50, 8)).toBeNull();
    expect(calculateNewAverageCost(100, 10, 50, -8)).toBeNull();
  });

  it("returns null for invalid/missing input", () => {
    expect(calculateNewAverageCost(null as unknown as number, 10, 50, 8)).toBeNull();
  });
});

describe("calculateCostImprovementEfficiency", () => {
  it("efficiency = (C0 - Cn) / (addAmount/10000)", () => {
    // C0=10, Cn=9, add 10k → drop 1 per 10k → 1
    expect(calculateCostImprovementEfficiency(10, 9, 10000)).toBe("1.0000");
    // C0=10, Cn=8, add 20k → drop 2 per 20k = 1 per 10k → 1
    expect(calculateCostImprovementEfficiency(10, 8, 20000)).toBe("1.0000");
  });

  it("returns null when addAmount <= 0", () => {
    expect(calculateCostImprovementEfficiency(10, 9, 0)).toBeNull();
    expect(calculateCostImprovementEfficiency(10, 9, -1000)).toBeNull();
  });

  it("allows zero or negative efficiency when cost did not improve", () => {
    expect(calculateCostImprovementEfficiency(8, 9, 10000)).toBe("-1.0000");
    expect(calculateCostImprovementEfficiency(10, 10, 10000)).toBe("0.0000");
  });

  it("returns null for invalid input", () => {
    expect(calculateCostImprovementEfficiency(null as unknown as number, 9, 10000)).toBeNull();
  });
});

describe("calculateBreakevenReboundPct", () => {
  it("rebound = Cn/P - 1", () => {
    // avg 10, price 8 → 10/8 - 1 = 0.25 (25% rebound)
    expect(calculateBreakevenReboundPct(10, 8)).toBe("0.2500");
    expect(calculateBreakevenReboundPct(11, 10)).toBe("0.1000");
  });

  it("returns null when currentPrice <= 0", () => {
    expect(calculateBreakevenReboundPct(10, 0)).toBeNull();
    expect(calculateBreakevenReboundPct(10, -1)).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(calculateBreakevenReboundPct(10, null as unknown as number)).toBeNull();
  });
});

describe("calculateAddQuantityFromAmountInteger", () => {
  it("floor by default", () => {
    expect(calculateAddQuantityFromAmountInteger(100, 3)).toBe("33");
  });

  it("respects round strategy", () => {
    expect(calculateAddQuantityFromAmountInteger(100, 3, "floor")).toBe("33");
    expect(calculateAddQuantityFromAmountInteger(100, 3, "ceil")).toBe("34");
    expect(calculateAddQuantityFromAmountInteger(100, 3, "round")).toBe("33");
  });

  it("returns null when fractional version returns null", () => {
    expect(calculateAddQuantityFromAmountInteger(0, 10)).toBeNull();
    expect(calculateAddQuantityFromAmountInteger(100, 0)).toBeNull();
  });
});
