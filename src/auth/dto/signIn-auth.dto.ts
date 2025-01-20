import { IsNotEmpty } from 'class-validator';

export class SignInAuthDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
