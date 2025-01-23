const { Pool } = require('pg')
require('dotenv').config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function setup() {
  const client = await pool.connect()
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT
      );
    `)

    // Create packages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL NOT NULL
      );
    `)

    // Create rentals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rentals (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        package_id TEXT REFERENCES packages(id),
        total_amount DECIMAL NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Insert some sample data
    await client.query(`
      INSERT INTO packages (id, name, price)
      VALUES 
        ('pkg_basic', 'Basic Package', 99.99),
        ('pkg_pro', 'Pro Package', 199.99)
      ON CONFLICT (id) DO NOTHING;
    `)

    console.log('Database setup completed')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

setup().catch(console.error) 