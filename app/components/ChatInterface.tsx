'use client'
// app/components/ChatInterface.tsx
// WhatsApp-style AI chat UI — mobile-first, multilingual

import { useState, useRef, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'
import { detectLanguage, i18n, type Lang } from '@/lib/language'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_ACTIONS = [
  { label: '🛡️ Life Insurance', labelSi: '🛡️ ජීවිත රක්ෂණය', labelTa: '🛡️ ஆயுள் காப்பீடு' },
  { label: '🏥 Health Insurance', labelSi: '🏥 සෞඛ්‍ය රක්ෂණය', labelTa: '🏥 சுகாதார காப்பீடு' },
  { label: '🚗 Vehicle Insurance', labelSi: '🚗 වාහන රක්ෂණය', labelTa: '🚗 வாகன காப்பீடு' },
  { label: '📊 Compare Plans', labelSi: '📊 සැලසුම් සංසන්දනය', labelTa: '📊 திட்டங்கள் ஒப்பீடு' },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('chat_session') || (() => {
        const id = uuidv4()
        sessionStorage.setItem('chat_session', id)
        return id
      })()
    }
    return uuidv4()
  })
  const [lang, setLang] = useState<Lang>('en')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const t = i18n[lang]

  // Add welcome message on mount
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: t.welcome,
      timestamp: new Date(),
    }])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const detectedLang = detectLanguage(text)
    setLang(detectedLang)

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Build history for context (exclude welcome message)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          history,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to get response')

      const aiMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMsg])
      if (data.language) setLang(data.language as Lang)
    } catch (err) {
      const errMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again in a moment.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errMsg])
      console.error(err)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, sessionId, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <div className="w-full max-w-md sm:max-w-lg h-screen sm:h-[90vh] sm:max-h-[800px] flex flex-col bg-white sm:rounded-2xl sm:shadow-2xl overflow-hidden">

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 text-white"
        style={{ background: 'var(--brand-gradient)' }}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-2xl select-none">
            🧕
          </div>
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base leading-tight">Aisha</h1>
          <p className="text-xs text-green-200">AI Insurance Advisor • Online</p>
        </div>

        {/* Lang badge */}
        <div className="flex gap-1">
          {(['en', 'si', 'ta'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                lang === l
                  ? 'bg-white text-brand-700 font-semibold'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              {l === 'en' ? 'EN' : l === 'si' ? 'සිං' : 'தமி'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat wallpaper background ── */}
      <div
        className="flex-1 overflow-y-auto chat-scroll px-3 py-4 space-y-2"
        style={{
          background: 'var(--chat-bg)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23328f66' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Date separator */}
        <div className="flex items-center justify-center">
          <span className="bg-white/70 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">
            Today
          </span>
        </div>

        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} formatTime={formatTime} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm shrink-0">
              🧕
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="typing-dot w-2 h-2 bg-brand-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-brand-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-brand-400 rounded-full" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Actions ── */}
      {messages.length <= 1 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 overflow-x-auto">
          <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => sendMessage(
                  lang === 'si' ? action.labelSi : lang === 'ta' ? action.labelTa : action.label
                )}
                className="whitespace-nowrap text-xs bg-white border border-brand-200 text-brand-700 px-3 py-1.5 rounded-full hover:bg-brand-50 active:bg-brand-100 transition-colors shadow-sm"
              >
                {lang === 'si' ? action.labelSi : lang === 'ta' ? action.labelTa : action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-100 text-center">
        <p className="text-xs text-amber-700">{t.disclaimer}</p>
      </div>

      {/* ── Input Area ── */}
      <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all max-h-32 overflow-y-auto"
          style={{
            fontFamily: lang === 'si' ? "'Noto Sans Sinhala', sans-serif"
                       : lang === 'ta' ? "'Noto Sans Tamil', sans-serif"
                       : 'inherit',
          }}
          disabled={isLoading}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = Math.min(target.scrollHeight, 128) + 'px'
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{
            background: input.trim() && !isLoading ? 'var(--brand-gradient)' : '#e5e7eb',
          }}
          aria-label="Send"
        >
          <svg className="w-5 h-5 text-white rotate-45" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ message, formatTime }: {
  message: Message
  formatTime: (d: Date) => string
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-end gap-2 message-animate ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (AI only) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm shrink-0 mb-0.5">
          🧕
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-700 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2"
              components={{
                p: ({ children }) => <p className="my-1">{children}</p>,
                ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-brand-800">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {formatTime(message.timestamp)}
          {isUser && <span className="ml-1 tick">✓✓</span>}
        </span>
      </div>
    </div>
  )
}
