import { config } from 'dotenv';

// E2E tests always run against the separate test database.
config({ path: '.env.test', override: true, quiet: true });
