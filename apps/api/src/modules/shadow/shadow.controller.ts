import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateShadowDto } from "./dto/create-shadow.dto";
import { ShadowService } from "./shadow.service";
import { AuthGuard } from "../auth/auth.guard";
import type { SafeUser } from "../auth/auth.types";

@Controller("shadow")
@UseGuards(AuthGuard)
export class ShadowController {
  constructor(private readonly service: ShadowService) {}

  @Get("pairs")
  list(@Req() req: Request & { user: SafeUser }, @Query("limit") limit?: string) {
    const n = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    return { items: this.service.listByUser(req.user.id, n) };
  }

  @Get("latest")
  latest(@Req() req: Request & { user: SafeUser }) {
    const item = this.service.latestByUser(req.user.id);
    return item ? { item } : { item: null };
  }

  @Post("pairs")
  create(@Req() req: Request & { user: SafeUser }, @Body() body: CreateShadowDto) {
    return { item: this.service.createFromScenario(req.user.id, body) };
  }
}
