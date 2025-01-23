import pg from 'pg'
import type { User, Package, Rental } from '@/types/db'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

interface CreateRentalParams {
  userId: string
  packageId: string
  totalAmount: number
  status: string
}

export async function createRental({ userId, packageId, totalAmount, status }: CreateRentalParams): Promise<Rental> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO rentals (id, user_id, package_id, total_amount, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [`rent_${Date.now()}`, userId, packageId, totalAmount, status]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function getRentalsByUserId(userId: string): Promise<Rental[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `SELECT r.*, p.name as package_name, p.price as package_price
       FROM rentals r
       JOIN packages p ON r.package_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    )
    return result.rows
  } finally {
    client.release()
  }
}

export async function getPackageById(packageId: string): Promise<Package | null> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM packages WHERE id = $1',
      [packageId]
    )
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    )
    return result.rows[0] || null
  } finally {
    client.release()
  }
} 