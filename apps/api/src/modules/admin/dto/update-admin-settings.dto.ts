import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class FeatureFlagsDto {
  @IsOptional()
  @IsBoolean()
  scenarioWriteEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  reviewGenerationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  shadowCompareEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  quoteSearchEnabled?: boolean;
}

class RiskRulesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  dailyScenarioLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(240)
  rapidActionWindowMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  maxReviewSeed?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  abnormalImpactScore?: number;
}

export class UpdateAdminSettingsDto {
  @IsOptional()
  @IsString()
  workspaceName?: string;

  @IsOptional()
  @IsEnum(["development", "staging", "production"])
  environment?: "development" | "staging" | "production";

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  apiBaseUrl?: string;

  @IsOptional()
  @IsEmail()
  adminContact?: string;

  @IsOptional()
  @IsEnum(["standard", "share"])
  defaultReviewStyle?: "standard" | "share";

  @IsOptional()
  @IsEnum(["calm", "real", "sharp"])
  defaultReviewTone?: "calm" | "real" | "sharp";

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FeatureFlagsDto)
  featureFlags?: FeatureFlagsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RiskRulesDto)
  riskRules?: RiskRulesDto;
}
