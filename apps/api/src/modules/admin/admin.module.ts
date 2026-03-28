import { Module } from "@nestjs/common";
import { ScenarioModule } from "../scenario/scenario.module";
import { ShadowModule } from "../shadow/shadow.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [ScenarioModule, ShadowModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
