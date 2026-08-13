# Reimei MUN

A premium Model United Nations application platform built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion-ready styling, and Supabase.

## Start locally

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key.
3. In Supabase, run `supabase/migrations/20260810000000_reimei_mun.sql` in the SQL editor.
4. Create a private Storage bucket named `resumes`. The migration includes policies for applicant upload and admin review.
5. Create the first Supabase Auth user for the admin and set their `app_metadata.role` to `admin` using the Supabase dashboard or Admin API.
6. Run `npm run dev`.

## Deployment

Deploy on Vercel and configure the same environment variables. The service role key is intentionally not exposed to client code. The database security rules use Supabase Auth app metadata to restrict management actions to admins.

## Included

- Responsive luxury navy, burgundy, and gold identity using the supplied Reimei crest
- Public home, committees, application selection, and three registration workflows
- Delegate two-step committee preferences
- Executive Board resume upload and committee/position selection
- Protected Supabase-authenticated admin workspace with search, status filtering, management and CSV/Excel exports
- SQL schema, RLS rules, and setup documentation

