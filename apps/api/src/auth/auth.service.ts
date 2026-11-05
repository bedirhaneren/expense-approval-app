import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthMessages } from './auth.constants.js';
import type { AuthUser, JwtPayload, LoginResponse } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import { LoginAttemptLimiter } from './login-attempt-limiter.js';
import { normalizeLoginIdentifier } from './login-identifier.js';

const AUTH_USER_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  role: true,
  managerId: true,
} satisfies Prisma.UserSelect;

/**
 * Compared against when the user does not exist, so that a login attempt takes
 * the same time either way and does not reveal which usernames are valid.
 */
const DUMMY_PASSWORD_HASH =
  '$2b$10$Uw25lwws0QNDJrW2i4WgBuS0JBbnY4Fl7/xA4JjPu00zfbl0ojznO';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly loginAttempts: LoginAttemptLimiter,
  ) {}

  async login({ login, password }: LoginDto): Promise<LoginResponse> {
    const user = await this.verifyCredentials(login, password);
    const payload: JwtPayload = { sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, user };
  }

  findUserById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: AUTH_USER_SELECT,
    });
  }

  private async verifyCredentials(
    login: string,
    password: string,
  ): Promise<AuthUser> {
    const identifier = normalizeLoginIdentifier(login);
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: identifier }, { email: identifier }] },
      select: { ...AUTH_USER_SELECT, passwordHash: true },
    });

    // One counter per account, whether it is addressed by username or email.
    const account = user?.id ?? identifier;
    this.loginAttempts.assertNotBlocked(account);

    const isPasswordValid = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!user || !isPasswordValid) {
      this.loginAttempts.recordFailure(account);
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    }

    this.loginAttempts.reset(account);
    const { passwordHash: _passwordHash, ...authUser } = user;
    return authUser;
  }
}
