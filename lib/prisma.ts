import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

// Log all queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, async (e: { query: string; params: string[]; duration: number }) => {
    console.log('Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`
    })
  })
}

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

// Ensure the connection is alive
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error)
}) 