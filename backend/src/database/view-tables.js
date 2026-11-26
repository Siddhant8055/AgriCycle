const { pool } = require('../config/database');

async function viewAllTables() {
  console.log('📊 Connecting to PostgreSQL to Inspect Tables...\n');

  try {
    console.log('📌 1. ALL DATABASE TABLES:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.table(tables.rows);

    console.log('\n📌 2. SYSTEM COST PARAMETERS (system_cost_parameters):');
    const params = await pool.query(`
      SELECT key, value_number, unit, is_illustrative_test_assumption 
      FROM system_cost_parameters;
    `);
    console.table(params.rows);

    console.log('\n📌 3. SEEDED DEMO USERS (users):');
    const users = await pool.query(`
      SELECT id, name, role, email, phone, is_active 
      FROM users;
    `);
    console.table(users.rows);

    console.log('\n📌 4. RESIDUE LISTINGS (residue_listings):');
    const listings = await pool.query(`
      SELECT crop_type, quantity_tons, moisture_pct, condition, storage_type, status 
      FROM residue_listings;
    `);
    console.table(listings.rows);

    console.log('\n📌 5. BUYER REQUIREMENTS (buyer_requirements):');
    const buyers = await pool.query(`
      SELECT crop_type, pathway, min_quantity_tons, offered_price_per_ton, service_radius_km 
      FROM buyer_requirements;
    `);
    console.table(buyers.rows);

    console.log('\n📌 6. PATHWAY ELIGIBILITY RULES (pathway_rules):');
    const rules = await pool.query(`
      SELECT crop_type, pathway_name, is_eligible, max_moisture_allowed, conversion_yield 
      FROM pathway_rules;
    `);
    console.table(rules.rows);

  } catch (err) {
    console.error('Error viewing tables:', err.message || err);
  } finally {
    await pool.end();
  }
}

viewAllTables();
