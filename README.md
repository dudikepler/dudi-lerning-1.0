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

## Therapist recommendations platform (`/therapists`, `/dashboard`, `/admin`)

A separate section of the site (its own visual theme, doesn't touch the
personal-brand pages) where people can browse therapists/psychologists,
leave fully anonymous ratings and reviews, and therapists can self-register,
build their own profile page, and publish articles.

- **Anonymity**: reviews store no reviewer identity at all (no user id, name,
  or email column) and go through admin approval before they're public.
- **Therapist onboarding**: self-signup via Supabase Auth, profile stays
  hidden (`status = 'pending'`) until an admin approves it.
- **Admin access**: set `ADMIN_EMAILS` (comma-separated) in your env. Anyone
  who signs up or logs in with one of those emails gets access to `/admin`.

### Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL in `supabase/migrations/0001_init.sql` against it (SQL editor,
   or `supabase db push` with the Supabase CLI). It creates the
   `therapists`, `articles`, and `reviews` tables, their Row Level Security
   policies, and the public `therapist-photos` storage bucket.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project
     Settings > API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, **server-only**, used by admin
     moderation actions to bypass RLS.
   - `ADMIN_EMAILS` — the email(s) that should have access to `/admin`.
4. Run `npm run dev`, sign up at `/register` with an admin email, then visit
   `/admin` to approve therapists and reviews.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
