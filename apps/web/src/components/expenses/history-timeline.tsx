import type { ExpenseAction, ExpenseHistoryEntry } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { ACTION_LABELS } from '@/lib/labels';
import { Card, CardHeader } from '../ui/card';
import { Icon, type IconName } from '../ui/icon';

type Tone = 'neutral' | 'positive' | 'negative';

const ACTION_STYLE: Record<ExpenseAction, { icon: IconName; tone: Tone }> = {
  CREATED: { icon: 'edit', tone: 'neutral' },
  UPDATED: { icon: 'edit', tone: 'neutral' },
  SUBMITTED: { icon: 'send', tone: 'neutral' },
  MANAGER_APPROVED: { icon: 'check', tone: 'positive' },
  MANAGER_REJECTED: { icon: 'close', tone: 'negative' },
  ACCOUNTING_APPROVED: { icon: 'check', tone: 'positive' },
  ACCOUNTING_REJECTED: { icon: 'close', tone: 'negative' },
};

const TONE_CLASSES: Record<Tone, { dot: string; title: string }> = {
  neutral: { dot: 'bg-primary-soft text-primary', title: '' },
  positive: {
    dot: 'bg-status-approved-bg text-status-approved-text',
    title: 'text-status-approved-text',
  },
  negative: {
    dot: 'bg-status-rejected-bg text-danger',
    title: 'text-danger-strong',
  },
};

export function HistoryTimeline({
  entries,
}: {
  entries: ExpenseHistoryEntry[];
}) {
  return (
    <Card>
      <CardHeader
        title="İşlem Geçmişi"
        icon="history"
        aside={`${entries.length} kayıt`}
      />
      <ol className="flex flex-col p-6">
        {entries.map((entry, index) => (
          <TimelineItem
            key={entry.id}
            entry={entry}
            isLast={index === entries.length - 1}
          />
        ))}
      </ol>
    </Card>
  );
}

function TimelineItem({
  entry,
  isLast,
}: {
  entry: ExpenseHistoryEntry;
  isLast: boolean;
}) {
  const { icon, tone } = ACTION_STYLE[entry.action];

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-border"
        />
      )}
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone].dot}`}
      >
        <Icon name={icon} className="text-base" />
      </span>
      <div className="flex flex-1 flex-col gap-1 pt-1">
        <p className={`font-semibold ${TONE_CLASSES[tone].title}`}>
          {ACTION_LABELS[entry.action]}
        </p>
        <p className="text-ink-secondary">
          {entry.actor.fullName} ·{' '}
          <time dateTime={entry.createdAt} className="tabular-nums">
            {formatDateTime(entry.createdAt)}
          </time>
        </p>
        {entry.reason && (
          <blockquote className="mt-1 rounded-lg bg-danger-soft px-3 py-2">
            <span className="block text-xs font-medium text-danger-strong">
              Red gerekçesi
            </span>
            “{entry.reason}”
          </blockquote>
        )}
      </div>
    </li>
  );
}
