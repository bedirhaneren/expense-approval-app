import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={`rounded-card border border-border bg-surface shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

interface CardHeaderProps {
  title: string;
  icon: IconName;
  aside?: ReactNode;
}

export function CardHeader({ title, icon, aside }: CardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 pt-6">
      <h2 className="flex items-center gap-3 text-base font-semibold">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon name={icon} />
        </span>
        {title}
      </h2>
      {aside && <span className="text-xs text-ink-secondary">{aside}</span>}
    </header>
  );
}
