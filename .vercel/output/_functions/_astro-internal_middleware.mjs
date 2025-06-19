import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CX66Nkwb.mjs';
import 'kleur/colors';
import './chunks/astro/server_DIQx5c7g.mjs';
import 'clsx';
import 'cookie';
import { s as sequence } from './chunks/index_bHNt-Stf.mjs';

const onRequest$1 = async ({ cookies, request, redirect }, next) => {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.startsWith("/_astro/") || path.startsWith("/compressed/") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".svg") || path.endsWith(".ico") || path.endsWith(".css") || path.endsWith(".js")) {
      return next();
    }
    if (path === "/auth/callback") {
      return redirect("/dashboard");
    }
    const protectedRoutes = ["/dashboard", "/admin"];
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    if (isProtectedRoute) {
      const sessionCookie = cookies.get("sb-access-token");
      if (!sessionCookie) {
        console.log(`Acceso denegado a ruta protegida: ${path}`);
        return redirect("/?authError=unauthenticated");
      }
    }
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    console.error("Middleware error:", error);
    return next();
  }
};

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
