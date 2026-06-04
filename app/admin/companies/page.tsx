'use client'
// app/admin/companies/page.tsx — Manage insurance companies

import { useEffect, useState } from 'react'

interface Company {
  id: string
  name: string
  website: string | null
  _count: { quotations: number }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies')
    const data = await res.json()
    setCompanies(Array.isArray(data) ? data : [])
  }

  useEffect(() => { fetchCompanies() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ name: name.trim(), website: website.trim() || null }),
      })
      if (!res.ok) throw new Error('Failed to add company')
      setName('')
      setWebsite('')
      fetchCompanies()
    } catch {
      setError('Failed to add company.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this company? This will also remove all its quotations.')) return
    await fetch('/api/companies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ id }),
    })
    fetchCompanies()
  }

  const SRI_LANKA_INSURERS = [
    'AIA Sri Lanka', 'Ceylinco Life', 'Union Assurance', 'Sri Lanka Insurance',
    'Softlogic Life', 'Allianz Lanka', 'HNB Assurance', 'Janashakthi Insurance'
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Insurance Companies</h1>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Add Company</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {SRI_LANKA_INSURERS.map(insurer => (
              <button
                key={insurer}
                type="button"
                onClick={() => setName(insurer)}
                className="text-xs px-3 py-1.5 border border-brand-200 text-brand-700 rounded-full hover:bg-brand-50 transition-colors"
              >
                + {insurer}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Company name"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              required
            />
            <input
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="Website (optional)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--brand-gradient)' }}
            >
              {loading ? '...' : 'Add'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>

      {/* Company list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {companies.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No companies yet. Add one above.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {companies.map(company => (
              <li key={company.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-sm">
                  {company.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{company.name}</p>
                  <p className="text-xs text-gray-400">
                    {company._count.quotations} quotation{company._count.quotations !== 1 ? 's' : ''}
                    {company.website && ` • ${company.website}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="text-red-400 hover:text-red-600 text-sm p-2"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
