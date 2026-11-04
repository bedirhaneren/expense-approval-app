import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthMessages } from '../auth.constants.js';
import { AuthService } from '../auth.service.js';
import type {
  AuthenticatedRequest,
  AuthUser,
  JwtPayload,
} from '../auth.types.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Registered globally: every route requires a valid Bearer token unless it is
 * marked with @Public(). The user is reloaded from the database on each request
 * so that role or manager changes take effect immediately.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException(AuthMessages.LOGIN_REQUIRED);
    }

    request.user = await this.authenticate(token);
    return true;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false
    );
  }

  private async authenticate(token: string): Promise<AuthUser> {
    const payload = await this.verifyToken(token);
    const user = await this.authService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(AuthMessages.SESSION_INVALID);
    }
    return user;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(AuthMessages.SESSION_INVALID);
    }
  }
}

function extractBearerToken(request: Request): string | undefined {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme === 'Bearer' ? token : undefined;
}
