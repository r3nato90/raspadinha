import { IsString, IsNumber, IsEnum } from 'class-validator'
import { ScratchStatus } from '@prisma/client'

export class CreateScratchCardDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsString()
  image: string

  @IsEnum(ScratchStatus)
  status: ScratchStatus

  @IsNumber()
  amount: number

  @IsNumber()
  rtp: number
}
