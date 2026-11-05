import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { requireUser } from '@/lib/dal';

/** Shell for every page behind login. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
