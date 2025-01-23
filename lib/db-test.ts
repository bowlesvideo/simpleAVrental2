import { prisma } from './prisma'

export async function testConnection() {
  try {
    // Try to execute a simple query
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
} 