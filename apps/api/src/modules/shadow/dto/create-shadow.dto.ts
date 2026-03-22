import { IsNumberString, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateShadowDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  symbol!: string;

  @IsNumberString()
  currentQuantity!: string;

  @IsNumberString()
  currentAverageCost!: string;

  @IsNumberString()
  currentPrice!: string;

  @IsNumberString()
  addQuantity!: string;

  @IsNumberString()
  addAmount!: string;

  @IsNumberString()
  newAverageCost!: string;
}
