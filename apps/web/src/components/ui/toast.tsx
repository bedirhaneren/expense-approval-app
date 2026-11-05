'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './icon';

const VISIBLE_MS = 4000;

/**
 * Success message shown after an action redirects with ?notice=…. The param is
 * removed with the native History API, which updates the URL without
 * re-rendering the page, so a refresh does not show the message again.
 */
export function Toast({ message }: { message: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    window.history.replaceState(null, '', pathname);
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed top-20 right-4 left-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-modal sm:left-auto sm:w-96"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-white">
        <Icon name="check" />
      </span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Bildirimi kapat"
        className="text-ink-secondary hover:text-ink"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}
