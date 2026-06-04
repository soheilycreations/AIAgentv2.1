// app/api/companies/route.ts
// Manage insurance companies in the admin panel

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET_KEY
}

// GET — list all companies
export async function GET() {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { quotations: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(companies)
}

// POST — create new company (admin)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, logo, website } = await req.json()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const company = await prisma.company.create({ data: { name, logo, website } })
  return NextResponse.json(company, { status: 201 })
}

// DELETE — remove company (admin)
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()
  await prisma.company.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
