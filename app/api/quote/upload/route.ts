// app/api/quote/upload/route.ts
// Upload quotation PDFs — extracts text for AI to read and answer questions about

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET_KEY
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file       = formData.get('pdf') as File | null
    const companyId  = formData.get('companyId') as string
    const planName   = formData.get('planName') as string
    const premium    = formData.get('premium') as string
    const coverage   = formData.get('coverage') as string
    const description = formData.get('description') as string

    if (!file || !companyId || !planName) {
      return NextResponse.json(
        { error: 'pdf, companyId, and planName are required' },
        { status: 400 }
      )
    }

    // Save file to /public/uploads/
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const pdfUrl = `/uploads/${filename}`

    // Extract text from PDF for AI context
    let pdfText = ''
    try {
      // Dynamic import — pdf-parse is CJS
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(buffer)
      // Limit to 3000 chars to avoid overloading the AI context
      pdfText = parsed.text.slice(0, 3000).trim()
    } catch (e) {
      console.warn('PDF text extraction failed (non-blocking):', e)
    }

    // Save quotation record
    const quotation = await prisma.quotation.create({
      data: {
        companyId,
        planName,
        pdfUrl,
        pdfText: pdfText || null,
        premium: premium ? parseFloat(premium) : null,
        coverage: coverage ? parseFloat(coverage) : null,
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, quotation })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// GET — list all quotations
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quotations = await prisma.quotation.findMany({
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(quotations)
}
