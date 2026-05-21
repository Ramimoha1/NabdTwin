#!/usr/bin/env node
// Truncate Strapi (PostgreSQL) content tables safely, reset identities, and cascade.
// Usage:
//  - Interactive confirm: node truncate-db.js
//  - Non-interactive:     node truncate-db.js --yes

const path = require('path');
const readline = require('readline');
const { Pool } = require('pg');

// Load repo-root .env to ensure consistent environment values
try {
  // Load repository root .env to stay consistent with frontend
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
} catch (e) {
  // .env optional; rely on environment
}

const cfg = {
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  ssl: /true/i.test(String(process.env.DATABASE_SSL || 'false'))
    ? { rejectUnauthorized: false }
    : false,
};

async function main() {
  if (!cfg.database || !cfg.user) {
    console.error('Missing DATABASE_NAME or DATABASE_USERNAME in environment.');
    process.exit(1);
  }

  const pool = new Pool(cfg);
  const client = await pool.connect();
  try {
    // Get list of public tables
    const { rows } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
    );

    const allTables = rows.map(r => r.tablename);

    // Exclude Strapi admin/system tables to preserve admin users and internal state
    const excludePatterns = [
      /^admin_/,
      /^up_/,
      /^strapi_/,
      /core_store/,
      /webhooks/,
      /api_tokens/,
      /migrations/,
      /database_schema/,
    ];

    const tablesToTruncate = allTables.filter(t => !excludePatterns.some(rx => rx.test(t)));

    if (tablesToTruncate.length === 0) {
      console.log('No content tables found to truncate.');
      return;
    }

    const confirmArg = process.argv.includes('--yes');
    const runTruncate = async () => {
      const truncateSql = `TRUNCATE TABLE ${tablesToTruncate.map(t => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`;
      console.log(`\nExecuting:\n${truncateSql}\n`);
      await client.query('BEGIN');
      await client.query(truncateSql);
      await client.query('COMMIT');
      console.log('✅ Truncate complete: identities reset and cascaded.');
    };

    console.log('The following tables will be truncated (data removed, IDs reset):');
    tablesToTruncate.forEach(t => console.log(` - ${t}`));

    if (confirmArg) {
      await runTruncate();
    } else {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question('\nType RESET to confirm truncation: ', async (answer) => {
        rl.close();
        if (answer.trim().toUpperCase() === 'RESET') {
          try {
            await runTruncate();
          } catch (err) {
            console.error('❌ Error during truncate:', err);
            process.exitCode = 1;
          } finally {
            await client.release();
            await pool.end();
          }
        } else {
          console.log('Aborted. No changes made.');
          await client.release();
          await pool.end();
        }
      });
      return; // prevent dropping to finally before async question resolves
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exitCode = 1;
  } finally {
    await client.release();
    await pool.end();
  }
}

main();
