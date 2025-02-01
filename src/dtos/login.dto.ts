import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @IsString({ message: 'error.email_required' })
  @IsEmail({}, { message: 'error.email_invalid' })
  email: string;

  @IsString({ message: 'error.password_required' })
  @MinLength(6, { message: 'error.password_length' })
  password: string;
}
