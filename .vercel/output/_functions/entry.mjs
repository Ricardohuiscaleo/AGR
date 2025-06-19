import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_C3pzaqeX.mjs';
import { manifest } from './manifest_ChEesrnl.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/blog/buscar-por-tema.astro.mjs');
const _page2 = () => import('./pages/api/blog/estadisticas.astro.mjs');
const _page3 = () => import('./pages/api/blog/generar.astro.mjs');
const _page4 = () => import('./pages/api/blog/incrementar-likes.astro.mjs');
const _page5 = () => import('./pages/api/blog/incrementar-vistas.astro.mjs');
const _page6 = () => import('./pages/api/blog/obtener-completo/_blogid_.astro.mjs');
const _page7 = () => import('./pages/api/blog/obtener-generados.astro.mjs');
const _page8 = () => import('./pages/auth/callback.astro.mjs');
const _page9 = () => import('./pages/dashboard/admin/users.astro.mjs');
const _page10 = () => import('./pages/dashboard.astro.mjs');
const _page11 = () => import('./pages/diagrama-timeline.astro.mjs');
const _page12 = () => import('./pages/prueba-calendario.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/blog/buscar-por-tema.ts", _page1],
    ["src/pages/api/blog/estadisticas.ts", _page2],
    ["src/pages/api/blog/generar.ts", _page3],
    ["src/pages/api/blog/incrementar-likes.ts", _page4],
    ["src/pages/api/blog/incrementar-vistas.ts", _page5],
    ["src/pages/api/blog/obtener-completo/[blogId].ts", _page6],
    ["src/pages/api/blog/obtener-generados.ts", _page7],
    ["src/pages/auth/callback.astro", _page8],
    ["src/pages/dashboard/admin/users.astro", _page9],
    ["src/pages/dashboard/index.astro", _page10],
    ["src/pages/diagrama-timeline.astro", _page11],
    ["src/pages/prueba-calendario.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "9522c1fc-fab8-40d8-84f3-d224823b6e37",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
