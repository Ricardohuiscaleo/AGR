import { c as createComponent, a as createAstro, b as addAttribute, r as renderScript, d as renderHead, e as renderSlot, f as renderTemplate } from './astro/server_DLpc0srX.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description } = Astro2.props;
  return renderTemplate`<html lang="es" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><!-- Prevenir solicitudes automáticas de apple-touch-icon --><link rel="apple-touch-icon" href="/compressed/logo-oscuro-optimizado.png"><link rel="apple-touch-icon-precomposed" href="/compressed/logo-oscuro-optimizado.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${description && renderTemplate`<meta name="description"${addAttribute(description, "content")}>`}<!-- p5.js library from CDN -->${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")}<!-- Font Awesome para iconos del chat --><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer">${renderHead()}</head> <body class="dark:bg-[#ece6dc] bg-[#ece6dc]"> <!-- Contenedor principal del sitio --> ${renderSlot($$result, $$slots["default"])} <!-- Iframe aislado para el chat (solución nuclear) --> <div id="chat-overlay-container" style="position: fixed; bottom: 0; right: 0; width: 100%; height: 600px; z-index: 99999; pointer-events: none;"> <div style="width: 400px; height: 100%; margin-left: auto; margin-right: 0; pointer-events: none;"> <div id="chat-overlay-inner" style="width: 100%; height: 100%; position: relative; pointer-events: none;"> <!-- Aquí se cargará el componente chat --> </div> </div> </div> ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/layouts/Layout.astro?astro&type=script&index=1&lang.ts")} </body> </html> `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
