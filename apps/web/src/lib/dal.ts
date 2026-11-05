import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { ApiError, apiRequest } from './api/client';
import type {
  AuthUser,
  ExpenseDetail,
  ExpenseSummary,
  ReviewStage,
  Role,
} from './api/types';
import { HOME_PATH_BY_ROLE, LOGIN_PATH } from './routes';
import { readSessionToken } from './session';

/**
 * Data Access Layer: the only place pages read the session or fetch data.
 * The API is the real authority; these checks only decide what to render.
 */

/** The logged-in user, verified by the API. Memoized per request. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = await readSessionToken();
  if (!token) return null;

  try {
    return await apiRequest<AuthUser>('/auth/me', { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

/** Redirects to login, or to the user's own home page if their role is not allowed. */
export async function requireUser(...allowedRoles: Role[]): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    redirect(HOME_PATH_BY_ROLE[user.role]);
  }
  return user;
}

export async function requireSessionToken(): Promise<string> {
  const token = await readSessionToken();
  if (!token) redirect(LOGIN_PATH);
  return token;
}

export function fetchMyExpenses(): Promise<ExpenseSummary[]> {
  return authorizedGet('/expenses');
}

export function fetchExpense(id: string): Promise<ExpenseDetail> {
  return authorizedGet(`/expenses/${encodeURIComponent(id)}`);
}

export function fetchPendingExpenses(
  stage: ReviewStage,
): Promise<ExpenseSummary[]> {
  return authorizedGet(`/approvals/${stage}`);
}

async function authorizedGet<T>(path: string): Promise<T> {
  const token = await requireSessionToken();
  try {
    return await apiRequest<T>(path, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(LOGIN_PATH);
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
