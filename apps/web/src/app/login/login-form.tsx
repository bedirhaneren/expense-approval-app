'use client';

import { useActionState, useState } from 'react';
import { login, type LoginState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClasses } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import type { Role } from '@/lib/api/types';
import { ROLE_LABELS } from '@/lib/labels';

/** Demo accounts from the seed; documented in the README. */
const DEMO_ACCOUNTS: { username: string; role: Role }[] = [
  { username: 'ali', role: 'EMPLOYEE' },
  { username: 'veli', role: 'EMPLOYEE' },
  { username: 'ahmet', role: 'MANAGER' },
  { username: 'ayse', role: 'ACCOUNTING' },
];
const DEMO_PASSWORD = 'Demo123!';

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );
  const [username, setUsername] = useState(state.login ?? '');

  return (
    <>
      <Card className="p-6 sm:p-8">
        <form action={formAction} className="flex flex-col gap-5">
          <Field id="login" label="Kullanıcı adı veya e-posta">
            <input
              id="login"
              name="login"
              required
              autoComplete="username"
              placeholder="ornek@sirket.com veya kullanıcı adı"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClasses()}
            />
          </Field>
          <Field id="password" label="Şifre">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClasses()}
            />
          </Field>

          <Button
            type="submit"
            pending={pending}
            pendingLabel="Giriş yapılıyor..."
            className="w-full"
          >
            Giriş Yap
          </Button>

          {state.error && (
            <div
              role="alert"
              className="flex gap-3 rounded-lg bg-status-rejected-bg p-4 text-danger-strong"
            >
              <Icon name="error" />
              <p className="font-medium">{state.error}</p>
            </div>
          )}
        </form>
      </Card>

      <section
        aria-label="Demo hesapları"
        className="flex flex-col gap-3 rounded-card bg-primary-soft p-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-ink-secondary uppercase">
            Demo hesapları
          </h2>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs">
            Şifre: <strong className="font-semibold">{DEMO_PASSWORD}</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => setUsername(account.username)}
              className="flex flex-col items-start rounded-lg bg-surface px-3 py-2 text-left hover:ring-2 hover:ring-primary-ring"
            >
              <span className="font-medium">{account.username}</span>
              <span className="text-xs text-ink-secondary">
                {ROLE_LABELS[account.role]}
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
