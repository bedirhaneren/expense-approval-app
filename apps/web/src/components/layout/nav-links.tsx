'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  /** Match only this exact path, not its sub-pages. */
  exact?: boolean;
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isActive = ({ href, exact }: NavItem) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav aria-label="Ana menü" className="flex items-center gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item) ? 'page' : undefined}
          className={`rounded-lg px-2.5 py-2 whitespace-nowrap transition-colors sm:px-3 ${
            isActive(item)
              ? 'bg-primary-soft font-medium text-primary'
              : 'text-ink-secondary hover:bg-surface-muted hover:text-ink'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
