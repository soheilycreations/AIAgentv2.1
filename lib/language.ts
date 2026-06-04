// lib/language.ts
// Detect language from message text using Unicode character ranges

export type Lang = 'si' | 'ta' | 'en'

/**
 * Detect Sinhala, Tamil, or English from a text string.
 * Uses Unicode block ranges:
 *  - Sinhala: U+0D80–U+0DFF
 *  - Tamil:   U+0B80–U+0BFF
 */
export function detectLanguage(text: string): Lang {
  const sinhalaRange = /[\u0D80-\u0DFF]/
  const tamilRange   = /[\u0B80-\u0BFF]/

  const sinhalaCount = (text.match(new RegExp(sinhalaRange.source, 'g')) || []).length
  const tamilCount   = (text.match(new RegExp(tamilRange.source, 'g')) || []).length

  if (sinhalaCount > tamilCount && sinhalaCount > 2) return 'si'
  if (tamilCount > sinhalaCount && tamilCount > 2) return 'ta'
  return 'en'
}

/**
 * Map language code to display name
 */
export function langLabel(lang: Lang): string {
  return { si: 'සිංහල', ta: 'தமிழ்', en: 'English' }[lang]
}

/**
 * Returns language-specific UI strings
 */
export const i18n = {
  en: {
    placeholder: 'Ask me about insurance...',
    thinking: 'Aisha is thinking...',
    disclaimer: '⚠️ Not financial advice. For guidance only.',
    welcome: "Hello! I'm Aisha, your AI insurance advisor. How can I help you today?",
    send: 'Send',
    requestQuote: 'Request a Quote',
    comparePlans: 'Compare Plans',
  },
  si: {
    placeholder: 'රක්ෂණය ගැන අසන්න...',
    thinking: 'Aisha සිතමින් සිටී...',
    disclaimer: '⚠️ මෙය මූල්‍ය උපදෙස් නොවේ. මඟ පෙන්වීම සඳහා පමණයි.',
    welcome: 'හෙලෝ! මම Aisha, ඔබේ AI රක්ෂණ උපදේශකයා. අද ඔබට කෙසේ උදවු කළ හැකිද?',
    send: 'යවන්න',
    requestQuote: 'මිල ගණන් ඉල්ලන්න',
    comparePlans: 'සැලසුම් සංසන්දනය කරන්න',
  },
  ta: {
    placeholder: 'காப்பீடு பற்றி கேளுங்கள்...',
    thinking: 'Aisha யோசிக்கிறார்...',
    disclaimer: '⚠️ இது நிதி ஆலோசனை அல்ல. வழிகாட்டுதலுக்காக மட்டுமே.',
    welcome: 'வணக்கம்! நான் Aisha, உங்கள் AI காப்பீட்டு ஆலோசகர். இன்று உங்களுக்கு எவ்வாறு உதவலாம்?',
    send: 'அனுப்பு',
    requestQuote: 'மேற்கோள் கோரவும்',
    comparePlans: 'திட்டங்களை ஒப்பிடுக',
  },
}
