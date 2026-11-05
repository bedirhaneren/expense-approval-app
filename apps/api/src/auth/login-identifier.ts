/** Usernames and emails are matched case-insensitively and without surrounding spaces. */
export function normalizeLoginIdentifier(login: unknown): string {
  return typeof login === 'string' ? login.trim().toLowerCase() : '';
}
