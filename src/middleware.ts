// Middleware de autenticación y cabeceras de seguridad para SSR con Supabase
import type { APIContext, MiddlewareNext } from 'astro';
import { getSupabaseServerClient } from './lib/supabase';

// Exportamos directamente la función onRequest
export const onRequest = async (
  { cookies, request, redirect }: APIContext,
  next: MiddlewareNext
) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('MIDDLEWARE: Variables de entorno de Supabase no configuradas');
    return next();
  }

  // Crear cliente de Supabase para el servidor usando las cookies de Astro
  const supabase = getSupabaseServerClient(cookies);

  try {
    // Obtener el usuario autenticado directamente (más seguro que getSession)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Log authentication errors (ayuda a depurar problemas)
    if (userError && userError.message !== 'Auth session missing!') {
      console.error('MIDDLEWARE: Error al obtener usuario:', userError);
    }

    // Obtener el URL actual
    const url = new URL(request.url);
    const path = url.pathname;

    // 🆕 SOLUCIÓN MEJORADA: Agregar CORS para recursos estáticos (elimina errores de auditoría)
    if (
      path.startsWith('/compressed/') ||
      path.startsWith('/public/') ||
      path.endsWith('.png') ||
      path.endsWith('.jpg') ||
      path.endsWith('.jpeg') ||
      path.endsWith('.svg') ||
      path.endsWith('.webp') ||
      path.endsWith('.ico')
    ) {
      const response = await next();
      const headers = new Headers(response.headers);

      // Permitir CORS para herramientas de desarrollo y evitar errores de auditoría
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    // Manejar el callback de OAuth para evitar bucles de redirección
    if (path === '/auth/callback') {
      console.log('MIDDLEWARE: Procesando callback de autenticación');

      // Obtener el código de autenticación de la URL
      const authCode = url.searchParams.get('code');

      // Si hay un código de autenticación, procesarlo
      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);
        if (error) {
          console.error('Error al intercambiar código por sesión:', error);
          return redirect('/?authError=exchange_failed');
        }
        // No necesitamos getUser de nuevo aquí, intercambiar código ya establece cookies
      }

      // Redirigir siempre al dashboard después de un login exitoso
      return redirect('/dashboard');
    }

    // Rutas protegidas que requieren autenticación
    const protectedRoutes = ['/dashboard', '/admin'];
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

    // Si es una ruta protegida y no hay usuario autenticado, redirigir al login
    if (isProtectedRoute && !user) {
      console.log(`MIDDLEWARE: Acceso denegado a ruta protegida: ${path}`);
      return redirect('/?authError=unauthenticated');
    }

    // Si el usuario ya está autenticado y va a la página de login, redirigir al dashboard
    if ((path === '/login' || path === '/auth/login') && user) {
      console.log('MIDDLEWARE: Usuario ya autenticado, redirigiendo al dashboard');
      return redirect('/dashboard');
    }

    // Configurar encabezados de seguridad
    const response = await next();

    // Aplicar encabezados de seguridad
    const headers = new Headers(response.headers);

    // Configuración estricta de seguridad
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), fullscreen=(self "https://maps.google.com" "https://www.google.com")'
    );

    // Solo permitir HTTPS en producción
    if (import.meta.env.PROD) {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Configurar CSP (Content Security Policy)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://apis.google.com https://unpkg.com https://cdnjs.cloudflare.com https://kit.fontawesome.com https://ka-f.fontawesome.com https://p5js.org https://cdn.p5js.org",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://ka-f.fontawesome.com https://kit.fontawesome.com",
      "font-src 'self' https://fonts.gstatic.com https://res.cloudinary.com https://cdnjs.cloudflare.com https://ka-f.fontawesome.com data: blob:",
      "img-src 'self' data: blob: https://res.cloudinary.com https://assets.codepen.io https://images.unsplash.com https://via.placeholder.com",
      `connect-src 'self' ${supabaseUrl} https://fonts.googleapis.com https://fonts.gstatic.com https://res.cloudinary.com https://unpkg.com https://cdnjs.cloudflare.com https://kit.fontawesome.com https://ka-f.fontawesome.com https://p5js.org https://cdn.p5js.org https://primary-production-33e8.up.railway.app https://assets.codepen.io ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:*`,
      "worker-src 'self' blob:",
      "frame-src 'self' https://maps.google.com https://www.google.com",
      "media-src 'self' https://res.cloudinary.com",
      "child-src 'self' blob:",
    ].join('; ');

    headers.set('Content-Security-Policy', csp);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('MIDDLEWARE: Error en middleware:', error);

    // En caso de error, continuar pero loguear
    const response = await next();
    return response;
  }
};
