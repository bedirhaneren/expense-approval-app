import { redirect } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { getCurrentUser } from '@/lib/dal';
import { HOME_PATH_BY_ROLE } from '@/lib/routes';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(HOME_PATH_BY_ROLE[user.role]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon name="receipt_long" className="text-3xl" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Masraf Bildirim
          </h1>
          <p className="text-ink-secondary">Hesabınıza giriş yapın</p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
