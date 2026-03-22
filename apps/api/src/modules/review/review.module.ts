import { Module } from "@nestjs/common";
import { ScenarioModule } from "../scenario/scenario.module";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";

@Module({
  imports: [ScenarioModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
