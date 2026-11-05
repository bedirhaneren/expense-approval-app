import type { ExpenseStatus } from '../generated/prisma/client.js';

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  DRAFT: 'Taslak',
  PENDING_MANAGER: 'Yönetici Onayı Bekliyor',
  PENDING_ACCOUNTING: 'Muhasebe Onayı Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
};

export const ExpenseMessages = {
  NOT_FOUND: 'Masraf bulunamadı.',
  NOT_EDITABLE: 'Yalnızca taslak durumundaki masraflar düzenlenebilir.',
  invalidTransition: (status: ExpenseStatus) =>
    `Masraf "${EXPENSE_STATUS_LABELS[status]}" durumunda olduğu için bu işlem yapılamaz.`,
} as const;
