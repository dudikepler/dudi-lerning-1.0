# wa-status-worker

Long-running Node service that holds the actual WhatsApp Web connection(s)
for the "status feed" feature, using [Baileys](https://github.com/WhiskeySockets/Baileys)
(an unofficial, reverse-engineered WhatsApp Web client). It talks to Supabase
with the **service role key**, so it must never run in a browser or be
publicly reachable without the `WORKER_API_KEY` check.

## ⚠️ Before you deploy this anywhere

- **This is not WhatsApp's official API.** Baileys logs in as a real
  WhatsApp Web session by scanning a QR code. WhatsApp's Terms of Service
  prohibit unauthorized automated/bulk access, and accounts that use tools
  like this can be **rate-limited or banned**, especially if run 24/7 for
  many users. Treat that as a real operational risk, not a hypothetical one.
- The worker **only reads `status@broadcast` messages** (Status updates) —
  it never stores or reads a user's normal chats. Keep it that way if you
  extend this code.
- Session credentials (`AUTH_DIR`) are equivalent to being logged into that
  WhatsApp account. Protect the volume they're stored on like a secret, and
  never commit `data/` to git.

## What it does

- Exposes a tiny HTTP API (`POST /connections/:id/start`) that the Next.js
  app calls when a user clicks "connect".
- Opens a Baileys socket per connection, renders the pairing QR to a data
  URL and writes it to the `wa_connections` row in Supabase (the Next.js
  app subscribes to that row via Supabase Realtime).
- Syncs the account's contacts into `wa_contacts`.
- Listens for Status broadcasts from contacts the user marked
  `is_followed`, downloads the media, uploads it to the private
  `wa-status-media` Supabase Storage bucket, and inserts a row into
  `wa_statuses`.
- On boot, resumes any connection that was `connected` before the process
  restarted (requires `AUTH_DIR` to be on a persistent volume).

## Local development

```bash
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WORKER_API_KEY
npm install
npm run dev
```

`SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key from
Supabase → Project Settings → API. Never put it in the Next.js app's
`NEXT_PUBLIC_*` env vars.

## Deploying

This process must stay alive continuously and needs a writable, **persistent**
disk for `AUTH_DIR` (default `./data/auth`) — it will not run on Vercel or
any serverless/edge platform. Railway, Render, or Fly.io all work well:

1. Create a new service from this `worker/` directory (`npm run build && npm start`).
2. Attach a persistent volume mounted at the path you set for `AUTH_DIR`
   (e.g. `/data/auth` on Railway).
3. Set `PORT`, `WORKER_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
4. In the Next.js app's deployment (e.g. Vercel), set `WORKER_URL` to this
   service's public URL and `WORKER_API_KEY` to the same secret.

If the volume is ever lost, every user has to re-scan their QR code —
sessions cannot be recovered without it.
