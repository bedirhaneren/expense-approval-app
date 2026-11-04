import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/client.js';
import type { AuthUser } from '../auth.types.js';
import { RolesGuard } from './roles.guard.js';

function createContext(user?: Partial<AuthUser>): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function createGuard(requiredRoles?: Role[]): RolesGuard {
  const reflector = {
    getAllAndOverride: () => requiredRoles,
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows any authenticated user when no roles are required', () => {
    const guard = createGuard();
    expect(guard.canActivate(createContext({ role: Role.EMPLOYEE }))).toBe(
      true,
    );
  });

  it('allows a user whose role is in the required list', () => {
    const guard = createGuard([Role.MANAGER, Role.ACCOUNTING]);
    expect(guard.canActivate(createContext({ role: Role.ACCOUNTING }))).toBe(
      true,
    );
  });

  it('rejects a user whose role is not in the required list', () => {
    const guard = createGuard([Role.MANAGER]);
    expect(() =>
      guard.canActivate(createContext({ role: Role.EMPLOYEE })),
    ).toThrow(ForbiddenException);
  });

  it('rejects when roles are required but no user is attached', () => {
    const guard = createGuard([Role.MANAGER]);
    expect(() => guard.canActivate(createContext())).toThrow(
      ForbiddenException,
    );
  });
});
