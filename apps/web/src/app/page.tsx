import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/dal';
import { HOME_PATH_BY_ROLE } from '@/lib/routes';

/** Sends each user to their role's home page. */
export default async function HomePage() {
  const user = await requireUser();
  redirect(HOME_PATH_BY_ROLE[user.role]);
}
