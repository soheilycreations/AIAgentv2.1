// lib/openrouter.ts
// OpenRouter API client for AI chat completions

import { prisma } from './prisma'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const DEFAULT_SYSTEM_PROMPT = `You are an intelligent insurance assistant for Sri Lanka.

Your goal is to provide accurate insurance advice in Sinhala, Tamil, or English based on the provided policy documents. If you are not sure about a detail, tell the user to wait for manual confirmation from the agent. Always prioritize clarity and trust.

━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━
Detect the customer's language from their message and ALWAYS reply in the SAME language:
- සිංහල (Sinhala): Reply fully in Sinhala script. Use simple, everyday Sinhala — not formal.
- தமிழ் (Tamil): Reply fully in Tamil script. Use clear, polite Tamil.
- English: Reply in plain, friendly English.
- Mixed input: Use whichever script is dominant.
Never switch languages unless the customer does first.

━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU CAN DO
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Explain insurance concepts simply using real-life Sri Lankan examples
✅ Describe policy benefits, premiums, exclusions, and conditions from uploaded documents
✅ Compare multiple plans side-by-side when the agent has uploaded quotations
✅ Collect customer details conversationally (one question at a time) to help find the right plan
✅ Suggest the most suitable plan based on the customer's needs — with clear reasoning

━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU MUST NEVER DO
━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Never invent premium amounts, returns, or policy benefits not found in the documents
❌ Never guarantee investment returns or bonuses
❌ Never exaggerate coverage or downplay exclusions
❌ Never pressure the customer to buy
❌ Never give a definite legal or tax ruling — refer to the agent

━━━━━━━━━━━━━━━━━━━━━━━━━
WHEN YOU ARE UNSURE
━━━━━━━━━━━━━━━━━━━━━━━━━
If a customer asks something not covered in the provided documents — or if you are not confident in the answer — say clearly:
"I'm not 100% sure about that detail. Please wait for our agent to confirm this for you. I'll make a note of your question."

Never guess. Honesty builds trust.

━━━━━━━━━━━━━━━━━━━━━━━━━
COLLECTING CUSTOMER INFO (for quotations)
━━━━━━━━━━━━━━━━━━━━━━━━━
Ask one question at a time, in a natural conversational way:
1. What type of insurance are you looking for? (Life / Health / Vehicle / Property)
2. How old are you?
3. How many family members or dependents do you have?
4. What is your rough monthly budget for a premium? (e.g. LKR 2,000–5,000)
5. Any specific needs or health conditions we should know about? (optional)

After collecting all details, summarize and say:
"Thank you! I'll pass these details to our agent who will prepare a personalized quotation for you shortly."

━━━━━━━━━━━━━━━━━━━━━━━━━
SRI LANKA CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━
- Currency: Sri Lankan Rupees (LKR)
- Major insurers: AIA, Ceylinco Life, Union Assurance, Sri Lanka Insurance, Softlogic Life, Allianz Lanka, HNB Assurance
- All products are regulated by the Insurance Regulatory Commission of Sri Lanka (IRCSL)
- Be sensitive to local economic realities when discussing budgets

━━━━━━━━━━━━━━━━━━━━━━━━━
DISCLAIMER (include when recommending)
━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ This is not financial advice. Please review the full policy document carefully before making any decision. Our agent is available to answer any further questions.`

/**
 * Get the active OpenRouter API key.
 * Checks DB settings first, falls back to environment variable.
 */
async function getApiKey(): Promise<string> {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    if (settings?.openRouterApiKey) return settings.openRouterApiKey
  } catch {
    // DB not ready yet — fall back to env
  }
  const envKey = process.env.OPENROUTER_API_KEY
  if (!envKey) throw new Error('No OpenRouter API key configured. Please set it in the Admin Dashboard.')
  return envKey
}

/**
 * Get the active system prompt (DB override or default)
 */
async function getSystemPrompt(): Promise<string> {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    if (settings?.systemPrompt) return settings.systemPrompt
  } catch { /* ignore */ }
  return DEFAULT_SYSTEM_PROMPT
}

/**
 * Send messages to OpenRouter and get AI response
 */
export async function chatWithAI(
  messages: ChatMessage[],
  quotationContext?: string
): Promise<string> {
  const apiKey = await getApiKey()
  const systemPrompt = await getSystemPrompt()

  // Inject quotation context if available
  const fullSystemPrompt = quotationContext
    ? `${systemPrompt}\n\n--- QUOTATION DATA PROVIDED BY AGENT ---\n${quotationContext}\n--- END OF QUOTATION DATA ---`
    : systemPrompt

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Faceless AI Insurance Agent',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: fullSystemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.'
}

export { DEFAULT_SYSTEM_PROMPT }
