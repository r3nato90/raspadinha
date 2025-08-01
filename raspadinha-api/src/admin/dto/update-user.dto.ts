import { IsOptional, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator'
import { UserRole } from '@prisma/client'

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsEnum(UserRole) role?: UserRole
  @IsOptional() @IsNumber() balance?: number
  @IsOptional() @IsString() affiliateCode?: string
  @IsOptional() @IsNumber() affiliateRate?: number
}
