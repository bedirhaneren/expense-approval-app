import type { Request } from 'express';
import type { Role } from '../generated/prisma/client.js';

/** The authenticated user attached to every request. Never contains the password hash. */
export interface AuthUser {
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

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
