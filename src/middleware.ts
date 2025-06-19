// Middleware simplificado para Vercel - evita errores 500
import type { APIContext, MiddlewareNext } from 'astro';

export const onRequest = async (
  { cookies, request, redirect }: APIContext,
  next: MiddlewareNext
) => {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    // Manejar recursos estáticos sin autenticación
    if (
      path.startsWith('/_astro/') ||
      path.startsWith('/compressed/') ||
      path.endsWith('.png') ||
      path.endsWith('.jpg') ||
      path.endsWith('.svg') ||
      path.endsWith('.ico') ||
      path.endsWith('.css') ||
      path.endsWith('.js')
    ) {
      return next();
    }

    // Manejar callback de autenticación
    if (path === '/auth/callback') {
      // Simplemente redirigir al dashboard desde el callback
      return redirect('/dashboard');
    }

    // Rutas protegidas básicas
    const protectedRoutes = ['/dashboard', '/admin'];
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

    if (isProtectedRoute) {
      // Verificar si hay alguna cookie de sesión
      const sessionCookie = cookies.get('sb-access-token');

      if (!sessionCookie) {
        console.log(`Acceso denegado a ruta protegida: ${path}`);
        return redirect('/?authError=unauthenticated');
      }
    }

    // Continuar con headers básicos de seguridad
    const response = await next();
    const headers = new Headers(response.headers);

    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Middleware error:', error);
    // En caso de error, continuar sin bloquear
    return next();
  }
};
