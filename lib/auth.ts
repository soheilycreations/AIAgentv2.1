// lib/auth.ts
// Simple admin authentication using a secret token stored in cookies
// For production, replace with NextAuth.js or Clerk

import { cookies } from 'next/headers'

const ADMIN_TOKEN_COOKIE = 'admin_token'

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)
  return token?.value === process.env.ADMIN_SECRET_KEY
}

export function getAdminToken(): string {
  return process.env.ADMIN_SECRET_KEY || 'dev_secret'
}
