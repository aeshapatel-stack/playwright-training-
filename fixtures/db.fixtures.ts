import { test as base } from '@playwright/test';
import { Pool, PoolClient } from 'pg';


type DBFixture = {
  db: PoolClient;
};

const pool = new Pool({
  connectionString: 'postgres://evaldb:evaldb@localhost:5432/evaldb',
});

export const test = base.extend<DBFixture>({
  db: async ({}, use) => {
    const client = await pool.connect();

    try {
      // Optional: start transaction for test isolation
      await client.query('BEGIN');

      await use(client);

      // Rollback after test so DB stays clean
      await client.query('ROLLBACK');
    } catch (err) {
      // Ensure rollback even on failure
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
});

export { expect } from '@playwright/test';