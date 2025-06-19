import type { MiddlewareHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware = (async ({ cookies, request, redirect }) => {
  try {
    // Ignorar las rutas de assets y archivos estáticos
    const url = new URL(request.url);
    if (
      url.pathname.startsWith('/_astro/') ||
      url.pathname.startsWith('/compressed/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')
    ) {
      return; // No aplicar el middleware para recursos estáticos
    }

    // CRÍTICO: Siempre permitir acceso al callback de autenticación sin verificación
    // Esto evita el bloqueo del flujo de autenticación OAuth
    if (url.pathname === '/auth/callback') {
      console.log('Permitiendo acceso directo a callback de autenticación');
      return; // Permitir que continúe sin redirección
    }

    // Especial: si venimos de un redirect del callback, dar tiempo extra
    // para que las cookies se procesen correctamente
    const isFromCallback =
      url.searchParams.has('auth') && url.searchParams.get('auth') === 'server_redirect';

    // Obtener la sesión usando el cliente de Supabase
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session;

    // Log para depuración
    console.log('AuthMiddleware:', {
      url: url.pathname + (url.hash || ''),
      params: Object.fromEntries(url.searchParams.entries()),
      isFromCallback: isFromCallback,
      hasSession: !!session,
      sessionError: error ? error.message : null,
    });

    // Lista de rutas protegidas
    const protectedRoutes = ['/dashboard', '/dashboard/'];
    const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

    // Si venimos del callback y no hay sesión, esperamos
    // que sea un problema de timing, así que permitimos
    // el acceso a esta solicitud inicial
    if (isProtectedRoute && isFromCallback && !session) {
      console.log('Permitiendo acceso provisional desde callback a pesar de no detectar sesión');
      // Permitir acceso - asumimos que el cliente tiene la sesión
      // pero el servidor aún no puede verla
      return;
    }

    // Redirigir a login si es ruta protegida y no hay sesión
    if (isProtectedRoute && !session) {
      console.log('Redirigiendo a login: No hay sesión activa para ruta protegida');
      return redirect('/#iniciar');
    }

    // Redirigir a dashboard si ya hay sesión y está en auth
    // Nota: Solo hacemos esto si la URL no tiene hash (evita conflictos con OAuth)
    const isInitialPage = url.pathname === '/' && url.hash === '#iniciar';
    const isLoginPage = url.pathname === '/auth/login';
    const isAuthPage = isInitialPage || isLoginPage;

    // SOLO redirigir si realmente hay una sesión confirmada con un usuario válido
    if (isAuthPage && session && session.user) {
      console.log('Usuario ya autenticado, redirigiendo al dashboard');
      return redirect('/dashboard');
    }
  } catch (err) {
    console.error('Error en middleware de autenticación:', err);
    // Si hay un error, permitir que la solicitud continúe
    // para evitar bloqueos completos de la aplicación
  }
}) satisfies MiddlewareHandler;

/**
 * Middleware de autenticación para proteger rutas en el lado del cliente
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // Obtener la sesión actual del usuario
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error al verificar autenticación:', error);
      return false;
    }

    // Verificar si hay una sesión válida
    return !!data.session;
  } catch (err) {
    console.error('Error inesperado en middleware de autenticación:', err);
    return false;
  }
};

/**
 * Middleware para verificar si un usuario tiene permisos de administrador
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    // Primero verificamos que esté autenticado
    const authenticated = await isAuthenticated();
    if (!authenticated) return false;

    // Obtener el usuario actual
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return false;

    // Consultar el rol del usuario en la tabla user_roles
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single();

    // Verificar si el rol es 'admin'
    return roleData?.role === 'admin';
  } catch (err) {
    console.error('Error al verificar permisos de administrador:', err);
    return false;
  }
};

/**
 * Middleware para redirigir a usuarios no autenticados
 * Se usa para proteger rutas del lado del cliente
 */
export const requireAuth = async (
  redirectUrl = '/auth/login'
): Promise<{ authorized: boolean; redirectTo: string | null }> => {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      // Si no está autenticado, retornar información para redirección
      return {
        authorized: false,
        redirectTo: `${redirectUrl}?redirect=${encodeURIComponent(window.location.pathname)}`,
      };
    }

    // Usuario autenticado, puede acceder a la ruta
    return { authorized: true, redirectTo: null };
  } catch (err) {
    console.error('Error en requireAuth:', err);
    return { authorized: false, redirectTo: redirectUrl };
  }
};

/**
 * Middleware para verificar y manejar la autenticación en componentes
 * @returns Objeto con información sobre el estado de autenticación
 */
export const useAuthMiddleware = async () => {
  try {
    // Verificar sesión actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error al verificar sesión:', sessionError);
      return {
        isLoggedIn: false,
        isAdmin: false,
        userId: null,
        email: null,
        loading: false,
        error: sessionError.message,
      };
    }

    if (!sessionData.session) {
      return {
        isLoggedIn: false,
        isAdmin: false,
        userId: null,
        email: null,
        loading: false,
        error: null,
      };
    }

    // Usuario autenticado, obtener información adicional
    const user = sessionData.session.user;

    // Verificar rol de administrador
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = roleData?.role === 'admin';

    return {
      isLoggedIn: true,
      isAdmin,
      userId: user.id,
      email: user.email,
      loading: false,
      error: null,
    };
  } catch (err) {
    console.error('Error inesperado:', err);
    return {
      isLoggedIn: false,
      isAdmin: false,
      userId: null,
      email: null,
      loading: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
};

/**
 * Función para depurar problemas de autenticación
 * Solo para uso en desarrollo
 */
export const debugAuthStatus = async () => {
  if (import.meta.env.DEV) {
    try {
      console.log('=== DEBUG AUTH STATUS ===');

      // Verificar sesión
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Sesión:', sessionData?.session ? 'Activa' : 'Inactiva');

      if (sessionError) {
        console.error('Error de sesión:', sessionError);
      }

      if (sessionData?.session) {
        console.log('Usuario:', sessionData.session.user.email);
        console.log('Expira:', new Date(sessionData.session.expires_at * 1000).toLocaleString());

        // Verificar rol
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, metadata')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();

        if (roleError) {
          console.error('Error al obtener rol:', roleError);
        } else {
          console.log('Rol:', roleData?.role || 'No asignado');
        }
      }

      // Verificar almacenamiento local
      console.log('localStorage auth_completed:', localStorage.getItem('auth_completed'));
      console.log('localStorage auth_timestamp:', localStorage.getItem('auth_timestamp'));
      console.log('sessionStorage auth_processing:', sessionStorage.getItem('auth_processing'));

      console.log('=== END DEBUG ===');
    } catch (err) {
      console.error('Error en depuración de autenticación:', err);
    }
  }
};
