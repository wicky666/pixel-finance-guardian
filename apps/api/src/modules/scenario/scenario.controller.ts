import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateScenarioDto } from "./dto/create-scenario.dto";
import { ScenarioService } from "./scenario.service";
import { AuthGuard } from "../auth/auth.guard";
import type { SafeUser } from "../auth/auth.types";

@Controller("scenarios")
@UseGuards(AuthGuard)
export class ScenarioController {
  constructor(private readonly service: ScenarioService) {}

  @Get()
  list(@Req() req: Request & { user: SafeUser }, @Query("limit") limit?: string) {
    const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    return { items: this.service.listByUser(req.user.id, safeLimit) };
  }

  @Post()
  create(@Req() req: Request & { user: SafeUser }, @Body() body: CreateScenarioDto) {
    return { item: this.service.create(req.user.id, body) };
  }
}
