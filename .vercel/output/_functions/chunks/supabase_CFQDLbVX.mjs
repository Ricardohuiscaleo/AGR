import { createBrowserClient, createServerClient } from '@supabase/ssr';

const supabaseUrl = "https://uznvakpuuxnpdhoejrog.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg";
const supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
const supabase = supabaseBrowserClient;
function getSupabaseServerClient(astroCookies) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key) {
        return astroCookies.get(key)?.value;
      },
      set(key, value, options) {
        const astroCookieOpts = { ...options };
        if (options.maxAge) {
          astroCookieOpts.maxAge = options.maxAge;
        }
        astroCookies.set(key, value, astroCookieOpts);
      },
      remove(key, options) {
        astroCookies.delete(key, { path: options.path, domain: options.domain });
      }
    }
  });
}

export { getSupabaseServerClient as g, supabase as s };
