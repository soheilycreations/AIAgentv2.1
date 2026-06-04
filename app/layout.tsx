// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AI Insurance Advisor | Sri Lanka',
  description: 'Get personalized insurance advice in Sinhala, English, or Tamil. Chat with our AI advisor 24/7.',
  keywords: 'insurance Sri Lanka, life insurance, health insurance, රක්ෂණ, காப்பீடு',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Noto Sans for Sinhala and Tamil script support */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
