// app/api/chat/route.ts
// Main AI chat endpoint — handles customer messages and returns AI responses

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { chatWithAI } from '@/lib/openrouter'
import { detectLanguage } from '@/lib/language'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionId, history = [] } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Detect language from the customer's message
    const lang = detectLanguage(message)

    // Save the customer message to DB
    await prisma.chatMessage.create({
      data: {
        sessionId,
        message,
        role: 'user',
        language: lang,
      },
    })

    // Load recent quotations to give AI context about available plans
    const quotations = await prisma.quotation.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Build quotation context string for the AI
    let quotationContext = ''
    if (quotations.length > 0) {
      quotationContext = quotations
        .map(q => {
          const parts = [`Company: ${q.company.name}`, `Plan: ${q.planName}`]
          if (q.premium) parts.push(`Premium: LKR ${q.premium.toLocaleString()}/month`)
          if (q.coverage) parts.push(`Coverage: LKR ${q.coverage.toLocaleString()}`)
          if (q.description) parts.push(`Details: ${q.description}`)
          if (q.pdfText) parts.push(`PDF Content (excerpt): ${q.pdfText.slice(0, 500)}`)
          return parts.join(' | ')
        })
        .join('\n')
    }

    // Build message history for context (last 10 exchanges)
    const conversationHistory = history.slice(-20).map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Add the current message
    conversationHistory.push({ role: 'user' as const, content: message })

    // Get AI response
    const aiResponse = await chatWithAI(conversationHistory, quotationContext || undefined)

    // Save AI response to DB
    await prisma.chatMessage.create({
      data: {
        sessionId,
        message: aiResponse,
        role: 'assistant',
        language: lang,
      },
    })

    // Check if this looks like a quote request — simple keyword detection
    const quoteKeywords = /quote|quotation|price|premium|how much|cost|budget|රක්ෂණ|මිල|கட்டணம்/i
    if (quoteKeywords.test(message) && message.length > 10) {
      // Create a pending quote request record for the agent to follow up
      await prisma.quotationRequest.upsert({
        where: { id: sessionId },
        create: {
          id: sessionId,
          sessionId,
          status: 'pending',
          notes: `Chat session started. Customer said: "${message.slice(0, 200)}"`,
        },
        update: {
          notes: `Latest: "${message.slice(0, 200)}"`,
        },
      })
    }

    return NextResponse.json({
      reply: aiResponse,
      language: lang,
    })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'AI service error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
