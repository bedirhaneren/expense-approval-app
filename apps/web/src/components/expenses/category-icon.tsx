import type { ExpenseCategory } from '@/lib/api/types';
import { CATEGORY_ICONS } from '@/lib/labels';
import { Icon } from '../ui/icon';

export function CategoryIcon({ category }: { category: ExpenseCategory }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      <Icon name={CATEGORY_ICONS[category]} />
    </span>
  );
}
