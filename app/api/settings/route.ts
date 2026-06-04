// app/api/settings/route.ts
// Admin settings — save/retrieve OpenRouter API key and AI behavior config

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/openrouter'

// Simple admin check using header token
function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET_KEY
}

// GET — load current settings (mask the API key for security)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

  return NextResponse.json({
    hasApiKey: !!settings?.openRouterApiKey,
    apiKeyPreview: settings?.openRouterApiKey
      ? `...${settings.openRouterApiKey.slice(-8)}`
      : null,
    systemPrompt: settings?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    agentName: settings?.agentName || 'Aisha',
    agentAvatar: settings?.agentAvatar || '🧕',
    welcomeMessage: settings?.welcomeMessage || null,
    whatsappNumber: settings?.whatsappNumber || null,
  })
}

// POST — update settings
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { openRouterApiKey, systemPrompt, agentName, agentAvatar, welcomeMessage, whatsappNumber } = body

  const data: Record<string, string> = {}
  if (openRouterApiKey) data.openRouterApiKey = openRouterApiKey
  if (systemPrompt)     data.systemPrompt = systemPrompt
  if (agentName)        data.agentName = agentName
  if (agentAvatar)      data.agentAvatar = agentAvatar
  if (welcomeMessage)   data.welcomeMessage = welcomeMessage
  if (whatsappNumber)   data.whatsappNumber = whatsappNumber

  const settings = await prisma.settings.upsert({
    where:  { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  })

  return NextResponse.json({ success: true, agentName: settings.agentName })
}
