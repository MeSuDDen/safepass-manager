import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsHash, IsIn,
  IsNotEmpty, IsOptional,
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
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(8, 25, { message: 'Пароль должен быть от 8 до 25 символов' })
  @IsStrongPassword({ minUppercase: 1, minSymbols: 1, minLength: 8 }, { message: 'Пароль должен содержать как минимум одну заглавную букву и один специальный символ' })
  password: string;

  @IsNotEmpty()
  @IsString({ message: 'ППароль должен быть строкой' })
  @Length(8, 25, { message: 'ППароль должен быть от 8 до 25 символов' })
  @IsStrongPassword({ minUppercase: 1, minSymbols: 1, minLength: 8 }, { message: 'ППароль должен содержать как минимум одну заглавную букву и один специальный символ' })
  masterPassword: string;

  @IsNotEmpty()
  @IsString({ message: 'ППароль должен быть строкой' })
  confirmMasterPassword: string;


  @IsOptional()
  @IsIn(['user', 'admin']) // Только разрешенные роли
  role?: string;
  // Уберите confirmMasterPassword, если он не должен быть частью DTO
  // Валидацию на совпадение masterPassword и confirmMasterPassword можно делать на уровне сервера, если поля для этого не отправляются

  @IsBoolean({always: true})
  agree: boolean;
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