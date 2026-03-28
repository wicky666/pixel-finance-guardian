import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { ScenarioModule } from "./scenario/scenario.module";
import { ReviewModule } from "./review/review.module";
import { QuoteModule } from "./quote/quote.module";
import { ShadowModule } from "./shadow/shadow.module";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    ScenarioModule,
    ReviewModule,
    QuoteModule,
    ShadowModule,
    AuthModule,
    AdminModule,
  ],
})
export class AppModule {}
