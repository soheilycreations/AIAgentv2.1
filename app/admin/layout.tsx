'use client'
// app/admin/layout.tsx — Shared admin layout with sidebar nav

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/leads', icon: '👥', label: 'Leads' },
  { href: '/admin/companies', icon: '🏢', label: 'Companies' },
  { href: '/admin/quotations', icon: '📄', label: 'Quotations' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Redirect to login if no token (except on login page)
  useEffect(() => {
    if (pathname === '/admin') return
    const token = localStorage.getItem('admin_token')
    if (!token) router.push('/admin')
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  if (pathname === '/admin') return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-brand-950 text-white flex flex-col transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-brand-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧕</span>
            <div>
              <p className="font-bold text-sm">Faceless AI</p>
              <p className="text-xs text-brand-400">Insurance Agent</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                pathname === item.href
                  ? 'bg-brand-600 text-white font-medium'
                  : 'text-brand-200 hover:bg-brand-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-brand-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-brand-800 mb-1"
          >
            <span>🔗</span> View Chat Page
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-brand-800"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            ☰
          </button>
          <h2 className="font-semibold text-gray-700 capitalize">
            {NAV_ITEMS.find(n => n.href === pathname)?.label || 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-gray-500">Agent Active</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
