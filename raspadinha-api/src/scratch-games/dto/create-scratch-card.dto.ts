import { IsString, IsNumber, IsBoolean, IsOptional } from "class-validator"

export class CreateScratchCardDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsNumber()
  amount: number

  @IsString()
  image: string

  @IsBoolean()
  @IsOptional()
  active?: boolean = true

  @IsNumber()
  @IsOptional()
  rtp?: number = 80
}
