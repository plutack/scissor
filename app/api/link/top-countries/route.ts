import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const topCountries = await db.visit.groupBy({
    by: ['country'],
    where: {
      link: {
        userId: userId
      }
    },
    _sum: {
      count: true
    },
    orderBy: {
      _sum: {
        count: 'desc'
      }
    },
    take: 5
  })

  const formattedData = topCountries.map(country => ({
    country: country.country,
    clicks: country._sum.count || 0
  }))

  return NextResponse.json(formattedData)
}