import { Module } from "@nestjs/common";
import { ShadowController } from "./shadow.controller";
import { ShadowService } from "./shadow.service";

@Module({
  controllers: [ShadowController],
  providers: [ShadowService],
  exports: [ShadowService],
})
export class ShadowModule {}
