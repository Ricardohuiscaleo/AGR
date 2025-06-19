/* empty css                                    */
import { c as createComponent, a as createAstro, g as renderComponent, r as renderScript, f as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DQ0m6GiM.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CyWK3rqm.mjs';
import { g as getSupabaseServerClient } from '../chunks/supabase_CFQDLbVX.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  console.log("Dashboard: Iniciando verificaci\xF3n de autenticaci\xF3n");
  const fromCallback = Astro2.url.searchParams.get("auth") === "success" || Astro2.url.searchParams.get("auth") === "server_redirect" || Astro2.url.searchParams.get("auth") === "callback_redirect";
  const supabase = getSupabaseServerClient(Astro2.cookies);
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError && userError.message !== "Auth session missing!") {
    console.error("Dashboard: Error al obtener usuario:", userError);
  }
  if (fromCallback && !user) {
    console.log(
      "Dashboard: Venimos del callback pero no hay usuario. Posible problema con cookies o almacenamiento."
    );
    const callbackTimestamp = Astro2.url.searchParams.get("t");
    if (callbackTimestamp) {
      console.log(`Dashboard: Timestamp de redirecci\xF3n del callback: ${callbackTimestamp}`);
    }
  } else if (user) {
    console.log(`Dashboard: Usuario autenticado: ${user.email}`);
  } else {
    console.log("Dashboard: Acceso directo, verificando autenticaci\xF3n...");
    if (!user) {
      console.log("Dashboard: No hay usuario autenticado, redirigiendo a login");
      return Astro2.redirect("/?authError=unauthenticated");
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "RAG Agent Dashboard" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dashboard-wrapper bg-gradient-to-b from-violet-900 to-indigo-900 min-h-screen"> <div class="container mx-auto px-4 py-8"> <header class="flex justify-between items-center mb-8"> <div class="flex items-center"> <img src="/compressed/logo-oscuro-optimizado.png" alt="RAG Agent Logo" class="h-12 mr-4"> <h1 class="text-3xl font-bold text-white">RAG Agent Dashboard</h1> </div> <div class="flex items-center"> ${user && renderTemplate`<span class="text-violet-200 mr-4"> <span class="opacity-75">Usuario: </span> ${user.email} </span>`} <button id="logout-btn" class="bg-violet-800 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors">
Cerrar sesión
</button> </div> </header> <div id="dashboard-content"> <!-- Aquí irá el contenido del dashboard --> <div class="bg-black/30 backdrop-blur-md rounded-xl border border-violet-500/20 p-8 mb-8"> <h2 class="text-2xl font-bold text-white mb-4">Bienvenido al Dashboard</h2> <p class="text-violet-200">
Este es tu dashboard personalizado donde podrás acceder a todas las funcionalidades de
            RAG Agent.
</p> </div> <!-- Añadir aquí más secciones del dashboard según necesidades --> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> <!-- Tarjeta de ejemplo --> <div class="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/10 p-6 hover:border-violet-500/30 transition-all"> <h3 class="text-xl font-semibold text-white mb-3">Mis Consultas</h3> <p class="text-violet-200 mb-4">Accede a tu historial de consultas y resultados.</p> <a href="#" class="text-violet-300 hover:text-violet-100 transition-colors inline-flex items-center">
Ver más
<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path> </svg> </a> </div> <!-- Más tarjetas irían aquí --> </div> </div> <!-- Mensaje de sesión no encontrada (oculto por defecto) --> <div id="no-session-message" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden items-center justify-center z-50"> <div class="bg-violet-900 rounded-xl border border-violet-500/30 p-8 max-w-md w-full"> <h2 class="text-2xl font-bold text-white mb-4">Sesión no detectada</h2> <p class="text-violet-200 mb-6">
No se ha detectado una sesión activa. Por favor inicia sesión nuevamente.
</p> <div class="flex flex-col sm:flex-row gap-3"> <button id="retry-session-btn" class="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors">
Reintentar
</button> <a href="/" class="bg-transparent border border-violet-400 hover:border-violet-200 text-white px-4 py-2 rounded-lg text-center transition-colors">
Iniciar sesión
</a> </div> <!-- Debug info section --> <div class="mt-8 pt-4 border-t border-violet-700/50"> <details class="text-xs text-violet-300"> <summary class="cursor-pointer hover:text-violet-100 transition-colors">
Información de depuración
</summary> <div class="mt-3 space-y-2 text-left"> <p>URL actual: <span id="current-url"></span></p> <p>Desde callback: <span id="from-callback"></span></p> <p>User Agent: <span id="user-agent"></span></p> <p>Cookies disponibles: <span id="cookies-available"></span></p> <p>localStorage disponible: <span id="localstorage-available"></span></p> </div> </details> </div> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/dashboard/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/dashboard/index.astro", void 0);

const $$file = "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
