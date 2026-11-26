const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

class DatabaseMigrator {
  constructor() {
    this.migrationsDir = path.resolve(__dirname, '../../migrations');
  }

  async initTrackingTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async getAppliedMigrations() {
    await this.initTrackingTable();
    const result = await pool.query(
      'SELECT version FROM schema_migrations ORDER BY id ASC;'
    );
    return result.rows.map((row) => row.version);
  }

  getAvailableMigrations() {
    if (!fs.existsSync(this.migrationsDir)) {
      throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
    }
    return fs
      .readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }

  async migrate() {
    console.log('🔄 Checking database migration status...');
    const applied = await this.getAppliedMigrations();
    const available = this.getAvailableMigrations();

    const pending = available.filter((file) => !applied.includes(file));

    if (pending.length === 0) {
      console.log('✅ Database is already up to date. No pending migrations.');
      return;
    }

    console.log(`🚀 Found ${pending.length} pending migration(s):`);
    for (const file of pending) {
      console.log(`   - ${file}`);
    }

    const client = await pool.connect();
    try {
      for (const file of pending) {
        const filePath = path.join(this.migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        console.log(`⏳ Applying migration: ${file}...`);
        const startTime = Date.now();

        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version, applied_at) VALUES ($1, CURRENT_TIMESTAMP);',
          [file]
        );
        await client.query('COMMIT');

        console.log(`✅ Applied ${file} successfully (${Date.now() - startTime}ms)`);
      }

      console.log('🎉 All migrations applied successfully!');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Migration failed! Transaction rolled back.');
      console.error(err.message || err);
      throw err;
    } finally {
      client.release();
    }
  }

  async status() {
    const applied = await this.getAppliedMigrations();
    const available = this.getAvailableMigrations();

    console.log('\n📋 AgriCycle Versioned Migration Status:');
    console.log('================================================================');
    for (const file of available) {
      const isApplied = applied.includes(file);
      const mark = isApplied ? '✅ [APPLIED]' : '⏳ [PENDING]';
      console.log(`${mark.padEnd(14)} ${file}`);
    }
    console.log('================================================================\n');
  }
}

if (require.main === module) {
  const migrator = new DatabaseMigrator();
  const command = process.argv[2] || 'migrate';

  (async () => {
    try {
      if (command === 'status') {
        await migrator.status();
      } else if (command === 'migrate') {
        await migrator.migrate();
      } else {
        console.log(`Unknown command: ${command}. Use 'migrate' or 'status'.`);
      }
    } catch (error) {
      process.exit(1);
    } finally {
      await pool.end();
    }
  })();
}

module.exports = { DatabaseMigrator };
