import type { IconName } from '@/components/ui/icon';
import type {
  ExpenseAction,
  ExpenseCategory,
  ExpenseStatus,
  Role,
} from './api/types';

export const STATUS_LABELS: Record<ExpenseStatus, string> = {
  DRAFT: 'Taslak',
  PENDING_MANAGER: 'Yönetici Onayı Bekliyor',
  PENDING_ACCOUNTING: 'Muhasebe Onayı Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  TRANSPORT: 'Ulaşım',
  MEAL: 'Yemek',
  ACCOMMODATION: 'Konaklama',
  OTHER: 'Diğer',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, IconName> = {
  TRANSPORT: 'local_taxi',
  MEAL: 'restaurant',
  ACCOMMODATION: 'hotel',
  OTHER: 'description',
};

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: 'Çalışan',
  MANAGER: 'Yönetici',
  ACCOUNTING: 'Muhasebe',
};

export const ACTION_LABELS: Record<ExpenseAction, string> = {
  CREATED: 'Masraf oluşturuldu',
  UPDATED: 'Taslak güncellendi',
  SUBMITTED: 'Yönetici onayına gönderildi',
  MANAGER_APPROVED: 'Yönetici tarafından onaylandı',
  MANAGER_REJECTED: 'Yönetici tarafından reddedildi',
  ACCOUNTING_APPROVED: 'Muhasebe tarafından onaylandı',
  ACCOUNTING_REJECTED: 'Muhasebe tarafından reddedildi',
};

/** Success messages shown after a redirect, keyed by the `notice` search param. */
export const NOTICE_MESSAGES = {
  created: 'Masraf taslak olarak kaydedildi.',
  updated: 'Taslak güncellendi.',
  submitted: 'Masraf onaya gönderildi.',
  approved: 'Masraf onaylandı.',
  rejected: 'Masraf reddedildi.',
} as const;

export type NoticeKey = keyof typeof NOTICE_MESSAGES;
