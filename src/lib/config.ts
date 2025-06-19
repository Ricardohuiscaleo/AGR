// Configuración de variables para modo estático
// Estas variables estarán disponibles en el navegador

export const CONFIG = {
  // Supabase - Públicas (seguras para el frontend)
  SUPABASE_URL: 'https://uznvakpuuxnpdhoejrog.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg',

  // ⚠️ APIs de IA - Estas keys estarán visibles en el navegador
  // Solo úsalas si estás dispuesto a asumir el riesgo de uso no autorizado
  GEMINI_API_KEY: 'AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI',

  // URLs base
  SITE_URL: window.location.origin,

  // Configuración de la app
  APP_NAME: 'Agente RAG',
  VERSION: '1.0.0',
};

// Función para obtener configuración
export function getConfig() {
  return CONFIG;
}
