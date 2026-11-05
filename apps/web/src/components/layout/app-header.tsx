import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import type { AuthUser, Role } from '@/lib/api/types';
import { ROLE_LABELS } from '@/lib/labels';
import { HOME_PATH_BY_ROLE } from '@/lib/routes';
import { Icon } from '../ui/icon';
import { NavLinks, type NavItem } from './nav-links';

/** Each role only sees the pages it can use. */
const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  EMPLOYEE: [
    { href: '/expenses', label: 'Masraflarım', exact: true },
    { href: '/expenses/new', label: 'Yeni Masraf', exact: true },
  ],
  MANAGER: [{ href: '/approvals/manager', label: 'Onay Bekleyenler' }],
  ACCOUNTING: [{ href: '/approvals/accounting', label: 'Muhasebe Onayı' }],
};

export function AppHeader({ user }: { user: AuthUser }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link
          href={HOME_PATH_BY_ROLE[user.role]}
          className="flex items-center gap-2.5 font-semibold"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon name="receipt_long" />
          </span>
          <span className="hidden text-base sm:inline">Masraf Bildirim</span>
        </Link>

        <NavLinks items={NAV_ITEMS_BY_ROLE[user.role]} />

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden flex-col items-end leading-tight sm:flex">
            <span className="font-medium">{user.fullName}</span>
            <span className="text-xs text-ink-secondary">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <span className="hidden size-9 items-center justify-center rounded-full bg-primary text-white sm:flex">
            <Icon name="person" />
          </span>
          <form
            action={logout}
            className="sm:border-l sm:border-border sm:pl-3"
          >
            <button
              type="submit"
              aria-label="Çıkış"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-secondary hover:bg-surface-muted hover:text-ink"
            >
              <Icon name="logout" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
