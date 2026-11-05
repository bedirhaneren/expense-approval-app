import { HttpException, HttpStatus } from '@nestjs/common';
import {
  FAILED_LOGIN_WINDOW_MS,
  LoginAttemptLimiter,
  MAX_FAILED_LOGINS,
} from './login-attempt-limiter.js';

describe('LoginAttemptLimiter', () => {
  let limiter: LoginAttemptLimiter;

  const failTimes = (account: string, count: number) => {
    for (let i = 0; i < count; i++) limiter.recordFailure(account);
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-11-05T10:00:00Z') });
    limiter = new LoginAttemptLimiter();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows attempts below the limit', () => {
    failTimes('ali', MAX_FAILED_LOGINS - 1);

    expect(() => limiter.assertNotBlocked('ali')).not.toThrow();
  });

  it('blocks an account with 429 once the limit is reached', () => {
    failTimes('ali', MAX_FAILED_LOGINS);

    expect(() => limiter.assertNotBlocked('ali')).toThrow(HttpException);
    try {
      limiter.assertNotBlocked('ali');
    } catch (error) {
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  });

  it('only blocks the account that failed', () => {
    failTimes('ali', MAX_FAILED_LOGINS);

    expect(() => limiter.assertNotBlocked('veli')).not.toThrow();
  });

  it('unblocks once the failures fall out of the time window', () => {
    failTimes('ali', MAX_FAILED_LOGINS);

    vi.advanceTimersByTime(FAILED_LOGIN_WINDOW_MS + 1);

    expect(() => limiter.assertNotBlocked('ali')).not.toThrow();
  });

  it('forgets failures after a successful login', () => {
    failTimes('ali', MAX_FAILED_LOGINS);

    limiter.reset('ali');

    expect(() => limiter.assertNotBlocked('ali')).not.toThrow();
  });
});
