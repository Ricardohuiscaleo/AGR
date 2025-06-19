/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  // Otras variables de entorno...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
