export const DEMO_PASSWORD = 'Demo123!';

/** The four demo users plus a second team that only exists in the test database. */
export const TEST_USERNAMES = [
  'ali',
  'veli',
  'ahmet',
  'ayse',
  'zeynep',
  'can',
] as const;

export type TestUsername = (typeof TEST_USERNAMES)[number];
export type EmployeeUsername = 'ali' | 'veli' | 'can';

export const MANAGER_OF: Record<EmployeeUsername, TestUsername> = {
  ali: 'ahmet',
  veli: 'ahmet',
  can: 'zeynep',
};
