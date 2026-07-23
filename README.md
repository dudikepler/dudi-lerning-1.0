This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## WhatsApp status feed (`/status`)

This repo also includes a "connect your WhatsApp, follow contacts, see their
Status updates in one feed" feature under `/status`. It has two parts:

- **This Next.js app** (`src/app/status/**`) — signup/login, connecting a
  WhatsApp account, picking which contacts to follow, and the status feed
  itself. Backed by Supabase (Postgres + Auth + Storage).
- **`worker/`** — a separate, long-running Node service that holds the
  actual WhatsApp Web session(s) via [Baileys](https://github.com/WhiskeySockets/Baileys)
  and writes synced contacts/statuses into Supabase. It cannot run on
  Vercel/serverless — see `worker/README.md` for why and how to deploy it.

### ⚠️ Read this before enabling it for real users

- Connecting via Baileys is **not** WhatsApp's official API — it's an
  unofficial WhatsApp Web client. This violates WhatsApp's Terms of Service
  around automated access, and the connected number can be rate-limited or
  banned by WhatsApp, especially under sustained/multi-user use. There is no
  way to eliminate this risk, only to be aware of it.
- The worker is scoped to only ever read `status@broadcast` messages
  (Status updates already visible to the connected account) — it does not
  read or store anyone's normal chats.
- This is an original implementation and UI, not a copy of any existing
  status-viewing product's branding, design, or code.

### Setup

1. Create a Supabase project. Run `supabase/migrations/0001_wa_status.sql`
   against it (SQL editor or `supabase db push`) — it creates the
   `wa_connections` / `wa_contacts` / `wa_statuses` tables, their RLS
   policies, and the private `wa-status-media` storage bucket.
2. Fill in `.env.local` from `.env.example`: the Supabase URL/anon key, plus
   `WORKER_URL` and `WORKER_API_KEY` pointing at your deployed worker.
3. Deploy `worker/` somewhere with a persistent disk (see `worker/README.md`)
   and give it the Supabase **service role** key.
4. Visit `/status`, sign up, connect, scan the QR code, pick contacts to
   follow, and check `/status/feed`.
