// Cliente de Supabase para SSR con soporte para navegador y servidor
import { createBrowserClient } from '@supabase/ssr';
import { createServerClient, type CookieOptions as SupabaseCookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Faltan variables de entorno de Supabase. La autenticación no funcionará correctamente.'
  );
}

// Cliente para usar en el navegador (scripts del lado del cliente)
export const supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Exportar como "supabase" para mantener compatibilidad con el código existente
export const supabase = supabaseBrowserClient;

// Función para obtener un cliente para el servidor (frontmatter de Astro, API routes)
export function getSupabaseServerClient(astroCookies: AstroCookies) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) {
        return astroCookies.get(key)?.value;
      },
      set(key: string, value: string, options: SupabaseCookieOptions) {
        const astroCookieOpts: Record<string, any> = { ...options };
        if (options.maxAge) {
          astroCookieOpts.maxAge = options.maxAge;
        }
        astroCookies.set(key, value, astroCookieOpts);
      },
      remove(key: string, options: SupabaseCookieOptions) {
        astroCookies.delete(key, { path: options.path, domain: options.domain });
      },
    },
  });
}

// Funciones de autenticación para usar en componentes del cliente
export async function signInWithEmail(email: string, password: string) {
  return await supabaseBrowserClient.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signInWithGoogle() {
  return await supabaseBrowserClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function getCurrentUser() {
  const { data, error } = await supabaseBrowserClient.auth.getUser();
  return { user: data.user, error };
}

// Función de cierre de sesión para usar en componentes del cliente
export async function signOut() {
  await supabaseBrowserClient.auth.signOut();
  // Opcionalmente redirigir después del cierre de sesión
  window.location.href = '/?signedOut=true';
}
