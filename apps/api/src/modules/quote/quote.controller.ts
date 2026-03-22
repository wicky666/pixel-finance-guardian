import { Controller, Get, Query } from "@nestjs/common";
import { QuoteService } from "./quote.service";

@Controller("quote")
export class QuoteController {
  constructor(private readonly service: QuoteService) {}

  @Get("search")
  async search(@Query("q") q?: string) {
    return { items: await this.service.search(q ?? "") };
  }

  @Get("latest")
  async latest(@Query("symbol") symbol?: string) {
    if (!symbol) return { ok: false, message: "缺少代码" };
    return this.service.latest(symbol);
  }
}
