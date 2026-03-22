import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateShadowDto } from "./dto/create-shadow.dto";
import { ShadowService } from "./shadow.service";

@Controller("shadow")
export class ShadowController {
  constructor(private readonly service: ShadowService) {}

  @Get("pairs")
  list(@Query("limit") limit?: string) {
    const n = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    return { items: this.service.list(n) };
  }

  @Get("latest")
  latest() {
    const item = this.service.latest();
    return item ? { item } : { item: null };
  }

  @Post("pairs")
  create(@Body() body: CreateShadowDto) {
    return { item: this.service.createFromScenario(body) };
  }
}
