// app/api/admin/login/route.ts
// Simple admin login — returns a session token

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Return the admin token — client stores it in localStorage
  return NextResponse.json({
    token: process.env.ADMIN_SECRET_KEY,
    success: true,
  })
}
