import { IsDateString, IsNumberString, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateScenarioDto {
  /** 与 Web 本地 localStorage 对齐时可传 */
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsString()
  @Length(1, 24)
  symbol!: string;

  @IsNumberString()
  currentQuantity!: string;

  @IsNumberString()
  currentAverageCost!: string;

  @IsNumberString()
  currentPrice!: string;

  @IsNumberString()
  addAmount!: string;

  @IsNumberString()
  addQuantity!: string;

  @IsNumberString()
  newAverageCost!: string;
}
