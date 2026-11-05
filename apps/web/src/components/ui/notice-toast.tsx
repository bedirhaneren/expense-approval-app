import { randomUUID } from 'node:crypto';
import { NOTICE_MESSAGES, type NoticeKey } from '@/lib/labels';
import { Toast } from './toast';

const isNoticeKey = (value: unknown): value is NoticeKey =>
  typeof value === 'string' && value in NOTICE_MESSAGES;

/**
 * Renders the success toast for a `?notice=` search param, ignoring unknown
 * values. A fresh key per request remounts the toast, so the same notice
 * twice in a row (e.g. two approvals) is shown both times.
 */
export function NoticeToast({ notice }: { notice: unknown }) {
  if (!isNoticeKey(notice)) return null;
  return <Toast key={randomUUID()} message={NOTICE_MESSAGES[notice]} />;
}
