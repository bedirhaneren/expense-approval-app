import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { Role } from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthMessages } from './auth.constants.js';
import { AuthService } from './auth.service.js';
import type { JwtPayload } from './auth.types.js';

const PASSWORD = 'Demo123!';

const storedUser = {
  id: '6f1c2a40-0000-4000-8000-000000000001',
  username: 'ali',
  email: 'ali@demo.local',
  fullName: 'Ali Çalışan',
  role: Role.EMPLOYEE,
  managerId: '6f1c2a40-0000-4000-8000-000000000002',
  passwordHash: bcrypt.hashSync(PASSWORD, 4),
};

describe('AuthService', () => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  const findFirst = vi.fn();
  const prisma = { user: { findFirst } } as unknown as PrismaService;
  const authService = new AuthService(prisma, jwtService);

  beforeEach(() => {
    findFirst.mockReset();
  });

  it('returns a signed token and the user without the password hash', async () => {
    findFirst.mockResolvedValue(storedUser);

    const result = await authService.login({
      login: 'ali',
      password: PASSWORD,
    });

    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.username).toBe('ali');
    const payload = await jwtService.verifyAsync<JwtPayload>(
      result.accessToken,
    );
    expect(payload.sub).toBe(storedUser.id);
  });

  it('normalizes the login identifier before looking up the user', async () => {
    findFirst.mockResolvedValue(storedUser);

    await authService.login({ login: '  ALI@Demo.Local ', password: PASSWORD });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ username: 'ali@demo.local' }, { email: 'ali@demo.local' }],
        },
      }),
    );
  });

  it('rejects a wrong password', async () => {
    findFirst.mockResolvedValue(storedUser);

    await expect(
      authService.login({ login: 'ali', password: 'wrong-password' }),
    ).rejects.toThrow(
      new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS),
    );
  });

  it('rejects an unknown user with the same message as a wrong password', async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      authService.login({ login: 'nobody', password: PASSWORD }),
    ).rejects.toThrow(
      new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS),
    );
  });
});
