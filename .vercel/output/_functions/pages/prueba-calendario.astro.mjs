/* empty css                                    */
import { c as createComponent, a as createAstro, m as maybeRenderHead, b as addAttribute, g as renderComponent, f as renderTemplate } from '../chunks/astro/server_DQ0m6GiM.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CyWK3rqm.mjs';
/* empty css                                             */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$BookingCalendarWrapper = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BookingCalendarWrapper;
  const {
    calendarId,
    title = "Asesor\xEDa Personalizada con IA",
    description = "Reserva tu consultor\xEDa sobre implementaci\xF3n de sistemas RAG y soluciones de IA",
    accentColor = "#3B82F6",
    className = "",
    workingHoursStart = 9,
    workingHoursEnd = 22,
    slotDuration = 60,
    timeZone = "America/Santiago",
    apiEndpoint = "/api/calendar"
  } = Astro2.props;
  return renderTemplate`<!-- Contenedor principal que ocupa todo el ancho disponible -->${maybeRenderHead()}<section${addAttribute(`booking-calendar-section w-full ${className}`, "class")} data-astro-cid-wvtporwm> <!-- Header de la sección con información integrada --> <div class="calendar-header" data-astro-cid-wvtporwm> <div class="header-content" data-astro-cid-wvtporwm> <h2 class="calendar-title" data-astro-cid-wvtporwm>${title}</h2> <p class="calendar-description" data-astro-cid-wvtporwm>${description}</p> <!-- Información clave integrada en el header --> <div class="key-info" data-astro-cid-wvtporwm> <div class="info-item" data-astro-cid-wvtporwm> <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-wvtporwm> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-wvtporwm></path> </svg> <span data-astro-cid-wvtporwm>Duración: 60 minutos</span> </div> <div class="info-item" data-astro-cid-wvtporwm> <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-wvtporwm> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" data-astro-cid-wvtporwm></path> </svg> <span data-astro-cid-wvtporwm>Reunión vía Meet</span> </div> <div class="info-item" data-astro-cid-wvtporwm> <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-wvtporwm> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-wvtporwm></path> </svg> <span data-astro-cid-wvtporwm>Confirmación inmediata</span> </div> </div> </div> </div> <!-- Componente de calendario con ancho completo --> <div class="calendar-container" data-astro-cid-wvtporwm> ${renderComponent($$result, "BookingCalendar", null, { "client:only": "react", "calendarId": calendarId, "title": title, "description": description, "accentColor": accentColor, "workingHoursStart": workingHoursStart, "workingHoursEnd": workingHoursEnd, "slotDuration": slotDuration, "timeZone": timeZone, "sessionPrice": "$20.000 CLP", "client:component-hydration": "only", "data-astro-cid-wvtporwm": true, "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/calendar/BookingCalendar.jsx", "client:component-export": "default" })} </div> <!-- Información adicional integrada al final --> <div class="calendar-footer" data-astro-cid-wvtporwm> <div class="footer-content" data-astro-cid-wvtporwm> <div class="benefits-grid" data-astro-cid-wvtporwm> <div class="benefit-item" data-astro-cid-wvtporwm> <div class="benefit-icon" data-astro-cid-wvtporwm>🤖</div> <h4 data-astro-cid-wvtporwm>IA Personalizada</h4> <p data-astro-cid-wvtporwm>Soluciones RAG adaptadas a tu negocio específico</p> </div> <div class="benefit-item" data-astro-cid-wvtporwm> <div class="benefit-icon" data-astro-cid-wvtporwm>⚡</div> <h4 data-astro-cid-wvtporwm>Implementación Rápida</h4> <p data-astro-cid-wvtporwm>Desde la consultoría hasta la producción en tiempo récord</p> </div> <div class="benefit-item" data-astro-cid-wvtporwm> <div class="benefit-icon" data-astro-cid-wvtporwm>🎯</div> <h4 data-astro-cid-wvtporwm>Resultados Medibles</h4> <p data-astro-cid-wvtporwm>ROI comprobable y métricas de rendimiento claras</p> </div> </div> </div> </div> </section> `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/calendar/BookingCalendarWrapper.astro", void 0);

const $$PruebaCalendario = createComponent(($$result, $$props, $$slots) => {
  const webhookGetEvents = "https://primary-production-33e8.up.railway.app/webhook/156b71d9-9b89-4c39-9f45-3f098923054f";
  const webhookCreateBooking = "https://primary-production-33e8.up.railway.app/webhook/20eb2a0b-10c6-44ca-9269-3e0597d40216";
  const calendarId = "ricardo.huiscaleo@gmail.com";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Sistema de Reservas Inteligente", "data-astro-cid-moxuw64m": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" data-astro-cid-moxuw64m> <!-- Hero Section del Sistema de Reservas --> <div class="hero-section" data-astro-cid-moxuw64m> <div class="container mx-auto px-4 py-12" data-astro-cid-moxuw64m> <div class="text-center max-w-4xl mx-auto" data-astro-cid-moxuw64m> <h1 class="hero-title" data-astro-cid-moxuw64m>🤖 Sistema de Reservas Inteligente</h1> <p class="hero-subtitle" data-astro-cid-moxuw64m>
Powered by IA y automatización n8n para una experiencia de reserva perfecta
</p> </div> </div> </div> <!-- Contenedor principal del calendario con ancho completo --> <div class="calendar-section" data-astro-cid-moxuw64m> <div class="container mx-auto px-4" data-astro-cid-moxuw64m> ${renderComponent($$result2, "BookingCalendarWrapper", $$BookingCalendarWrapper, { "calendarId": calendarId, "title": "Asesor\xEDa Personalizada en Soluciones IA", "description": "Agenda tu consultor\xEDa sobre implementaci\xF3n de sistemas RAG, automatizaci\xF3n y soluciones de inteligencia artificial", "accentColor": "#3B82F6", "workingHoursStart": 9, "workingHoursEnd": 23, "slotDuration": 60, "apiEndpoint": "/api/calendar", "data-astro-cid-moxuw64m": true })} </div> </div> <!-- Sección de información técnica simplificada --> <div class="tech-info-section" data-astro-cid-moxuw64m> <div class="container mx-auto px-4 py-12" data-astro-cid-moxuw64m> <div class="max-w-4xl mx-auto" data-astro-cid-moxuw64m> <div class="tech-card" data-astro-cid-moxuw64m> <h2 class="tech-title" data-astro-cid-moxuw64m>⚡ Integración Avanzada con n8n</h2> <div class="tech-grid" data-astro-cid-moxuw64m> <div class="tech-item" data-astro-cid-moxuw64m> <div class="tech-icon" data-astro-cid-moxuw64m>🔗</div> <h3 data-astro-cid-moxuw64m>Webhooks Inteligentes</h3> <p data-astro-cid-moxuw64m>Comunicación directa con Google Calendar sin exponer API keys</p> </div> <div class="tech-item" data-astro-cid-moxuw64m> <div class="tech-icon" data-astro-cid-moxuw64m>🛡️</div> <h3 data-astro-cid-moxuw64m>Seguridad Avanzada</h3> <p data-astro-cid-moxuw64m>Autenticación centralizada y datos protegidos end-to-end</p> </div> <div class="tech-item" data-astro-cid-moxuw64m> <div class="tech-icon" data-astro-cid-moxuw64m>⚙️</div> <h3 data-astro-cid-moxuw64m>Automatización Total</h3> <p data-astro-cid-moxuw64m>Flujos personalizables para notificaciones y validaciones</p> </div> </div> <!-- Información de endpoints colapsible --> <details class="endpoints-details" data-astro-cid-moxuw64m> <summary class="endpoints-summary" data-astro-cid-moxuw64m> 📋 Configuración de Endpoints </summary> <div class="endpoints-content" data-astro-cid-moxuw64m> <div class="endpoint-item" data-astro-cid-moxuw64m> <span class="endpoint-label" data-astro-cid-moxuw64m>Obtener eventos:</span> <code class="endpoint-code" data-astro-cid-moxuw64m>${webhookGetEvents}</code> </div> <div class="endpoint-item" data-astro-cid-moxuw64m> <span class="endpoint-label" data-astro-cid-moxuw64m>Crear reservas:</span> <code class="endpoint-code" data-astro-cid-moxuw64m>${webhookCreateBooking}</code> </div> <div class="endpoint-item" data-astro-cid-moxuw64m> <span class="endpoint-label" data-astro-cid-moxuw64m>Calendar ID:</span> <code class="endpoint-code" data-astro-cid-moxuw64m>${calendarId}</code> </div> </div> </details> </div> </div> </div> </div> </main> ` })} `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/prueba-calendario.astro", void 0);

const $$file = "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/prueba-calendario.astro";
const $$url = "/prueba-calendario";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PruebaCalendario,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
