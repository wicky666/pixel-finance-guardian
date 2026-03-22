import { IsIn, IsInt, Min } from "class-validator";

export class GenerateReviewDto {
  @IsIn(["standard", "share"])
  style!: "standard" | "share";

  @IsIn(["calm", "real", "sharp"])
  tone!: "calm" | "real" | "sharp";

  @IsInt()
  @Min(0)
  seed!: number;
}
