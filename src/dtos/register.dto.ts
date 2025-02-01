import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { UserRole } from '../enums/UserRole';

@ValidatorConstraint({ name: 'matchPassword', async: false })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const object = args.object as RegisterDTO;
    return object.password === confirmPassword;
  }

  defaultMessage(): string {
    return 'error.passwords_do_not_match';
  }
}

export class RegisterDTO {
  @IsString({ message: 'error.name_required' })
  @MinLength(3, { message: 'error.name_length' })
  @Matches(/\S/, { message: 'error.name_length' })
  name: string;

  @IsString({ message: 'error.email_required' })
  @IsEmail({}, { message: 'error.email_invalid' })
  email: string;

  @IsString({ message: 'error.password_required' })
  @MinLength(6, { message: 'error.password_length' })
  password: string;

  @IsString({ message: 'error.confirm_password_required' })
  @Validate(MatchPasswordConstraint)
  confirmPassword: string;

  @IsEnum(['Male', 'Female'], { message: 'error.gender_invalid' })
  gender: 'Male' | 'Female';

  @IsNotEmpty({ message: 'error.phone_required' })
  @Matches(/^(?:\+\d{1,3}|0)\d{8,12}$/, { message: 'error.phone_invalid' })
  phone: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'error.role_invalid' })
  role?: UserRole;

  @IsOptional()
  about?: string;
}
