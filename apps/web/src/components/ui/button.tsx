import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';
import { Icon, type IconName } from './icon';

type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'danger-outline';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'border border-border bg-surface text-ink hover:border-border-strong hover:bg-canvas',
  ghost: 'text-ink-secondary hover:bg-surface-muted hover:text-ink',
  success: 'bg-success text-white hover:bg-success-hover',
  danger: 'bg-danger-strong text-white hover:bg-red-800',
  'danger-outline':
    'border border-status-rejected-bg bg-surface text-danger hover:border-status-rejected-border hover:bg-danger-soft',
};

const BASE_CLASSES =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium whitespace-nowrap transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-ring ' +
  'disabled:pointer-events-none disabled:opacity-50';

export function buttonClasses(variant: ButtonVariant = 'primary'): string {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: IconName;
  /** Shows a spinner and disables the button while an action is running. */
  pending?: boolean;
  pendingLabel?: string;
}

export function Button({
  variant = 'primary',
  icon,
  pending = false,
  pendingLabel,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending}
      className={`${buttonClasses(variant)} ${className}`}
      {...props}
    >
      {pending ? (
        <Icon name="progress_activity" className="animate-spin" />
      ) : (
        icon && <Icon name={icon} />
      )}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  icon?: IconName;
}

export function LinkButton({
  variant = 'primary',
  icon,
  className = '',
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={`${buttonClasses(variant)} ${className}`} {...props}>
      {icon && <Icon name={icon} />}
      {children}
    </Link>
  );
}
