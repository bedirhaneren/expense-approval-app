import { execSync } from 'node:child_process';
import './setup-env.js';

/** Brings the test database schema up to date and loads the demo users once per run. */
export default function setup(): void {
  const run = (command: string) =>
    execSync(command, { stdio: 'pipe', env: process.env });

  run('npx prisma migrate deploy');
  run('npx prisma db seed');
}
