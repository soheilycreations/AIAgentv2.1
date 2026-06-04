// app/api/quote/request/route.ts
// Save or update a customer's quotation request

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST — create or update a quote request
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { sessionId, age, incomeRange, dependents, budget, coverageType, notes } = body

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const request = await prisma.quotationRequest.upsert({
    where: { id: sessionId },
    create: {
      id: sessionId,
      sessionId,
      age: age ? Number(age) : null,
      incomeRange,
      dependents: dependents ? Number(dependents) : null,
      budget,
      coverageType,
      notes,
      status: 'pending',
    },
    update: {
      age: age ? Number(age) : undefined,
      incomeRange,
      dependents: dependents ? Number(dependents) : undefined,
      budget,
      coverageType,
      notes,
    },
  })

  return NextResponse.json({ success: true, requestId: request.id })
}

// GET — list all quote requests (admin only — basic check)
export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (token !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requests = await prisma.quotationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(requests)
}
