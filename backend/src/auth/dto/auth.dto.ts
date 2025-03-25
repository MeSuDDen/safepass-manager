import {
  IsDate,
  IsEmail,
  IsHash,
  IsNotEmpty,
  IsString,
  IsStrongPassword, IsUUID,
  Length,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Поле не может быть пустое' })
  email: string;

  @IsNotEmpty()
  @IsString({message: 'Пароль должен быть строкой'})
  @Length(8, 25, {message: 'Пароль должен быть от 8 до 25 символов'})
  @IsStrongPassword({minUppercase: 1, minSymbols: 1, minLength: 8}, {message: 'Пароль должен содержать как минимум одну заглавную букву и один специальный символ'})
  password: string;

  @IsNotEmpty()
  @IsString({message: 'Пароль должен быть строкой'})
  @Length(8, 25, {message: 'Пароль должен быть от 8 до 25 символов'})
  @IsStrongPassword({minUppercase: 1, minSymbols: 1, minLength: 8}, {message: 'Пароль должен содержать как минимум одну заглавную букву и один специальный символ'})
  masterPassword:string;
}

export class EmailVerificationDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Код подтверждения должен содержать ровно 6 символов' })
  code: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  expiresAt: Date;
}

export class VerifyEmailDto {
  @IsNotEmpty()
  hash: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: string;
}

export class VerifyCodeDto {
  @IsNotEmpty({message: 'Поле для кода не может быть пустое'})
  @Length(6,6, {message: 'Длинна кода должна быть 6 символов'})
  code: string;
}