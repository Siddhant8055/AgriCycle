const { Pool } = require('pg');
const { config } = require('./environment');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client:', err);
});

const query = (text, params) => pool.query(text, params);

const checkDatabaseHealth = async () => {
  try {
    const result = await pool.query('SELECT 1 as healthy;');
    return result.rows.length > 0;
  } catch (err) {
    return false;
  }
};

module.exports = { pool, query, checkDatabaseHealth };
