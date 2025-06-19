import { g as getSupabaseServerClient } from './chunks/supabase_CFQDLbVX.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_zLg3HgTj.mjs';
import 'kleur/colors';
import './chunks/astro/server_DQ0m6GiM.mjs';
import 'clsx';
import 'cookie';
import { s as sequence } from './chunks/index_BadUw_sG.mjs';

const onRequest$1 = async ({ cookies, request, redirect }, next) => {
  const supabaseUrl = "https://uznvakpuuxnpdhoejrog.supabase.co";
  const supabase = getSupabaseServerClient(cookies);
  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (userError && userError.message !== "Auth session missing!") {
      console.error("MIDDLEWARE: Error al obtener usuario:", userError);
    }
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.startsWith("/compressed/") || path.startsWith("/public/") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg") || path.endsWith(".svg") || path.endsWith(".webp") || path.endsWith(".ico")) {
      const response2 = await next();
      const headers2 = new Headers(response2.headers);
      headers2.set("Access-Control-Allow-Origin", "*");
      headers2.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      headers2.set("Access-Control-Allow-Headers", "Content-Type");
      headers2.set("Cache-Control", "public, max-age=31536000, immutable");
      headers2.set("Cross-Origin-Resource-Policy", "cross-origin");
      return new Response(response2.body, {
        status: response2.status,
        statusText: response2.statusText,
        headers: headers2
      });
    }
    if (path === "/auth/callback") {
      console.log("MIDDLEWARE: Procesando callback de autenticación");
      const authCode = url.searchParams.get("code");
      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);
        if (error) {
          console.error("Error al intercambiar código por sesión:", error);
          return redirect("/?authError=exchange_failed");
        }
      }
      return redirect("/dashboard");
    }
    const protectedRoutes = ["/dashboard", "/admin"];
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    if (isProtectedRoute && !user) {
      console.log(`MIDDLEWARE: Acceso denegado a ruta protegida: ${path}`);
      return redirect("/?authError=unauthenticated");
    }
    if ((path === "/login" || path === "/auth/login") && user) {
      console.log("MIDDLEWARE: Usuario ya autenticado, redirigiendo al dashboard");
      return redirect("/dashboard");
    }
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set(
      "Permissions-Policy",
      'camera=(), microphone=(), geolocation=(), fullscreen=(self "https://maps.google.com" "https://www.google.com")'
    );
    if (true) {
      headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
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
      "child-src 'self' blob:"
    ].join("; ");
    headers.set("Content-Security-Policy", csp);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    console.error("MIDDLEWARE: Error en middleware:", error);
    const response = await next();
    return response;
  }
};

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
