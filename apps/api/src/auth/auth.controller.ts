import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrors } from '../docs/api-errors.decorator.js';
import { AuthService } from './auth.service.js';
import type { AuthUser, LoginResponse } from './auth.types.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Kullanıcı adı veya e-posta ile giriş yapar, erişim token’ı döner',
    description:
      'Aynı hesaba 1 dakika içinde 10 hatalı denemeden sonra hesap 1 dakika kilitlenir. Başarılı giriş sayacı sıfırlar.',
  })
  @ApiErrors(400, 401, 429)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Giriş yapmış kullanıcının bilgilerini döner' })
  @ApiBearerAuth()
  @ApiErrors(401)
  @Get('me')
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
