/**
 * Decimal precision for sandbox math engine.
 * All core functions use these for consistent rounding.
 */
export const PRECISION = {
  /** Quantity (shares); 8 decimal places, allow fractional shares */
  quantity: 8,
  /** Average cost / price; 8 decimal places */
  price: 8,
  /** Cost improvement efficiency (per 10k); 4 decimal places */
  efficiency: 4,
  /** Rebound percentage; 4 decimal places */
  percentage: 4,
} as const;

/** Rounding mode: half-up for financial display */
export const ROUNDING_MODE = 4 as const; // Decimal.ROUND_HALF_UP
