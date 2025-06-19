/* empty css                                          */
import { c as createComponent, a as createAstro, g as renderComponent, r as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../../chunks/astro/server_DLpc0srX.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../../chunks/Layout_Dl1ipmmv.mjs';
import { s as supabase } from '../../../chunks/supabase_CFQDLbVX.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Users = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Users;
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (user) {
    const { data: adminCheck, error: adminCheckError } = await supabase.rpc("is_admin");
    if (!adminCheckError && adminCheck === true) ; else {
      return Astro2.redirect("/dashboard");
    }
  } else {
    return Astro2.redirect("/#iniciar");
  }
  const { data: users, error: usersError } = await supabase.from("user_roles").select(`
    user_id,
    role,
    metadata,
    created_at,
    users:user_id (
      email,
      last_sign_in_at
    )
  `);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Gesti\xF3n de Usuarios | Admin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white"> <!-- Header Admin --> <header class="bg-amber-900/40 backdrop-blur-md border-b border-amber-500/20"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex justify-between items-center py-4"> <div class="flex items-center"> <img src="/compressed/logo-oscuro-optimizado.png" alt="Logo AR" class="h-8 w-auto mr-4"> <div class="flex items-center"> <h1 class="text-xl font-bold">Panel de Administración</h1> <span class="ml-3 bg-amber-600/30 text-amber-200 text-xs py-1 px-2 rounded-full border border-amber-500/30">
Admin
</span> </div> </div> <div class="flex items-center space-x-4"> <a href="/dashboard" class="text-sm bg-black/30 hover:bg-black/50 border border-violet-500/30 py-2 px-4 rounded-lg transition-colors">
Volver al Dashboard
</a> <button id="logout-button" class="text-sm bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 py-2 px-4 rounded-lg transition-colors">
Cerrar sesión
</button> </div> </div> </div> </header> <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="mb-8"> <h2 class="text-3xl font-bold text-white mb-6">Gestión de Usuarios</h2> <!-- Panel de creación de usuarios --> <div class="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 mb-8"> <h3 class="text-xl font-medium text-amber-200 mb-4">Añadir nuevo usuario</h3> <form id="create-user-form" class="space-y-4"> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="email" class="block text-sm font-medium text-violet-200 mb-1">
Email del usuario
</label> <input type="email" id="email" name="email" required class="w-full bg-black/50 border border-violet-500/30 rounded-lg py-2 px-3 text-white placeholder-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="usuario@example.com"> </div> <div> <label for="role" class="block text-sm font-medium text-violet-200 mb-1">
Rol
</label> <select id="role" name="role" class="w-full bg-black/50 border border-violet-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"> <option value="user">Usuario normal</option> <option value="admin">Administrador</option> </select> </div> </div> <div class="flex justify-end"> <button type="submit" class="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-2 px-6 rounded-lg transition-colors">
Crear usuario
</button> </div> </form> <!-- Mensaje de resultado --> <div id="result-message" class="mt-4 hidden"></div> </div> <!-- Tabla de usuarios --> <div class="bg-black/40 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6"> <h3 class="text-xl font-medium text-white mb-6">Usuarios registrados</h3> <div class="overflow-x-auto"> <table class="w-full text-sm"> <thead> <tr class="border-b border-violet-500/20"> <th class="text-left py-3 px-4 text-violet-300">Email</th> <th class="text-left py-3 px-4 text-violet-300">ID</th> <th class="text-left py-3 px-4 text-violet-300">Rol</th> <th class="text-left py-3 px-4 text-violet-300">Última conexión</th> <th class="text-left py-3 px-4 text-violet-300">Acciones</th> </tr> </thead> <tbody id="users-table-body"> ${users && users.map((userItem) => renderTemplate`<tr class="border-b border-violet-500/10 hover:bg-violet-900/10"> <td class="py-3 px-4 text-violet-100"> ${userItem.users?.email || "Sin email"} </td> <td class="py-3 px-4 text-xs text-violet-300">${userItem.user_id}</td> <td class="py-3 px-4"> <span${addAttribute(`text-xs py-1 px-2 rounded-full ${userItem.role === "admin" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-violet-500/20 text-violet-300 border border-violet-500/30"}`, "class")}> ${userItem.role} </span> </td> <td class="py-3 px-4 text-violet-200"> ${userItem.users?.last_sign_in_at ? new Date(userItem.users.last_sign_in_at).toLocaleString() : "Nunca"} </td> <td class="py-3 px-4"> <button class="text-violet-300 hover:text-white mr-3"${addAttribute(userItem.user_id, "data-user-id")}>
Editar
</button> </td> </tr>`)} </tbody> </table> </div> <!-- Si no hay usuarios o hay un error --> ${usersError && renderTemplate`<div class="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mt-6"> <p class="text-red-300">Error al cargar usuarios: ${usersError.message}</p> </div>`} ${(!users || users.length === 0) && !usersError && renderTemplate`<div class="p-4 bg-violet-900/20 border border-violet-500/30 rounded-lg mt-6"> <p class="text-violet-300">No hay usuarios registrados en el sistema.</p> </div>`} </div> </div> </main> </div> ` })} ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/dashboard/admin/users.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/dashboard/admin/users.astro", void 0);

const $$file = "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/dashboard/admin/users.astro";
const $$url = "/dashboard/admin/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Users,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
