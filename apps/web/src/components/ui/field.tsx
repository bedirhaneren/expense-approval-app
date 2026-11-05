import type { ReactNode } from 'react';
import { Icon } from './icon';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Label above the control and the error message right below it. */
export function Field({
  id,
  label,
  required = false,
  optional = false,
  error,
  children,
  className = '',
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
        {optional && (
          <span className="font-normal text-ink-secondary"> (opsiyonel)</span>
        )}
      </label>
      {children}
      {error && (
        <p
          id={errorIdFor(id)}
          className="flex items-center gap-1.5 text-xs text-danger"
        >
          <Icon name="error" />
          {error}
        </p>
      )}
    </div>
  );
}

export const errorIdFor = (id: string) => `${id}-error`;

/** Shared input styling, with a red border when the field has an error. */
export function inputClasses(hasError = false): string {
  const state = hasError
    ? 'border-danger bg-danger-soft focus:border-danger focus:ring-red-100'
    : 'border-border-strong bg-surface focus:border-primary focus:ring-primary/15';
  return (
    'w-full rounded-lg border px-3 py-2 text-sm text-ink placeholder:text-ink-muted ' +
    `transition-colors focus:ring-3 focus:outline-none ${state}`
  );
}
