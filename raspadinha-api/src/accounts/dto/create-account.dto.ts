import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  @MinLength(2)
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  confirmPassword: string;

  @IsOptional()
  termsAccepted?: boolean;

  @IsString()
  @IsOptional()
  referralCode?: string;
}
