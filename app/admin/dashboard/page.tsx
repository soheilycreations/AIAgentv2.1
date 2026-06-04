'use client'
// app/admin/dashboard/page.tsx — Stats overview

import { useEffect, useState } from 'react'

interface Stats {
  totalLeads: number
  pendingLeads: number
  totalQuotations: number
  totalCompanies: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token') || ''
    // Fetch leads count
    Promise.all([
      fetch('/api/quote/request', { headers: { 'x-admin-token': token } }).then(r => r.json()),
      fetch('/api/quote/upload', { headers: { 'x-admin-token': token } }).then(r => r.json()),
      fetch('/api/companies').then(r => r.json()),
    ]).then(([leads, quotations, companies]) => {
      setStats({
        totalLeads: Array.isArray(leads) ? leads.length : 0,
        pendingLeads: Array.isArray(leads) ? leads.filter((l: { status: string }) => l.status === 'pending').length : 0,
        totalQuotations: Array.isArray(quotations) ? quotations.length : 0,
        totalCompanies: Array.isArray(companies) ? companies.length : 0,
      })
    }).catch(console.error)
  }, [])

  const CARDS = [
    { label: 'Total Leads', value: stats?.totalLeads ?? '—', icon: '👥', color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { label: 'Pending Leads', value: stats?.pendingLeads ?? '—', icon: '⏳', color: 'bg-amber-50 border-amber-100 text-amber-700' },
    { label: 'Quotations', value: stats?.totalQuotations ?? '—', icon: '📄', color: 'bg-green-50 border-green-100 text-green-700' },
    { label: 'Companies', value: stats?.totalCompanies ?? '—', icon: '🏢', color: 'bg-purple-50 border-purple-100 text-purple-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your insurance advisor overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(card => (
          <div key={card.label} className={`border rounded-2xl p-5 ${card.color}`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm font-medium opacity-80 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/quotations', label: '📤 Upload Quotation PDF', desc: 'Add new plan documents' },
            { href: '/admin/companies', label: '🏢 Manage Companies', desc: 'Add or remove insurers' },
            { href: '/admin/settings', label: '🔑 AI Settings', desc: 'Set API key & system prompt' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col gap-1 p-4 border border-gray-100 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all group"
            >
              <span className="font-medium text-sm text-gray-700 group-hover:text-brand-700">{item.label}</span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
