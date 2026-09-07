# StudyHub – Learning Platform

StudyHub is a zero-cost, mobile-first learning platform for structured and searchable course notes. It uses Next.js App Router, Supabase Auth, Tailwind CSS, and PostgreSQL full-text search.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the Supabase values.
3. Run `supabase db push` after linking your free Supabase project, or execute `supabase/migrations/0001_init.sql` in the SQL Editor.
4. In Supabase Dashboard, enable the Google provider, add the Google client ID and secret there, and allow `http://localhost:3000/auth/callback` as a redirect URL. In Google Cloud, use the Supabase Auth callback URL shown by the provider configuration.
5. Run `npm run dev` and open `http://localhost:3000`.

## Quality checks

Run `npm run typecheck` and `npm run build` before deployment. Deploy to the Vercel Hobby tier with the same environment variables configured.

## Security

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. This project follows the requested schema exactly; configure RLS policies in Supabase before enabling public Data API access.
