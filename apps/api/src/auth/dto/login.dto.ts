import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Kullanıcı adı veya e-posta metin olmalıdır.' })
  @IsNotEmpty({ message: 'Kullanıcı adı veya e-posta zorunludur.' })
  @MaxLength(100, {
    message: 'Kullanıcı adı veya e-posta en fazla 100 karakter olabilir.',
  })
  login: string;

  @IsString({ message: 'Şifre metin olmalıdır.' })
  @IsNotEmpty({ message: 'Şifre zorunludur.' })
  @MaxLength(100, { message: 'Şifre en fazla 100 karakter olabilir.' })
  password: string;
}
