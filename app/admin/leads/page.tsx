'use client'
// app/admin/leads/page.tsx — View and manage customer quote requests

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Lead {
  id: string
  sessionId: string
  age: number | null
  incomeRange: string | null
  dependents: number | null
  budget: string | null
  coverageType: string | null
  notes: string | null
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  quoted:   'bg-green-100 text-green-700',
  closed:   'bg-gray-100 text-gray-500',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = async () => {
    const token = localStorage.getItem('admin_token') || ''
    const res = await fetch('/api/quote/request', { headers: { 'x-admin-token': token } })
    const data = await res.json()
    setLeads(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  if (loading) return <div className="text-gray-400 py-12 text-center">Loading leads...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Customer Leads</h1>
        <span className="text-sm text-gray-500">{leads.length} total</span>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p>No leads yet. Share your chat link to start getting enquiries.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Coverage', 'Age', 'Budget', 'Dependents', 'Notes', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {format(new Date(lead.createdAt), 'dd MMM yy')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 capitalize">
                      {lead.coverageType || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.age || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.budget || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.dependents ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {lead.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] || ''}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
