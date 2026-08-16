import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(items: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            items.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        }
      }
    }
  );
}
