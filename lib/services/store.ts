import { inDateRange } from "./dateRange";
import type { DateRangeInput, RealShadowPair, ScenarioRecord } from "./types";

const STORAGE_KEY_SCENARIOS = "pfg_scenarios";
const STORAGE_KEY_PAIRS = "pfg_real_shadow_pairs";
const MAX_SCENARIOS = 3;

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getScenarios(range?: DateRangeInput): ScenarioRecord[] {
  const list = loadJson<ScenarioRecord[]>(STORAGE_KEY_SCENARIOS, []);
  return range ? list.filter((s) => inDateRange(s.createdAt, range)) : list;
}

export function saveScenario(
  scenario: Omit<ScenarioRecord, "id" | "createdAt">
): ScenarioRecord {
  const list = getScenarios();
  const record: ScenarioRecord = {
    ...scenario,
    id: crypto.randomUUID?.() ?? `s-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [record, ...list].slice(0, MAX_SCENARIOS);
  saveJson(STORAGE_KEY_SCENARIOS, next);
  return record;
}

export function deleteScenario(id: string): void {
  const list = getScenarios().filter((s) => s.id !== id);
  saveJson(STORAGE_KEY_SCENARIOS, list);
  const pairs = getRealShadowPairs().filter((p) => p.scenarioId !== id);
  saveJson(STORAGE_KEY_PAIRS, pairs);
}

export function getRealShadowPairs(range?: DateRangeInput): RealShadowPair[] {
  const list = loadJson<RealShadowPair[]>(STORAGE_KEY_PAIRS, []);
  return range ? list.filter((s) => inDateRange(s.createdAt, range)) : list;
}

export function saveRealShadowPair(pair: RealShadowPair): void {
  const list = [pair, ...getRealShadowPairs()].slice(0, 50);
  saveJson(STORAGE_KEY_PAIRS, list);
}
