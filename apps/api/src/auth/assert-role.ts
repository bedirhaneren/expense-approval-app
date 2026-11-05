import { ForbiddenException } from '@nestjs/common';
import type { Role } from '../generated/prisma/client.js';
import { AuthMessages } from './auth.constants.js';
import type { AuthUser } from './auth.types.js';

/** Service-level role check, as defense in depth behind the @Roles() guard. */
export function assertRole(user: AuthUser, role: Role): void {
  if (user.role !== role) {
    throw new ForbiddenException(AuthMessages.FORBIDDEN_ROLE);
  }
}
