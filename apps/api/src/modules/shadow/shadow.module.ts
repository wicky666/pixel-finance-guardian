import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ShadowController } from "./shadow.controller";
import { ShadowService } from "./shadow.service";

@Module({
  imports: [AuthModule],
  controllers: [ShadowController],
  providers: [ShadowService],
  exports: [ShadowService],
})
export class ShadowModule {}
