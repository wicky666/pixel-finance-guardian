import { Body, Controller, Post } from "@nestjs/common";
import { GenerateReviewDto } from "./dto/generate-review.dto";
import { ReviewService } from "./review.service";

@Controller("reviews")
export class ReviewController {
  constructor(private readonly review: ReviewService) {}

  @Post("generate")
  generate(@Body() body: GenerateReviewDto) {
    const content = this.review.generate(body.style, body.seed, body.tone);
    return {
      style: body.style,
      tone: body.tone,
      seed: body.seed,
      sections: {
        fact: content.fact,
        context: content.context,
        decision: content.decision,
        keyline: content.keyline,
      },
    };
  }
}
