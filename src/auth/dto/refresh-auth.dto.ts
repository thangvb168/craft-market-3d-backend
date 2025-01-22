import { IsEmail, IsNotEmpty } from 'class-validator';

export class RefreshAuthDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  verifiedId: string;
}
