'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon, type IconName } from './icon';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon: IconName;
  tone?: 'primary' | 'danger';
  children: ReactNode;
}

const TONE_CLASSES = {
  primary: { icon: 'bg-primary-soft text-primary', accent: '' },
  danger: {
    icon: 'bg-status-rejected-bg text-danger',
    accent: 'border-t-4 border-t-danger-strong',
  },
};

/** Native <dialog>: focus trapping, Escape to close and the backdrop come for free. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  icon,
  tone = 'primary',
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-border-strong bg-surface p-0 text-ink shadow-modal ${TONE_CLASSES[tone].accent}`}
    >
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <header className="flex items-start gap-4">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone].icon}`}
          >
            <Icon name={icon} className="text-2xl" />
          </span>
          <div className="flex-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-ink-secondary">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex size-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-muted"
          >
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
