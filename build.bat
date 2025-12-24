set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
set NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-key
npx prisma@5.14.0 generate && npx next build
