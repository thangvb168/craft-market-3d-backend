import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SignupAuthDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  avatar: string;

  @IsOptional()
  phone: string;
}
