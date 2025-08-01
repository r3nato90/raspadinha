import { IsString, IsOptional, IsArray, IsNumber } from "class-validator"

export class ClaimScratchPrizeDto {
  @IsString()
  transactionId: string

  @IsOptional()
  @IsString()
  prizeId?: string | null

  @IsArray()
  @IsString({ each: true })
  positions: string[]

  @IsNumber()
  scratchedPercentage: number
}
