'use server';

import { redirect } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api/client';
import type { LoginResponse } from '@/lib/api/types';
import { HOME_PATH_BY_ROLE, LOGIN_PATH } from '@/lib/routes';
import { clearSession, saveSessionToken } from '@/lib/session';

export interface LoginState {
  error?: string;
  login?: string;
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const credentials = {
    login: String(formData.get('login') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  let response: LoginResponse;
  try {
    response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.messages[0], login: credentials.login };
    }
    throw error;
  }

  await saveSessionToken(response.accessToken);
  redirect(HOME_PATH_BY_ROLE[response.user.role]);
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect(LOGIN_PATH);
}
