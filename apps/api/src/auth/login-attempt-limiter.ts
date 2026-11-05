import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthMessages } from './auth.constants.js';

export const MAX_FAILED_LOGINS = 10;
export const FAILED_LOGIN_WINDOW_MS = 60_000;

/**
 * Slows down password guessing: after too many failed logins for an account
 * within a minute, further attempts for that account are refused.
 *
 * Counted per account rather than per IP address, because every request
 * reaches the API from the Next.js server, so all users would share one IP.
 * Only failures count, so a user who logs in correctly is never blocked.
 * Kept in memory, which suits a single API instance.
 */
@Injectable()
export class LoginAttemptLimiter {
  private readonly failuresByAccount = new Map<string, number[]>();

  assertNotBlocked(account: string): void {
    if (this.recentFailures(account).length >= MAX_FAILED_LOGINS) {
      throw new HttpException(
        AuthMessages.TOO_MANY_LOGIN_ATTEMPTS,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(account: string): void {
    this.failuresByAccount.set(account, [
      ...this.recentFailures(account),
      Date.now(),
    ]);
  }

  reset(account: string): void {
    this.failuresByAccount.delete(account);
  }

  /** Failures inside the window; older ones are dropped as a side effect. */
  private recentFailures(account: string): number[] {
    const windowStart = Date.now() - FAILED_LOGIN_WINDOW_MS;
    const recent = (this.failuresByAccount.get(account) ?? []).filter(
      (timestamp) => timestamp > windowStart,
    );

    if (recent.length === 0) {
      this.failuresByAccount.delete(account);
    }
    return recent;
  }
}
