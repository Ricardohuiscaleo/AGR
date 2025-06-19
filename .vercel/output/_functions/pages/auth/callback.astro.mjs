/* empty css                                       */
import { c as createComponent, a as createAstro, d as renderHead, r as renderScript, f as renderTemplate } from '../../chunks/astro/server_DLpc0srX.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                       */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Callback = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Callback;
  const currentUrl = Astro2.request.url;
  const referrer = Astro2.request.headers.get("referer");
  const urlParams = Astro2.url.searchParams;
  const hasCode = urlParams.has("code");
  const theCode = urlParams.get("code");
  const hasState = urlParams.has("state");
  console.log(`Callback: Recibida URL ${Astro2.url.toString()}`);
  console.log(`Callback: C\xF3digo de autorizaci\xF3n: ${hasCode ? theCode : "Ausente"}`);
  console.log(`Callback: Estado: ${hasState ? urlParams.get("state") : "Ausente"}`);
  return renderTemplate`<html lang="es" data-astro-cid-qbporkgn> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Autenticando...</title>${renderHead()}</head> <body data-astro-cid-qbporkgn> <div class="auth-container" data-astro-cid-qbporkgn> <img src="/compressed/logo-oscuro-optimizado.png" alt="Logo AR" class="logo" data-astro-cid-qbporkgn> <h1 data-astro-cid-qbporkgn>Autenticando...</h1> <div class="spinner" id="loading-spinner" data-astro-cid-qbporkgn></div> <p data-astro-cid-qbporkgn>Estamos procesando tu inicio de sesión.</p> <p data-astro-cid-qbporkgn>Serás redireccionado automáticamente en unos segundos.</p> <div class="error-message" id="auth-error" data-astro-cid-qbporkgn> <p id="error-message" data-astro-cid-qbporkgn>Ha ocurrido un error durante la autenticación.</p> <a href="/#iniciar" class="button" data-astro-cid-qbporkgn>Volver a intentar</a> </div> <!-- Panel de depuración (visible solo en entorno de desarrollo) --> <div class="debug-panel" id="debug-panel" style="display: none;" data-astro-cid-qbporkgn> <h3 data-astro-cid-qbporkgn>Información de depuración</h3> <div class="debug-info" data-astro-cid-qbporkgn> <p data-astro-cid-qbporkgn><strong data-astro-cid-qbporkgn>URL actual:</strong> ${currentUrl}</p> <p data-astro-cid-qbporkgn><strong data-astro-cid-qbporkgn>Referrer:</strong> ${referrer || "N/A"}</p> <p data-astro-cid-qbporkgn><strong data-astro-cid-qbporkgn>Código de autorización:</strong> ${hasCode ? "Presente" : "Ausente"}</p> <p data-astro-cid-qbporkgn><strong data-astro-cid-qbporkgn>Estado:</strong> ${hasState ? "Presente" : "Ausente"}</p> </div> <pre id="debug-info" class="debug-info" data-astro-cid-qbporkgn></pre> <div style="text-align: center;" data-astro-cid-qbporkgn> <button id="force-dashboard" class="button" data-astro-cid-qbporkgn>Forzar dashboard</button> <button id="check-storage" class="button" data-astro-cid-qbporkgn>Verificar almacenamiento</button> <button id="clear-storage" class="button danger" data-astro-cid-qbporkgn>Limpiar almacenamiento</button> </div> </div> </div> ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/auth/callback.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/auth/callback.astro", void 0);

const $$file = "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/auth/callback.astro";
const $$url = "/auth/callback";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Callback,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
