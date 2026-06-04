# 🧕 Faceless AI Insurance Agent

> AI-powered insurance advisor SaaS for Sri Lanka insurance agents.  
> Chat in **Sinhala · English · Tamil** — 24/7, no human needed for initial enquiries.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Chat | Multilingual chat with GPT-4o-mini via OpenRouter |
| 🌐 Auto Language | Detects Sinhala (සිංහල), Tamil (தமிழ்), or English automatically |
| 📄 PDF Upload | Agent uploads quotation PDFs; AI reads and explains them |
| 📊 Plan Comparison | AI compares multiple company plans on request |
| 👥 Lead Capture | Every quote request saved as a lead in the dashboard |
| ⚙️ Admin Dashboard | Manage API key, companies, quotations, and AI behavior |
| 🔒 Safe by Design | No hallucinated numbers; disclaimer on all recommendations |

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **AI**: OpenRouter → `openai/gpt-4o-mini`
- **Database**: Prisma ORM + SQLite (dev) → PostgreSQL (prod)
- **Deployment**: Vercel

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/faceless-ai-insurance.git
cd faceless-ai-insurance
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="file:./dev.db"
OPENROUTER_API_KEY="sk-or-..."        # get free key at openrouter.ai
ADMIN_PASSWORD="your_secure_password"
ADMIN_SECRET_KEY="random_32_char_string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Get OpenRouter API key** (free tier available):
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up → API Keys → Create Key
3. Paste into `.env.local`

### 3. Setup Database

```bash
npm run db:push    # creates SQLite database with all tables
npm run db:seed    # adds 8 Sri Lanka insurance companies
```

### 4. Run Development Server

```bash
npm run dev
```

Open:
- **Customer Chat**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

---

## 📱 Admin Dashboard Guide

### First Login
1. Go to `/admin`
2. Enter the password from `ADMIN_PASSWORD` in `.env.local`

### Setup Steps (do in order)

**Step 1 — Set API Key** (`/admin/settings`)
- Paste your OpenRouter API key
- Optionally customize the AI agent name and system prompt

**Step 2 — Add Companies** (`/admin/companies`)
- Click quick-add buttons for common Sri Lanka insurers
- Or type any company name manually

**Step 3 — Upload Quotations** (`/admin/quotations`)
- Select company + fill plan details
- Upload PDF — the system extracts text automatically
- AI can now answer customer questions using this data

**Step 4 — Share Chat Link**
- Share `https://your-domain.com` with customers
- Monitor leads at `/admin/leads`

---

## 🌐 Deploy to Vercel

### Option A: Vercel + SQLite (simplest, not recommended for production)

SQLite doesn't work on Vercel's serverless functions (ephemeral filesystem).  
Use Option B for real deployments.

### Option B: Vercel + Neon PostgreSQL (recommended)

1. **Create free PostgreSQL DB** at [neon.tech](https://neon.tech)
2. Copy the connection string

3. **Update `prisma/schema.prisma`**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. **Deploy to Vercel**:
```bash
npm i -g vercel
vercel
```

5. **Set Vercel environment variables**:
```
DATABASE_URL         = postgresql://... (from Neon)
OPENROUTER_API_KEY   = sk-or-...
ADMIN_PASSWORD       = your_password
ADMIN_SECRET_KEY     = random_secret_32chars
NEXT_PUBLIC_APP_URL  = https://your-app.vercel.app
```

6. **Run migrations on production DB**:
```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." node prisma/seed.js
```

### Option C: Self-host on VPS (DigitalOcean, etc.)

```bash
# On your VPS
git clone ...
cd faceless-ai-insurance
npm install
cp .env.example .env.local  # edit with your values
npm run db:push
npm run db:seed
npm run build
npm start
# Point your domain to port 3000 (use nginx reverse proxy)
```

---

## 🔐 Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- The admin token is stored in `localStorage` — safe for personal/agency use
- For multi-agent SaaS: replace the simple auth with [NextAuth.js](https://next-auth.js.org) or [Clerk](https://clerk.com)
- For production PDF storage: replace local `/public/uploads/` with Vercel Blob or AWS S3

---

## 🔧 Customization

### Change AI Model
In `lib/openrouter.ts`, change:
```typescript
model: 'openai/gpt-4o-mini',
// to any model on openrouter.ai, e.g.:
model: 'anthropic/claude-3-haiku',
model: 'google/gemini-flash-1.5',
```

### Add More Languages
In `lib/language.ts`, add Unicode ranges and strings.

### Brand Colors
In `tailwind.config.js`, update the `brand` color palette.

---

## 📁 File Structure

```
faceless-ai-insurance/
├── app/
│   ├── page.tsx                    # Customer chat page
│   ├── layout.tsx                  # Root HTML layout
│   ├── globals.css                 # Global styles
│   ├── components/
│   │   └── ChatInterface.tsx       # WhatsApp-style chat UI
│   ├── admin/
│   │   ├── page.tsx                # Login
│   │   ├── layout.tsx              # Sidebar layout
│   │   ├── dashboard/page.tsx      # Stats overview
│   │   ├── leads/page.tsx          # Customer leads
│   │   ├── companies/page.tsx      # Manage insurers
│   │   ├── quotations/page.tsx     # Upload PDFs
│   │   └── settings/page.tsx       # API key + AI config
│   └── api/
│       ├── chat/route.ts           # Main AI endpoint
│       ├── settings/route.ts       # Admin settings
│       ├── companies/route.ts      # Company CRUD
│       ├── admin/login/route.ts    # Auth
│       └── quote/
│           ├── request/route.ts    # Lead capture
│           └── upload/route.ts     # PDF upload + extraction
├── lib/
│   ├── prisma.ts                   # DB client singleton
│   ├── openrouter.ts               # AI client + system prompt
│   ├── language.ts                 # Language detection + i18n
│   └── auth.ts                     # Admin auth helpers
├── prisma/
│   ├── schema.prisma               # Database models
│   └── seed.js                     # Sample data
├── .env.example                    # Template for environment variables
├── vercel.json                     # Vercel deployment config
└── README.md
```

---

## ⚠️ Compliance Reminder

This tool is for **lead generation and initial customer education only**.  
All AI recommendations include a **"Not financial advice"** disclaimer.  
Ensure your agency complies with [IRCSL](https://www.ircsl.gov.lk) regulations for insurance marketing.

---

## 🙋 Support

Built by [Soheily Creations](https://soheilycreations.com) · Sri Lanka  
*Smart website development · WhatsApp bot integration · POS systems*
