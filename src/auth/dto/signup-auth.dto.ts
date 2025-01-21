import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupAuthDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
