// app/page.tsx
// Customer-facing chat page — the "storefront" of the insurance advisor

import ChatInterface from './components/ChatInterface'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-0 sm:p-4">
      <ChatInterface />
    </main>
  )
}
