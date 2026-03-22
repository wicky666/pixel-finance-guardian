import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { CreateScenarioDto } from "./dto/create-scenario.dto";

export interface ScenarioRecord extends CreateScenarioDto {
  id: string;
  createdAt: string;
}

const MAX_SCENARIOS = 3;

@Injectable()
export class ScenarioService {
  private records: ScenarioRecord[] = [];

  list(limit = 20): ScenarioRecord[] {
    return this.records.slice(0, limit);
  }

  create(input: CreateScenarioDto): ScenarioRecord {
    const id = input.id ?? randomUUID();
    const record: ScenarioRecord = {
      ...input,
      symbol: input.symbol.trim().toUpperCase(),
      id,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    this.records = [record, ...this.records.filter((r) => r.id !== id)].slice(
      0,
      MAX_SCENARIOS
    );
    return record;
  }
}
