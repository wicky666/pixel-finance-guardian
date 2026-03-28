import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ScenarioModule } from "../scenario/scenario.module";
import { ShadowModule } from "../shadow/shadow.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [AuthModule, ScenarioModule, ShadowModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
