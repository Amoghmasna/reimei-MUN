-- Reimei MUN schema. Run in Supabase SQL Editor or with `supabase db push`.
create type application_status as enum ('pending','approved','rejected','waitlisted');
create table public.delegates (
  id uuid primary key default gen_random_uuid(), full_name text not null, age integer not null, institution text not null, grade text not null, phone text not null, email text not null,
  experience text not null, preference_1 text not null, preference_2 text not null, preference_3 text not null, status application_status not null default 'pending', created_at timestamptz not null default now()
);
create table public.executive_board (
  id uuid primary key default gen_random_uuid(), full_name text not null, age integer not null, institution text not null, phone text not null, email text not null,
  experience text not null, eb_experience text not null, committee text not null, position text not null, resume_url text, status application_status not null default 'pending', created_at timestamptz not null default now()
);
create table public.organizing_committee (
  id uuid primary key default gen_random_uuid(), full_name text not null, age integer not null, institution text not null, phone text not null, email text not null,
  experience text not null, department text not null, status application_status not null default 'pending', created_at timestamptz not null default now()
);
alter table public.delegates enable row level security; alter table public.executive_board enable row level security; alter table public.organizing_committee enable row level security;
-- Public applicants may submit only; administrators are identified by auth.users raw_app_meta_data.role = 'admin'.
create policy "public delegate submissions" on public.delegates for insert to anon,authenticated with check (true);
create policy "public executive submissions" on public.executive_board for insert to anon,authenticated with check (true);
create policy "public oc submissions" on public.organizing_committee for insert to anon,authenticated with check (true);
create policy "admin delegates" on public.delegates for all to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
create policy "admin executive" on public.executive_board for all to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
create policy "admin oc" on public.organizing_committee for all to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
-- Create a private `resumes` bucket in Storage. Add policies permitting authenticated admins to select and upload, and public inserts only if you use signed uploads.
-- Storage setup for Executive Board resumes. Create the `resumes` bucket as private in Storage first.
create policy "applicants can upload resumes" on storage.objects for insert to anon, authenticated with check (bucket_id = 'resumes');
create policy "admins can review resumes" on storage.objects for select to authenticated using (bucket_id = 'resumes' and (auth.jwt()->'app_metadata'->>'role') = 'admin');
