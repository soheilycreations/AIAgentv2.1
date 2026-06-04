'use client'
// app/admin/quotations/page.tsx — Upload and manage PDF quotations

import { useEffect, useState, useRef } from 'react'

interface Company { id: string; name: string }
interface Quotation {
  id: string
  planName: string
  pdfUrl: string | null
  premium: number | null
  coverage: number | null
  description: string | null
  company: Company
  createdAt: string
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState({
    companyId: '', planName: '', premium: '', coverage: '', description: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''

  const fetchData = async () => {
    const [qRes, cRes] = await Promise.all([
      fetch('/api/quote/upload', { headers: { 'x-admin-token': token } }),
      fetch('/api/companies'),
    ])
    setQuotations(await qRes.json())
    setCompanies(await cRes.json())
  }

  useEffect(() => { fetchData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !form.companyId || !form.planName) {
      setError('Please select a PDF and fill in company and plan name.')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    const fd = new FormData()
    fd.append('pdf', file)
    fd.append('companyId', form.companyId)
    fd.append('planName', form.planName)
    if (form.premium)     fd.append('premium', form.premium)
    if (form.coverage)    fd.append('coverage', form.coverage)
    if (form.description) fd.append('description', form.description)

    try {
      const res = await fetch('/api/quote/upload', {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      setSuccess('✅ Quotation uploaded! AI can now answer questions about this plan.')
      setForm({ companyId: '', planName: '', premium: '', coverage: '', description: '' })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      fetchData()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Quotation PDFs</h1>

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-5">Upload New Quotation</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Insurance Company *</label>
              <select
                value={form.companyId}
                onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
                required
              >
                <option value="">Select company...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Plan name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Plan Name *</label>
              <input
                value={form.planName}
                onChange={e => setForm(f => ({ ...f, planName: e.target.value }))}
                placeholder="e.g. AIA Family Protect Gold"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
                required
              />
            </div>

            {/* Premium */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Premium (LKR)</label>
              <input
                type="number"
                value={form.premium}
                onChange={e => setForm(f => ({ ...f, premium: e.target.value }))}
                placeholder="e.g. 3500"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>

            {/* Coverage */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sum Assured (LKR)</label>
              <input
                type="number"
                value={form.coverage}
                onChange={e => setForm(f => ({ ...f, coverage: e.target.value }))}
                placeholder="e.g. 5000000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Key Benefits (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Briefly describe the plan's main benefits..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none"
            />
          </div>

          {/* PDF file */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PDF Quotation File *</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <p className="text-brand-700 font-medium text-sm">📄 {file.name}</p>
              ) : (
                <>
                  <p className="text-gray-400 text-sm">Click to select PDF</p>
                  <p className="text-gray-300 text-xs mt-1">AI will read the PDF to answer customer questions</p>
                </>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: 'var(--brand-gradient)' }}
          >
            {uploading ? '⏳ Uploading & Extracting...' : '📤 Upload Quotation'}
          </button>
        </form>
      </div>

      {/* Quotation list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-700">{quotations.length} Quotations Uploaded</h2>
        </div>
        {quotations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No quotations yet.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {quotations.map(q => (
              <li key={q.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="text-2xl">📄</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{q.planName}</p>
                  <p className="text-xs text-gray-400">{q.company.name}</p>
                  {(q.premium || q.coverage) && (
                    <p className="text-xs text-brand-600 mt-0.5">
                      {q.premium ? `LKR ${q.premium.toLocaleString()}/mo` : ''}
                      {q.premium && q.coverage ? ' · ' : ''}
                      {q.coverage ? `Cover: LKR ${q.coverage.toLocaleString()}` : ''}
                    </p>
                  )}
                </div>
                {q.pdfUrl && (
                  <a
                    href={q.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-800 text-sm font-medium"
                  >
                    View PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
