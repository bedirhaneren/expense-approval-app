import type { ReactNode } from 'react';
import type { ExpenseDetail } from '@/lib/api/types';
import { formatDate, formatMoney } from '@/lib/format';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/labels';
import { Card, CardHeader } from '../ui/card';
import { Icon } from '../ui/icon';

export function ExpenseInfoCard({ expense }: { expense: ExpenseDetail }) {
  return (
    <Card>
      <CardHeader title="Masraf Bilgileri" icon="receipt_long" />
      <div className="flex flex-col gap-6 p-6">
        <dl className="grid grid-cols-1 gap-5 rounded-lg bg-canvas p-5 sm:grid-cols-2">
          <InfoItem label="Masraf Tarihi">
            <span className="tabular-nums">
              {formatDate(expense.expenseDate)}
            </span>
          </InfoItem>
          <InfoItem label="Kategori">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-1 text-sm text-primary">
              <Icon name={CATEGORY_ICONS[expense.category]} />
              {CATEGORY_LABELS[expense.category]}
            </span>
          </InfoItem>
          <InfoItem label="Tutar">
            <span className="text-xl font-semibold tabular-nums">
              {formatMoney(expense.amount)}
            </span>
          </InfoItem>
          <InfoItem label="Masraf Sahibi">{expense.owner.fullName}</InfoItem>
        </dl>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm text-ink-secondary">Not</h3>
          <p className={expense.note ? '' : 'text-ink-muted'}>
            {expense.note ?? 'Not eklenmemiş.'}
          </p>
        </div>
      </div>
    </Card>
  );
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-sm text-ink-secondary">{label}</dt>
      <dd className="text-base">{children}</dd>
    </div>
  );
}
