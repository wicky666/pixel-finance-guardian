import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateScenarioDto } from "./dto/create-scenario.dto";
import { ScenarioService } from "./scenario.service";

@Controller("scenarios")
export class ScenarioController {
  constructor(private readonly service: ScenarioService) {}

  @Get()
  list(@Query("limit") limit?: string) {
    const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    return { items: this.service.list(safeLimit) };
  }

  @Post()
  create(@Body() body: CreateScenarioDto) {
    return { item: this.service.create(body) };
  }
}
