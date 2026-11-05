import type { Request } from 'express';
import type { Role } from '../generated/prisma/client.js';

/**
 * The authenticated user attached to every request. Never contains the password hash.
 * A class (not an interface) so the OpenAPI document can describe it.
 */
export class AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  managerId: string | null;
}

export interface JwtPayload {
  sub: string;
}

export class LoginResponse {
  /** Bearer token, 8 saat geçerli */
  accessToken: string;
  user: AuthUser;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
