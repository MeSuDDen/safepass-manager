import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from 'class-validator';

export class resetPasswordDto {

  @IsNotEmpty()
  @IsString({message: 'Пароль должен быть строкой'})
  @Length(8, 25, {message: 'Пароль должен быть от 8 до 25 символов'})
  @IsStrongPassword({minUppercase: 1, minSymbols: 1, minLength: 8}, {message: 'Пароль должен содержать как минимум одну заглавную букву и один специальный символ'})
  password: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Поле не может быть пустое' })
  email: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsNotEmpty()
  code: string;
}