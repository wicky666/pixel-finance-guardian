/**
 * Sensitive wording check — flags phrases that imply financial advice or prediction.
 * Returns matches and suggested neutral replacement. No external services.
 */

export interface SensitiveMatch {
  /** Matched phrase (lowercased) */
  phrase: string;
  /** Suggested neutral replacement for display/log */
  suggested: string;
}

/** Patterns: phrase (case-insensitive) → suggested replacement */
const PATTERNS: Array<{ phrase: string; suggested: string }> = [
  { phrase: "建议买入", suggested: "simulation scenario" },
  { phrase: "建议卖出", suggested: "simulation scenario" },
  { phrase: "抄底", suggested: "cost-averaging scenario" },
  { phrase: "必涨", suggested: "hypothetical upside" },
  { phrase: "必跌", suggested: "hypothetical downside" },
  { phrase: "底部确认", suggested: "level in simulation" },
  { phrase: "will go up", suggested: "may move in simulation" },
  { phrase: "will go down", suggested: "may move in simulation" },
  { phrase: "strong buy", suggested: "simulation result" },
  { phrase: "strong sell", suggested: "simulation result" },
  { phrase: "financial advice", suggested: "mathematical simulation" },
  { phrase: "buy recommendation", suggested: "simulation output" },
  { phrase: "sell recommendation", suggested: "simulation output" },
];

export interface SensitiveWordingResult {
  /** True if any pattern matched */
  matched: boolean;
  /** All matches found */
  matches: SensitiveMatch[];
  /** Suggested neutral wording (first match's suggestion, or generic) */
  suggestedNeutral: string;
}

/**
 * Check text for sensitive phrases. Case-insensitive.
 * Use for AI output or user-generated content before display.
 */
export function checkSensitiveWording(text: string): SensitiveWordingResult {
  if (typeof text !== "string" || text.trim() === "") {
    return { matched: false, matches: [], suggestedNeutral: text };
  }

  const lower = text.toLowerCase();
  const matches: SensitiveMatch[] = [];

  for (const { phrase, suggested } of PATTERNS) {
    if (lower.includes(phrase.toLowerCase())) {
      matches.push({ phrase: phrase.toLowerCase(), suggested });
    }
  }

  const suggestedNeutral =
    matches.length > 0
      ? matches.map((m) => m.suggested).join("; ")
      : text;

  return {
    matched: matches.length > 0,
    matches,
    suggestedNeutral,
  };
}

/** Get only the list of matched phrases (for logging or badges) */
export function getSensitivePhrases(text: string): string[] {
  return checkSensitiveWording(text).matches.map((m) => m.phrase);
}
