'use client'
// app/admin/settings/page.tsx — Configure OpenRouter key and AI behavior

import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    apiKey: '',
    systemPrompt: '',
    agentName: 'Aisha',
    agentAvatar: '🧕',
    welcomeMessage: '',
    whatsappNumber: '',
    hasApiKey: false,
    apiKeyPreview: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''

  useEffect(() => {
    fetch('/api/settings', { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(data => {
        setSettings(prev => ({
          ...prev,
          systemPrompt: data.systemPrompt || '',
          agentName: data.agentName || 'Aisha',
          agentAvatar: data.agentAvatar || '🧕',
          welcomeMessage: data.welcomeMessage || '',
          whatsappNumber: data.whatsappNumber || '',
          hasApiKey: data.hasApiKey,
          apiKeyPreview: data.apiKeyPreview || '',
        }))
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const body: Record<string, string> = {
      systemPrompt: settings.systemPrompt,
      agentName: settings.agentName,
      agentAvatar: settings.agentAvatar,
      welcomeMessage: settings.welcomeMessage,
      whatsappNumber: settings.whatsappNumber,
    }
    if (settings.apiKey) body.openRouterApiKey = settings.apiKey

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(body),
      })
      setMessage('✅ Settings saved successfully!')
      setSettings(prev => ({ ...prev, apiKey: '', hasApiKey: true }))
    } catch {
      setMessage('❌ Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">AI Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">

        {/* API Key */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">🔑 OpenRouter API Key</h2>
          <p className="text-sm text-gray-500">
            Get your free API key at{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer"
               className="text-brand-600 hover:underline">openrouter.ai</a>.
            The key is stored securely in the database.
          </p>
          {settings.hasApiKey && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <span>✅</span>
              <span>API key set ({settings.apiKeyPreview})</span>
            </div>
          )}
          <input
            type="password"
            value={settings.apiKey}
            onChange={e => setSettings(s => ({ ...s, apiKey: e.target.value }))}
            placeholder={settings.hasApiKey ? 'Enter new key to replace...' : 'sk-or-...'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* Agent persona */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">🧕 Agent Persona</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Agent Name</label>
              <input
                value={settings.agentName}
                onChange={e => setSettings(s => ({ ...s, agentName: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
                placeholder="Aisha"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Avatar Emoji</label>
              <input
                value={settings.agentAvatar}
                onChange={e => setSettings(s => ({ ...s, agentAvatar: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-2xl text-center focus:outline-none focus:border-brand-400"
                placeholder="🧕"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp Number (for escalation)</label>
            <input
              value={settings.whatsappNumber}
              onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              placeholder="+94771234567"
            />
          </div>
        </div>

        {/* System prompt */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">🤖 AI System Prompt</h2>
          <p className="text-sm text-gray-500">
            Controls how the AI behaves. Edit carefully — the AI will follow these instructions for every conversation.
          </p>
          <textarea
            value={settings.systemPrompt}
            onChange={e => setSettings(s => ({ ...s, systemPrompt: e.target.value }))}
            rows={12}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-y"
            placeholder="Enter system prompt..."
          />
          <p className="text-xs text-gray-400">
            💡 Tip: Always include safety rules and the ⚠️ disclaimer instruction for recommendations.
          </p>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
          style={{ background: 'var(--brand-gradient)' }}
        >
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </form>
    </div>
  )
}
