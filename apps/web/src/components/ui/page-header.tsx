import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './icon';

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {back && (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-2 text-sm text-ink-secondary hover:text-ink"
        >
          <Icon name="arrow_back" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-ink-secondary">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}
