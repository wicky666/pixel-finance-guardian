# Sandbox engine — boundary handling

All core functions return `null` for invalid or unsupported input; no throws for business logic.

| Case | Behavior |
|------|----------|
| `currentQuantity = 0` | Allowed in `calculateNewAverageCost`: result is price of new add (Cn = P when Q0=0). |
| `currentPrice <= 0` | Returns `null` (no division by zero). |
| `addAmount <= 0` | Returns `null` in add-quantity and efficiency. |
| `addQuantity <= 0` | In `calculateNewAverageCost`, totalQty can be 0 if Q0=0 → `null`. If Q0>0 and Q1=0, result = C0 (valid). |
| `currentAverageCost < 0` | Treated as invalid → `null`. |
| Denominator 0 | Avoided by checks (e.g. `requirePositive(price)`, `totalQty.lte(0)`). |
| Missing / invalid input | `toDecimal` returns `null` for null, undefined, NaN, non-finite, non-numeric string. |

Precision: see `constants.ts` (quantity 8, price 8, efficiency 4, percentage 4). Rounding: half-up.
