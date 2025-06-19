/* empty css                                    */
import { c as createComponent, a as createAstro, m as maybeRenderHead, f as addAttribute, b as renderScript, e as renderComponent, d as renderTemplate, am as defineScriptVars, w as unescapeHTML, an as Fragment$1 } from '../chunks/astro/server_DIQx5c7g.mjs';
import 'kleur/colors';
import { a as $$TimelineChartsWrapper, $ as $$Layout } from '../chunks/TimelineChartsWrapper_IoX7Jbsz.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRef, useState, useEffect, useCallback } from 'react';
/* empty css                                 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
export { renderers } from '../renderers.mjs';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  fullHeight = true,
  mouseActivatedOnDesktop = true,
  sectionId = "default-aurora",
  // ID por defecto
  ...props
}) => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0);
  const animationSpeedRef = useRef(0);
  const animationFrameRef = useRef(null);
  const instanceIdRef = useRef(
    sectionId ? `aurora-${sectionId}` : `aurora-default-aurora-${Math.random().toString(36).substr(2, 9)}`
  );
  useEffect(() => {
    if (!window._AuroraInstances) {
      window._AuroraInstances = {};
    }
    if (!window._activeAuroras) {
      window._activeAuroras = /* @__PURE__ */ new Set();
    }
    window._AuroraInstances[instanceIdRef.current] = {
      setActive: (active) => {
        if (active) {
          setIsInView(true);
          setScrollProgress(1);
          window._activeAuroras?.add(instanceIdRef.current);
        } else {
          setIsInView(false);
          setScrollProgress(0);
          window._activeAuroras?.delete(instanceIdRef.current);
        }
      },
      sectionId
    };
    return () => {
      if (window._AuroraInstances && instanceIdRef.current) {
        delete window._AuroraInstances[instanceIdRef.current];
        window._activeAuroras?.delete(instanceIdRef.current);
      }
    };
  }, [sectionId]);
  useEffect(() => {
    const checkIsDesktop = () => {
      const minDesktopWidth = 1024;
      return window.innerWidth >= minDesktopWidth;
    };
    setIsDesktop(checkIsDesktop());
    const handleResize = () => {
      setIsDesktop(checkIsDesktop());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setScrollProgress(entry.intersectionRatio);
          window._activeAuroras?.add(instanceIdRef.current);
          if (containerRef.current) {
            containerRef.current.classList.add("aurora-active");
          }
        } else {
          setScrollProgress((prev) => Math.max(0, prev - 0.1));
          if (entry.intersectionRatio === 0) {
            setIsInView(false);
            window._activeAuroras?.delete(instanceIdRef.current);
            if (containerRef.current) {
              containerRef.current.classList.remove("aurora-active");
            }
          }
        }
      });
    }, options);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  const handleMouseEnter = (e) => {
    setIsHovered(true);
  };
  const handleMouseLeave = (e) => {
    setIsHovered(false);
  };
  useEffect(() => {
    if (!isDesktop || !mouseActivatedOnDesktop || !containerRef.current) return;
    const checkMousePosition = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (isInside !== isHovered) {
        setIsHovered(isInside);
      }
    };
    window.addEventListener("mousemove", checkMousePosition);
    return () => window.removeEventListener("mousemove", checkMousePosition);
  }, [isDesktop, mouseActivatedOnDesktop, isHovered]);
  useEffect(() => {
    if (!containerRef.current) return;
    const auroraElement = containerRef.current.querySelector(".aurora-element");
    if (!auroraElement) return;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    let lastTimestamp = 0;
    const targetSpeed = isInView && (!isDesktop || mouseActivatedOnDesktop && isHovered) ? 1 : 0;
    const animateSpeed = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      if (deltaTime >= 16) {
        lastTimestamp = timestamp;
        const speedStep = targetSpeed > animationSpeedRef.current ? Math.min(4e-3 * deltaTime, 1) : Math.min(2e-3 * deltaTime, 1);
        if (Math.abs(targetSpeed - animationSpeedRef.current) < 0.01) {
          animationSpeedRef.current = targetSpeed;
        } else if (targetSpeed > animationSpeedRef.current) {
          animationSpeedRef.current += speedStep;
        } else {
          animationSpeedRef.current -= speedStep;
        }
        setAnimationSpeed(animationSpeedRef.current);
        if (animationSpeedRef.current <= 0.01) {
          auroraElement.style.animationPlayState = "paused";
        } else {
          const baseDuration = isDesktop ? 5 : 90;
          const slowdownFactor = 4;
          const currentDuration = baseDuration + (1 - animationSpeedRef.current) * baseDuration * slowdownFactor;
          auroraElement.style.animationDuration = `${currentDuration}s`;
          auroraElement.style.animationPlayState = "running";
        }
      }
      if (animationSpeedRef.current !== targetSpeed || Math.abs(targetSpeed - animationSpeedRef.current) >= 0.01) {
        animationFrameRef.current = requestAnimationFrame(animateSpeed);
      } else {
        animationFrameRef.current = null;
      }
    };
    animationFrameRef.current = requestAnimationFrame(animateSpeed);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [scrollProgress, isInView, isDesktop, isHovered, mouseActivatedOnDesktop]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: cn(
        "transition-bg relative flex flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900",
        fullHeight ? "h-[100vh]" : "",
        className,
        // Agregar clase para asegurar que capture eventos de mouse
        "pointer-events-auto",
        // Añadir data-attribute para el sistema centralizado
        `aurora-container`
      ),
      "data-section-id": sectionId,
      "data-aurora-id": instanceIdRef.current,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      style: { pointerEvents: "auto" },
      ...props,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 overflow-hidden",
            style: {
              "--aurora": "repeating-linear-gradient(100deg,#3b82f6_10%,#a5b4fc_15%,#93c5fd_20%,#ddd6fe_25%,#60a5fa_30%)",
              "--dark-gradient": "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
              "--white-gradient": "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",
              "--blue-300": "#93c5fd",
              "--blue-400": "#60a5fa",
              "--blue-500": "#3b82f6",
              "--indigo-300": "#a5b4fc",
              "--violet-200": "#ddd6fe",
              "--black": "#000",
              "--white": "#fff",
              "--transparent": "transparent",
              "--opacity": isInView ? Math.min(0.5, scrollProgress * 0.5) : 0
            },
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  `aurora-element after:animate-aurora pointer-events-none absolute -inset-[10px] 
            [background-image:var(--white-gradient),var(--aurora)] 
            [background-size:300%,_200%] 
            [background-position:50%_50%,50%_50%] 
            blur-[10px] 
            invert 
            filter 
            will-change-transform 
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] 
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] 
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,transparent_10%,transparent_12%,var(--white)_16%)] 
            after:absolute 
            after:inset-0 
            after:[background-image:var(--white-gradient),var(--aurora)] 
            after:[background-size:200%,_100%] 
            after:[background-attachment:fixed] 
            after:mix-blend-difference 
            after:content-[""] 
            dark:[background-image:var(--dark-gradient),var(--aurora)] 
            dark:invert-0 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
                  showRadialGradient && `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
                ),
                style: {
                  opacity: `var(--opacity)`,
                  transition: "opacity 0.5s ease-in-out"
                }
              }
            )
          }
        ),
        children
      ]
    }
  );
};

const $$Astro$g = createAstro();
const $$NavCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$NavCard;
  const { sectionId, number, title, bgColor, hoverColor } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`nav-item-container ${bgColor}`, "class")}${addAttribute(sectionId, "data-section")}${addAttribute(sectionId === "rag" ? "position: relative; overflow: hidden;" : "", "style")} data-astro-cid-sxy7ltrq> ${sectionId === "rag" && renderTemplate`<div class="aurora-wrapper absolute inset-0 z-0" data-astro-cid-sxy7ltrq> ${renderComponent($$result, "AuroraBackground", AuroraBackground, { "className": "w-full h-full", "showRadialGradient": false, "fullHeight": false, "mouseActivatedOnDesktop": true, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ui/aurora-background", "client:component-export": "AuroraBackground", "data-astro-cid-sxy7ltrq": true }, { "default": ($$result2) => renderTemplate` <div data-astro-cid-sxy7ltrq></div> ` })} </div>`} <div class="nav-content" data-astro-cid-sxy7ltrq> <span class="nav-number" data-astro-cid-sxy7ltrq>${number}</span> <div class="nav-link-container" data-astro-cid-sxy7ltrq> <a${addAttribute(`#${sectionId}`, "href")} class="nav-link" data-astro-cid-sxy7ltrq>${title}</a> ${sectionId === "rag" && renderTemplate`<img src="/compressed/logo-oscuro-optimizado.png" alt="Logo AR" class="nav-logo opacity-70 ml-2" data-astro-cid-sxy7ltrq>`} </div> </div> <div class="progress-indicator" data-astro-cid-sxy7ltrq></div> </div>  ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ui/nav-card.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ui/nav-card.astro", void 0);

const $$TextPressureWrapper = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="text-pressure-container" data-astro-cid-kqcrl3w4> ${renderComponent($$result, "TextPressureComponent", null, { "client:only": "solid", "text": "Agente RAG", "flex": true, "alpha": false, "stroke": true, "width": true, "weight": true, "italic": true, "textColor": "#FFFFFF", "strokeColor": "#333333", "strokeWidth": 1, "minFontSize": 60, "id": "textPressureComponent", "client:component-hydration": "only", "data-astro-cid-kqcrl3w4": true, "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/text/TextPressure", "client:component-export": "default" })} </div>  ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/text/TextPressureWrapper.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/text/TextPressureWrapper.astro", void 0);

const $$Astro$f = createAstro();
const $$AstroP5Container = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$AstroP5Container;
  const containerClass = Astro2.props.class || "";
  const containerStyle = Astro2.props.style || {};
  const fullWidth = Astro2.props.fullWidth || false;
  const fullHeight = Astro2.props.fullHeight || false;
  const isFixed = Astro2.props.isFixed || false;
  const sectionId = Astro2.props.sectionId || "";
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`p5-astro-wrapper ${containerClass} ${isFixed ? "fixed-p5-container" : ""}`, "class")}${addAttribute({
    ...containerStyle
  }, "style")}${addAttribute(sectionId, "data-section-id")} data-astro-cid-3e7aejtt>  ${renderComponent($$result, "P5CursorSketch", null, { "client:only": "react", "width": fullWidth ? "100%" : "100%", "height": fullHeight ? "100%" : "100%", "isFixed": isFixed, "sectionId": sectionId, "client:component-hydration": "only", "data-astro-cid-3e7aejtt": true, "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/P5CursorSketch", "client:component-export": "default" })} <!-- El indicador visual de depuración ha sido eliminado --> </div> `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/AstroP5Container.astro", void 0);

function CursorOptimizer({ showMarkers = false }) {
  const initialized = useRef(false);
  const logThrottle = useRef({});
  const smartLog = (key, message, type = "log", throttleMs = 5e3) => {
    if (!showMarkers) return;
    const now = Date.now();
    if (!logThrottle.current[key] || now - logThrottle.current[key] > throttleMs) {
      console[type](`[CursorOptimizer] ${message}`);
      logThrottle.current[key] = now;
    }
  };
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const setupCursorOptimization = async () => {
      gsap.registerPlugin(ScrollTrigger);
      if (showMarkers) {
        const markerStyle = document.createElement("style");
        markerStyle.textContent = `
          .gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end {
            font-size: 10px !important;
            padding: 2px 5px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 120px !important;
            z-index: 999999 !important;
          }
          /* Colores más diferenciados para distinguir mejor */
          .gsap-marker-start { background-color: #4CAF50 !important; }
          .gsap-marker-end { background-color: #F44336 !important; }
          .gsap-marker-scroller-start { background-color: #2196F3 !important; }
          .gsap-marker-scroller-end { background-color: #FF9800 !important; }
          
          /* Eliminar texto de depuración */
          .section-debug-label {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(markerStyle);
      } else {
        const cleanupStyle = document.createElement("style");
        cleanupStyle.textContent = `
          /* Eliminar texto de depuración en entorno de producción */
          .gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end,
          .section-debug-label, .debug-section-overlay, [data-section-label] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(cleanupStyle);
      }
      setTimeout(() => {
        const part1Sections = document.querySelectorAll('[id$="-part1"]');
        if (!window._P5CursorInstances) {
          window._P5CursorInstances = {};
          smartLog("init", "Inicializando contexto global de cursores");
          return;
        }
        smartLog("setup", `Configurando optimización para ${part1Sections.length} secciones`);
        document.querySelectorAll(".section-debug-label, .debug-section-overlay, [data-section-label]").forEach((el) => el.remove());
        part1Sections.forEach((section) => {
          const sectionId = section.id;
          const baseSectionId = sectionId.split("-")[0];
          ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            // Comenzar cuando el top de la sección esté al 80% del viewport desde arriba
            end: "bottom 20%",
            // Terminar cuando el bottom de la sección esté al 20% del viewport desde abajo
            markers: showMarkers,
            // Mostrar marcadores visuales solo en debugging
            id: `cursor-${baseSectionId}`,
            // ID más corto para que no se vea tan largo en los marcadores
            toggleClass: { targets: section, className: "cursor-active" },
            // Agregar clase para debugging visual
            onEnter: () => {
              smartLog(`enter-${baseSectionId}`, `Activando cursor para ${sectionId}`, "log", 3e3);
              activateCursor(sectionId, true);
            },
            onLeave: () => {
              smartLog(`leave-${baseSectionId}`, `Desactivando cursor para ${sectionId}`, "log", 3e3);
              activateCursor(sectionId, false);
            },
            onEnterBack: () => {
              smartLog(`enterback-${baseSectionId}`, `Reactivando cursor para ${sectionId}`, "log", 3e3);
              activateCursor(sectionId, true);
            },
            onLeaveBack: () => {
              smartLog(`leaveback-${baseSectionId}`, `Desactivando cursor para ${sectionId}`, "log", 3e3);
              activateCursor(sectionId, false);
            }
          });
        });
        optimizeActiveSectionCursor();
      }, 1500);
    };
    const activateCursor = (sectionId, isActive) => {
      const baseSectionId = sectionId.split("-")[0];
      if (!window._P5CursorInstances || Object.keys(window._P5CursorInstances).length === 0) {
        smartLog("error-no-instances", "No hay instancias de cursores disponibles", "warn", 1e4);
        return false;
      }
      const p5Container = document.querySelector(`[data-section-id="${sectionId}"]`) || document.querySelector(`[data-section-id="${baseSectionId}"]`);
      if (p5Container) {
        const reactId = p5Container.getAttribute("data-react-id");
        if (reactId && window._P5CursorInstances[reactId]) {
          try {
            window._P5CursorInstances[reactId].setActive(isActive);
            if (showMarkers) {
              if (isActive) {
                p5Container.style.outline = "2px solid rgba(0, 255, 0, 0.3)";
              } else {
                p5Container.style.outline = "none";
              }
            }
            smartLog(`success-${baseSectionId}`, `✅ Cursor ${isActive ? "activado" : "desactivado"} correctamente`, "log", 5e3);
            return true;
          } catch (err) {
            smartLog("error-setactive", `Error al cambiar estado del cursor: ${err.message}`, "error", 1e4);
          }
        }
      }
      let found = false;
      for (const id in window._P5CursorInstances) {
        const instance = window._P5CursorInstances[id];
        if (instance && typeof instance.setActive === "function") {
          const instanceSection = instance.sectionId || "";
          if (instanceSection === sectionId || instanceSection === baseSectionId || instanceSection.includes(baseSectionId) || baseSectionId.includes(instanceSection)) {
            try {
              instance.setActive(isActive);
              if (showMarkers) {
                const containerId = `p5-container-${instanceSection}`;
                const container = document.getElementById(containerId) || document.querySelector(`[data-section-id="${instanceSection}"]`);
                if (container) {
                  if (isActive) {
                    container.style.outline = "2px solid rgba(0, 255, 0, 0.3)";
                  } else {
                    container.style.outline = "none";
                  }
                }
              }
              found = true;
            } catch (err) {
              smartLog("error-instance", `Error en instancia ${id}: ${err.message}`, "error", 1e4);
            }
          }
        }
      }
      if (!found) {
        if (baseSectionId === "hola" || sectionId === "hola-part1") {
          for (const id in window._P5CursorInstances) {
            try {
              window._P5CursorInstances[id].setActive(isActive);
              found = true;
            } catch (err) {
              smartLog("error-fallback", `Error en fallback: ${err.message}`, "error", 1e4);
            }
          }
        }
      }
      if (!found) {
        smartLog(`notfound-${baseSectionId}`, `⚠️ No se encontró cursor para ${sectionId}`, "warn", 8e3);
      }
      return found;
    };
    const optimizeActiveSectionCursor = () => {
      document.addEventListener("navCardStateChanged", (event) => {
        smartLog("nav-change", `Navegación cambió a sección: ${event.detail?.sectionId}`, "log", 2e3);
        if (window._P5CursorInstances) {
          Object.keys(window._P5CursorInstances).forEach((id) => {
            const instance = window._P5CursorInstances[id];
            if (instance && typeof instance.setActive === "function") {
              instance.setActive(false);
            }
          });
        }
        if (event.detail && event.detail.sectionId) {
          const targetSectionId = `${event.detail.sectionId}-part1`;
          activateCursor(targetSectionId, true);
        }
      });
    };
    setupCursorOptimization();
    return () => {
      ScrollTrigger.getAll().filter((trigger) => trigger.id && trigger.id.startsWith("cursor-")).forEach((trigger) => trigger.kill());
    };
  }, [showMarkers]);
  return null;
}

const $$Astro$e = createAstro();
const $$CursorOptimizerWrapper = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$CursorOptimizerWrapper;
  const { showMarkers = true } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "CursorOptimizer", CursorOptimizer, { "client:load": true, "showMarkers": showMarkers, "client:component-hydration": "load", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/animations/CursorOptimizer", "client:component-export": "default" })}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/animations/CursorOptimizerWrapper.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$d = createAstro();
const $$ChladniBackgroundOptimized = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$ChladniBackgroundOptimized;
  const {
    particleCount = 150,
    // Mucho más reducido para mejor rendimiento
    opacity = 0.3,
    speed = 0.5,
    colors = ["#7c3aed", "#a855f7", "#c084fc", "#e879f9"]
    // Colores morados para contacto
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(["", '<div id="chladni-background" class="chladni-background-container" data-astro-cid-tfodn2y2> <canvas id="chladni-canvas" class="chladni-canvas" data-astro-cid-tfodn2y2></canvas> </div>  <script type="module">', "\n  // Implementaci\xF3n pura de JavaScript sin dependencias externas\n  document.addEventListener('DOMContentLoaded', () => {\n    const container = document.getElementById('chladni-background');\n    const canvas = document.getElementById('chladni-canvas');\n\n    if (!container || !canvas) {\n      console.warn('ChladniBackground: Elementos no encontrados');\n      return;\n    }\n\n    const ctx = canvas.getContext('2d');\n    if (!ctx) {\n      console.warn('ChladniBackground: No se pudo obtener contexto 2D');\n      return;\n    }\n\n    console.log('ChladniBackground: Inicializando efecto sin Three.js');\n\n    // Configuraci\xF3n del canvas\n    function resizeCanvas() {\n      canvas.width = window.innerWidth;\n      canvas.height = window.innerHeight;\n    }\n    resizeCanvas();\n\n    // Sistema de part\xEDculas simple\n    class Particle {\n      constructor() {\n        this.reset();\n        this.phase = Math.random() * Math.PI * 2;\n        this.baseSpeed = 0.5 + Math.random() * 1.5;\n      }\n\n      reset() {\n        this.x = Math.random() * canvas.width;\n        this.y = Math.random() * canvas.height;\n        this.vx = 0;\n        this.vy = 0;\n        this.life = 1;\n        this.maxLife = 200 + Math.random() * 300;\n        this.currentLife = 0;\n      }\n\n      update(time) {\n        // Patr\xF3n de Chladni simplificado\n        const normalizedX = (this.x / canvas.width - 0.5) * 4;\n        const normalizedY = (this.y / canvas.height - 0.5) * 4;\n\n        const frequency1 = 3.2 + Math.sin(time * 0.001) * 0.5;\n        const frequency2 = 2.8 + Math.cos(time * 0.0015) * 0.3;\n\n        const pattern1 = Math.sin(frequency1 * normalizedX) * Math.sin(frequency2 * normalizedY);\n        const pattern2 = Math.sin(frequency2 * normalizedX) * Math.sin(frequency1 * normalizedY);\n        const force = (pattern1 + pattern2 * 0.5) * 0.02;\n\n        // Aplicar fuerzas\n        this.vx += force * Math.cos(this.phase + time * 0.001);\n        this.vy += force * Math.sin(this.phase + time * 0.0008);\n\n        // Damping\n        this.vx *= 0.98;\n        this.vy *= 0.98;\n\n        // Actualizar posici\xF3n\n        this.x += this.vx * this.baseSpeed * speed;\n        this.y += this.vy * this.baseSpeed * speed;\n\n        // Bounds wrapping\n        if (this.x < 0) this.x = canvas.width;\n        if (this.x > canvas.width) this.x = 0;\n        if (this.y < 0) this.y = canvas.height;\n        if (this.y > canvas.height) this.y = 0;\n\n        // Vida de la part\xEDcula\n        this.currentLife++;\n        this.life = Math.max(0, 1 - this.currentLife / this.maxLife);\n\n        if (this.currentLife >= this.maxLife) {\n          this.reset();\n        }\n      }\n\n      draw(ctx, colorIndex, time) {\n        const size = 1 + Math.sin(time * 0.002 + this.phase) * 0.5;\n        const alpha = this.life * opacity;\n\n        ctx.save();\n        ctx.globalAlpha = alpha;\n        ctx.fillStyle = colors[colorIndex % colors.length];\n        ctx.beginPath();\n        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);\n        ctx.fill();\n        ctx.restore();\n      }\n    }\n\n    // Crear part\xEDculas\n    const particles = [];\n    for (let i = 0; i < particleCount; i++) {\n      particles.push(new Particle());\n    }\n\n    // Variables de control\n    let isVisible = false;\n    let animationId = null;\n    let startTime = Date.now();\n\n    // Funci\xF3n de animaci\xF3n\n    function animate() {\n      if (!isVisible) {\n        animationId = requestAnimationFrame(animate);\n        return;\n      }\n\n      const currentTime = Date.now() - startTime;\n\n      // Limpiar canvas con fondo semitransparente para trailing effect\n      ctx.fillStyle = `rgba(0, 0, 0, 0.02)`;\n      ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n      // Actualizar y dibujar part\xEDculas\n      particles.forEach((particle, index) => {\n        particle.update(currentTime);\n        const colorIndex = Math.floor(currentTime * 0.0001 + index * 0.1);\n        particle.draw(ctx, colorIndex, currentTime);\n      });\n\n      animationId = requestAnimationFrame(animate);\n    }\n\n    // Detecci\xF3n de visibilidad de la secci\xF3n contacto-part3\n    const targetSection = document.getElementById('contacto-part3');\n    if (targetSection) {\n      const sectionObserver = new IntersectionObserver(\n        (entries) => {\n          entries.forEach((entry) => {\n            if (entry.isIntersecting) {\n              console.log('ChladniBackground: Activando en contacto-part3');\n              container.style.opacity = '1';\n              isVisible = true;\n              if (!animationId) {\n                animate();\n              }\n            } else {\n              console.log('ChladniBackground: Desactivando');\n              container.style.opacity = '0';\n              isVisible = false;\n            }\n          });\n        },\n        { threshold: 0.1 }\n      );\n\n      sectionObserver.observe(targetSection);\n    } else {\n      console.warn('ChladniBackground: Secci\xF3n contacto-part3 no encontrada');\n    }\n\n    // Manejo de redimensionamiento\n    let resizeTimeout;\n    window.addEventListener('resize', () => {\n      clearTimeout(resizeTimeout);\n      resizeTimeout = setTimeout(() => {\n        resizeCanvas();\n        // Reposicionar part\xEDculas aleatoriamente al redimensionar\n        particles.forEach((particle) => particle.reset());\n      }, 100);\n    });\n\n    // Optimizaci\xF3n de visibilidad de p\xE1gina\n    document.addEventListener('visibilitychange', () => {\n      if (document.hidden) {\n        isVisible = false;\n      }\n    });\n\n    // Iniciar la animaci\xF3n\n    animate();\n\n    console.log('ChladniBackground: Efecto iniciado con', particleCount, 'part\xEDculas');\n  });\n<\/script>"], ["", '<div id="chladni-background" class="chladni-background-container" data-astro-cid-tfodn2y2> <canvas id="chladni-canvas" class="chladni-canvas" data-astro-cid-tfodn2y2></canvas> </div>  <script type="module">', "\n  // Implementaci\xF3n pura de JavaScript sin dependencias externas\n  document.addEventListener('DOMContentLoaded', () => {\n    const container = document.getElementById('chladni-background');\n    const canvas = document.getElementById('chladni-canvas');\n\n    if (!container || !canvas) {\n      console.warn('ChladniBackground: Elementos no encontrados');\n      return;\n    }\n\n    const ctx = canvas.getContext('2d');\n    if (!ctx) {\n      console.warn('ChladniBackground: No se pudo obtener contexto 2D');\n      return;\n    }\n\n    console.log('ChladniBackground: Inicializando efecto sin Three.js');\n\n    // Configuraci\xF3n del canvas\n    function resizeCanvas() {\n      canvas.width = window.innerWidth;\n      canvas.height = window.innerHeight;\n    }\n    resizeCanvas();\n\n    // Sistema de part\xEDculas simple\n    class Particle {\n      constructor() {\n        this.reset();\n        this.phase = Math.random() * Math.PI * 2;\n        this.baseSpeed = 0.5 + Math.random() * 1.5;\n      }\n\n      reset() {\n        this.x = Math.random() * canvas.width;\n        this.y = Math.random() * canvas.height;\n        this.vx = 0;\n        this.vy = 0;\n        this.life = 1;\n        this.maxLife = 200 + Math.random() * 300;\n        this.currentLife = 0;\n      }\n\n      update(time) {\n        // Patr\xF3n de Chladni simplificado\n        const normalizedX = (this.x / canvas.width - 0.5) * 4;\n        const normalizedY = (this.y / canvas.height - 0.5) * 4;\n\n        const frequency1 = 3.2 + Math.sin(time * 0.001) * 0.5;\n        const frequency2 = 2.8 + Math.cos(time * 0.0015) * 0.3;\n\n        const pattern1 = Math.sin(frequency1 * normalizedX) * Math.sin(frequency2 * normalizedY);\n        const pattern2 = Math.sin(frequency2 * normalizedX) * Math.sin(frequency1 * normalizedY);\n        const force = (pattern1 + pattern2 * 0.5) * 0.02;\n\n        // Aplicar fuerzas\n        this.vx += force * Math.cos(this.phase + time * 0.001);\n        this.vy += force * Math.sin(this.phase + time * 0.0008);\n\n        // Damping\n        this.vx *= 0.98;\n        this.vy *= 0.98;\n\n        // Actualizar posici\xF3n\n        this.x += this.vx * this.baseSpeed * speed;\n        this.y += this.vy * this.baseSpeed * speed;\n\n        // Bounds wrapping\n        if (this.x < 0) this.x = canvas.width;\n        if (this.x > canvas.width) this.x = 0;\n        if (this.y < 0) this.y = canvas.height;\n        if (this.y > canvas.height) this.y = 0;\n\n        // Vida de la part\xEDcula\n        this.currentLife++;\n        this.life = Math.max(0, 1 - this.currentLife / this.maxLife);\n\n        if (this.currentLife >= this.maxLife) {\n          this.reset();\n        }\n      }\n\n      draw(ctx, colorIndex, time) {\n        const size = 1 + Math.sin(time * 0.002 + this.phase) * 0.5;\n        const alpha = this.life * opacity;\n\n        ctx.save();\n        ctx.globalAlpha = alpha;\n        ctx.fillStyle = colors[colorIndex % colors.length];\n        ctx.beginPath();\n        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);\n        ctx.fill();\n        ctx.restore();\n      }\n    }\n\n    // Crear part\xEDculas\n    const particles = [];\n    for (let i = 0; i < particleCount; i++) {\n      particles.push(new Particle());\n    }\n\n    // Variables de control\n    let isVisible = false;\n    let animationId = null;\n    let startTime = Date.now();\n\n    // Funci\xF3n de animaci\xF3n\n    function animate() {\n      if (!isVisible) {\n        animationId = requestAnimationFrame(animate);\n        return;\n      }\n\n      const currentTime = Date.now() - startTime;\n\n      // Limpiar canvas con fondo semitransparente para trailing effect\n      ctx.fillStyle = \\`rgba(0, 0, 0, 0.02)\\`;\n      ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n      // Actualizar y dibujar part\xEDculas\n      particles.forEach((particle, index) => {\n        particle.update(currentTime);\n        const colorIndex = Math.floor(currentTime * 0.0001 + index * 0.1);\n        particle.draw(ctx, colorIndex, currentTime);\n      });\n\n      animationId = requestAnimationFrame(animate);\n    }\n\n    // Detecci\xF3n de visibilidad de la secci\xF3n contacto-part3\n    const targetSection = document.getElementById('contacto-part3');\n    if (targetSection) {\n      const sectionObserver = new IntersectionObserver(\n        (entries) => {\n          entries.forEach((entry) => {\n            if (entry.isIntersecting) {\n              console.log('ChladniBackground: Activando en contacto-part3');\n              container.style.opacity = '1';\n              isVisible = true;\n              if (!animationId) {\n                animate();\n              }\n            } else {\n              console.log('ChladniBackground: Desactivando');\n              container.style.opacity = '0';\n              isVisible = false;\n            }\n          });\n        },\n        { threshold: 0.1 }\n      );\n\n      sectionObserver.observe(targetSection);\n    } else {\n      console.warn('ChladniBackground: Secci\xF3n contacto-part3 no encontrada');\n    }\n\n    // Manejo de redimensionamiento\n    let resizeTimeout;\n    window.addEventListener('resize', () => {\n      clearTimeout(resizeTimeout);\n      resizeTimeout = setTimeout(() => {\n        resizeCanvas();\n        // Reposicionar part\xEDculas aleatoriamente al redimensionar\n        particles.forEach((particle) => particle.reset());\n      }, 100);\n    });\n\n    // Optimizaci\xF3n de visibilidad de p\xE1gina\n    document.addEventListener('visibilitychange', () => {\n      if (document.hidden) {\n        isVisible = false;\n      }\n    });\n\n    // Iniciar la animaci\xF3n\n    animate();\n\n    console.log('ChladniBackground: Efecto iniciado con', particleCount, 'part\xEDculas');\n  });\n<\/script>"])), maybeRenderHead(), defineScriptVars({ particleCount, opacity, speed, colors }));
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/particles/ChladniBackgroundOptimized.astro", void 0);

function TextParallaxEffect({ sectionId = "hola-part2" }) {
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    const setupParallaxEffects = async () => {
      gsap.registerPlugin(ScrollTrigger);
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (!section) {
          console.error(`La sección con ID ${sectionId} no fue encontrada`);
          return;
        }
        const somosText = document.getElementById("somos-text");
        const agenteText = document.getElementById("agente-text");
        const ragText = document.getElementById("rag-text");
        const descriptionBox = agenteText?.closest(".grid-row")?.querySelector(".description-box");
        const isMobile = window.innerWidth < 768;
        console.log("TextParallaxEffect - Elementos:", {
          section: !!section,
          somosText: !!somosText,
          agenteText: !!agenteText,
          ragText: !!ragText,
          descriptionBox: !!descriptionBox,
          isMobile
        });
        if (somosText && agenteText && ragText) {
          gsap.set(somosText, { opacity: 1, x: 0 });
          gsap.set(agenteText, { opacity: 1, x: 0 });
          gsap.set(ragText, { opacity: 1, x: 0 });
          let agenteMaxOffset = 120;
          if (!isMobile && descriptionBox) {
            const agenteRect = agenteText.getBoundingClientRect();
            const descRect = descriptionBox.getBoundingClientRect();
            const availableSpace = Math.max(20, descRect.left - agenteRect.right - 30);
            agenteMaxOffset = Math.min(agenteMaxOffset, availableSpace);
            console.log("Limite de desplazamiento para AGENTE (escritorio):", agenteMaxOffset);
          } else {
            console.log("En móvil: usando desplazamiento completo para AGENTE");
          }
          ScrollTrigger.create({
            trigger: section,
            // Puntos de inicio y fin más amplios para un efecto más suave
            start: "top 90%",
            // Comienza cuando el tope de la sección está en el 90% de la ventana (casi entrando)
            end: "bottom 10%",
            // Termina cuando el fondo está en el 10% (casi saliendo)
            scrub: 1,
            // Valor de suavizado (1 = suave, 0 = inmediato)
            markers: false,
            // Desactivar marcadores para evitar confusión con los del optimizador de cursores
            id: "parallax-effect",
            // ID único para este ScrollTrigger
            onUpdate: (self) => {
              const progress = self.progress;
              const createControlledCurve = (progress2, threshold = 0.3) => {
                if (isMobile) {
                  return 1 - progress2 * 2;
                }
                if (progress2 <= threshold) {
                  return 1 - progress2 / threshold;
                } else {
                  return 0;
                }
              };
              const isEntering = progress < 0.5;
              if (isEntering) {
                const somosEntryEffect = 1 - progress * 2;
                const agenteEntryEffect = isMobile ? somosEntryEffect : createControlledCurve(progress);
                const ragEntryEffect = 1 - progress * 2;
                gsap.to(somosText, {
                  x: somosEntryEffect * 100,
                  opacity: 1 - somosEntryEffect * 0.5,
                  // No oscurecer completamente
                  duration: 0,
                  overwrite: "auto"
                });
                gsap.to(agenteText, {
                  // En móvil, usar el efecto completo; en escritorio, limitar
                  x: -agenteEntryEffect * (isMobile ? 120 : agenteMaxOffset),
                  opacity: 1 - agenteEntryEffect * (isMobile ? 0.5 : 0.3),
                  // Efecto completo en móvil
                  duration: 0,
                  overwrite: "auto"
                });
                gsap.to(ragText, {
                  x: ragEntryEffect * 150,
                  opacity: 1 - ragEntryEffect * 0.5,
                  duration: 0,
                  overwrite: "auto"
                });
              } else {
                const exitEffect = (progress - 0.5) * 2;
                gsap.to(somosText, {
                  x: exitEffect * -100,
                  opacity: 1 - exitEffect * 0.5,
                  duration: 0,
                  overwrite: "auto"
                });
                gsap.to(agenteText, {
                  // En móvil usar el efecto completo, en escritorio limitar
                  x: exitEffect * (isMobile ? 120 : Math.min(agenteMaxOffset, 40)),
                  opacity: 1 - exitEffect * (isMobile ? 0.5 : 0.3),
                  duration: 0,
                  overwrite: "auto"
                });
                gsap.to(ragText, {
                  x: exitEffect * -150,
                  opacity: 1 - exitEffect * 0.5,
                  duration: 0,
                  overwrite: "auto"
                });
              }
            }
          });
          console.log("TextParallaxEffect - Configuración completada (versión optimizada)");
          initialized.current = true;
        }
      }, 500);
    };
    setupParallaxEffects();
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
    };
  }, [sectionId]);
  return null;
}

const $$Astro$c = createAstro();
const $$TextParallaxEffectWrapper = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$TextParallaxEffectWrapper;
  const { sectionId = "hola-part2" } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "TextParallaxEffect", TextParallaxEffect, { "sectionId": sectionId, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/animations/TextParallaxEffect", "client:component-export": "default" })}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/animations/TextParallaxEffectWrapper.astro", void 0);

const $$Astro$b = createAstro();
const $$TypewriterTextWrapper = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$TypewriterTextWrapper;
  const {
    text,
    speed = 40,
    startDelay = 100,
    cursor = true,
    className = "",
    loop = false,
    loopDelay = 2e3,
    blinkCursor = true,
    deleteSpeed = 30,
    staticText = ""
  } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "TypewriterText", null, { "text": text, "speed": speed, "startDelay": startDelay, "cursor": cursor, "className": className, "loop": loop, "loopDelay": loopDelay, "blinkCursor": blinkCursor, "deleteSpeed": deleteSpeed, "staticText": staticText, "client:only": "react", "client:component-hydration": "only", "data-astro-cid-7mutgfzl": true, "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/text/TypewriterText", "client:component-export": "default" })} `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/text/TypewriterTextWrapper.astro", void 0);

const $$Astro$a = createAstro();
const $$HolaPart2Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$HolaPart2Content;
  const { section } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="grid-wrapper">  ${renderComponent($$result, "TextParallaxEffectWrapper", $$TextParallaxEffectWrapper, { "sectionId": "hola-part2" })}  <div class="grid-row relative z-10"> <div class="description-box"> <p></p> </div> <h3 id="somos-text" class="big-text text-gray-800">Somos</h3> </div>  <div class="separator relative z-10"></div>  <div class="grid-row relative z-10"> <h3 id="agente-text" class="big-text text-gray-700">Agente</h3> <div class="description-box"> <p class="hidden md:block" style="line-height: 1.6;">
Reducimos Costos. Asesoramos y Desarrollamos automatizaciones para,
${renderComponent($$result, "TypewriterTextWrapper", $$TypewriterTextWrapper, { "staticText": "", "text": [
    " abogados.",
    " cl\xEDnicas.",
    " terapias.",
    " constructoras.",
    " agencias.",
    " restaurantes.",
    " hoteles.",
    " PyMEs.",
    " agricultura.",
    " finanzas.",
    " comercio.",
    " educaci\xF3n.",
    " salud.",
    " turismo.",
    " log\xEDstica.",
    " manufactura.",
    " retail.",
    " tecnolog\xEDa.",
    " telecomunicaciones.",
    " transporte.",
    " servicios.",
    " distribuci\xF3n.",
    " consultor\xEDa.",
    " marketing.",
    " ventas.",
    " atenci\xF3n al cliente.",
    " e-commerce.",
    " startups.",
    " ONGs.",
    " gobierno.",
    " fundaciones."
  ], "speed": 50, "deleteSpeed": 30, "startDelay": 500, "cursor": true, "className": "typewriter-effect", "loop": true, "loopDelay": 2e3, "blinkCursor": true })} </p> </div> </div>  <div class="separator relative z-10"></div>  <div class="grid-row relative z-10"> <div class="description-box"> <p class="block md:hidden text-center w-full" style="line-height: 1.6;">
Reducimos costos.
<br>
Asesoramos y Desarrollamos.
<br>
Automatizaciones para,
${renderComponent($$result, "TypewriterTextWrapper", $$TypewriterTextWrapper, { "staticText": "", "text": [
    " abogados.",
    " cl\xEDnicas.",
    " terapias.",
    " constructoras.",
    " agencias.",
    " restaurantes.",
    " hoteles.",
    " PyMEs.",
    " agricultura.",
    " finanzas.",
    " comercio.",
    " educaci\xF3n.",
    " salud.",
    " turismo.",
    " log\xEDstica.",
    " manufactura.",
    " retail.",
    " tecnolog\xEDa.",
    " telecomunicaciones.",
    " transporte.",
    " servicios.",
    " distribuci\xF3n.",
    " consultor\xEDa.",
    " marketing.",
    " ventas.",
    " atenci\xF3n al cliente.",
    " e-commerce.",
    " startups.",
    " ONGs.",
    " gobierno.",
    " fundaciones.",
    " PYMEs."
  ], "speed": 50, "deleteSpeed": 30, "startDelay": 500, "cursor": true, "className": "typewriter-effect mobile-centered", "loop": true, "loopDelay": 2e3, "blinkCursor": true })} </p> </div> <h3 id="rag-text" class="big-text orange-text">RAG</h3> </div> </div>`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/HolaPart2Content.astro", void 0);

const $$ChatInterfaceDarkWrapper = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="chat-interface-dark-container" class="w-full"> <!-- El componente React se montará aquí --> </div> ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ChatInterfaceDarkWrapper.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ChatInterfaceDarkWrapper.astro", void 0);

const $$Astro$9 = createAstro();
const $$HolaPart3Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$HolaPart3Content;
  const { section } = Astro2.props;
  return renderTemplate`<!-- 
  3. AQUÍ VA TODO EL HTML.
  Hemos eliminado \`h-full\` de los contenedores para que la altura se ajuste al contenido.
--><!-- CAMBIO: Se ha eliminado 'h-full' de este div -->${maybeRenderHead()}<div class="section-inner w-full p-0 m-0 relative overflow-hidden"> <!-- CAMBIO: Se ha eliminado 'h-full' de este div --> <div id="hola-part3-timeline" class="w-full relative z-10" style="height: 100%; position: relative;"> <div class="timeline-wrapper"> <h2 class="text-white font-bold">Automatizamos los procesos digitales de tu empresa.</h2> <p class="text-white">
Te explicamos cómo, la <span class="animated-gradient-text" style="background-image: linear-gradient(45deg, #22ff6c 0%, #43ffba 25%, #65f0ff 50%, #43ffba 75%, #22ff6c 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline;">inteligencia artificial RAG</span> es el estándar <span class="low-cost-text">low-cost</span> que debes implementar en tus operaciones.
</p> </div> <div class="container mx-auto py-6 md:py-10 px-4"> <!-- Tarjeta destacada para el impacto económico --> <div class="bg-gradient-to-r from-amber-900/70 to-amber-700/50 rounded-xl p-5 md:p-6 shadow-xl border border-amber-500/50 mb-8 md:mb-10 backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300"> <div class="flex flex-col md:flex-row items-center gap-4"> <div class="bg-amber-500 rounded-full p-3 md:p-4 flex items-center justify-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-10 md:w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <div class="flex-1 text-center md:text-left"> <h2 class="text-2xl md:text-3xl font-bold mb-2 text-white">
Impacto Económico de Agentes IA RAG
</h2> <p class="text-base md:text-lg text-white font-bold">
Análisis comparativo de los costos operativos antes y después de implementar agentes
              IA RAG en una empresa con ventas de <span class="text-amber-300 font-bold">$10.000.000 CLP mensuales</span>.
</p> </div> </div> </div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16"> <!-- Gráfico 1: Comparación de costos operativos --> <div class="bg-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-amber-900/30"> <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-amber-400">
Comparación de Costos Operativos
</h2> <div id="cost-comparison-container" class="h-64 md:h-80 relative mb-4 md:mb-6"> <!-- El gráfico se inyectará aquí mediante React --> </div> <div class="grid grid-cols-2 gap-3 md:gap-4 text-center text-xs md:text-sm mt-4 md:mt-6"> <div class="bg-black/20 p-3 md:p-4 rounded-lg"> <span class="block text-xl md:text-2xl font-bold text-red-400">$3.600.000</span> <span class="text-white font-bold">Costos con Modelo Tradicional</span> </div> <div class="bg-black/20 p-3 md:p-4 rounded-lg"> <span class="block text-xl md:text-2xl font-bold text-green-400">$1.980.000</span> <span class="text-white font-bold">Costos con Agentes IA RAG</span> </div> </div> <div class="mt-4"> <p class="text-green-400 text-base md:text-lg font-bold text-center">
Ahorro mensual: $1.620.000 (45%)
</p> </div> </div> <!-- Gráfico 2: Distribución de costos antes y después --> <div class="bg-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-amber-900/30"> <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-amber-400">
Comparación de Distribución de Costos
</h2> <div id="pie-charts-container" class="h-[500px] md:h-[480px] lg:h-[440px] relative"> <!-- Los gráficos de pastel se inyectarán aquí mediante React --> </div> <div class="bg-black/20 p-3 md:p-4 rounded-lg text-xs md:text-sm mt-4 md:mt-6"> <p class="mb-2 text-white font-bold">
La implementación de agentes IA RAG reduce significativamente los costos de personal,
              atención al cliente y procesamiento de datos, manteniendo o mejorando la calidad del
              servicio.
</p> <ul class="list-disc list-inside space-y-1 text-white font-bold"> <li> <span class="text-amber-400">Personal:</span> Automatización de tareas repetitivas
</li> <li> <span class="text-amber-400">Atención al cliente:</span> Disponibilidad 24/7 sin costos
                extras
</li> <li> <span class="text-amber-400">Errores operativos:</span> Reducción del 85% en errores
                de procesamiento
</li> </ul> </div> </div> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16"> <!-- Gráfico 3: Retorno de inversión --> <div class="bg-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-amber-900/30"> <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-amber-400">
Retorno de Inversión
</h2> <div id="roi-chart-container" class="h-56 md:h-64 relative"> <!-- El gráfico ROI se inyectará aquí mediante React --> </div> <div class="mt-4 bg-black/20 p-3 md:p-4 rounded-lg text-xs md:text-sm"> <p class="text-white font-bold">
La inversión inicial en agentes IA RAG se recupera en promedio en <span class="text-amber-400 font-bold text-sm md:text-base">5 meses</span>, con beneficios crecientes a medida que el sistema se optimiza.
</p> </div> </div> <!-- Gráfico 4: Eficiencia operativa --> <div class="bg-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-amber-900/30"> <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-amber-400">
Eficiencia Operativa
</h2> <div id="efficiency-chart-container" class="h-56 md:h-64 relative"> <!-- El gráfico de eficiencia se inyectará aquí mediante React --> </div> <div class="mt-4 bg-black/20 p-3 md:p-4 rounded-lg text-xs md:text-sm"> <p class="text-white font-bold">
Los agentes IA RAG mejoran los tiempos de respuesta en un <span class="text-amber-400 font-bold text-sm md:text-base">75%</span> y aumentan la capacidad de procesamiento de consultas en un <span class="text-amber-400 font-bold text-sm md:text-base">300%</span>.
</p> </div> </div> <!-- Gráfico 5: Impacto en resultados financieros --> <div class="bg-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-amber-900/30"> <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-amber-400">
Impacto en Resultados
</h2> <div id="financial-chart-container" class="h-56 md:h-64 relative"> <!-- El gráfico financiero se inyectará aquí mediante React --> </div> <div class="mt-4 bg-black/20 p-3 md:p-4 rounded-lg text-xs md:text-sm"> <p class="text-white font-bold">
Con el ahorro mensual de <span class="text-amber-400 font-bold text-sm md:text-base">$1.620.000</span>, el margen de beneficio aumenta del <span class="text-amber-400 font-bold text-sm md:text-base">20%</span> al <span class="text-amber-400 font-bold text-sm md:text-base">36%</span> sobre las ventas
              mensuales.
</p> </div> </div> </div> <div class="bg-gray-900 rounded-xl p-4 md:p-8 shadow-lg border border-amber-900/30 mb-8 md:mb-16 overflow-hidden"> <h2 class="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-amber-400">
Desglose de Costos Mensuales (CLP)
</h2> <div class="overflow-x-auto -mx-4 md:mx-0"> <div class="min-w-[600px] px-4 md:px-0 md:min-w-full"> <table class="w-full text-white font-bold text-xs md:text-base"> <thead> <tr class="border-b border-gray-700"> <th class="py-2 md:py-3 text-left text-white font-bold">Categoría</th> <th class="py-2 md:py-3 text-right text-white font-bold">Modelo Tradicional</th> <th class="py-2 md:py-3 text-right text-white font-bold">Con Agentes IA RAG</th> <th class="py-2 md:py-3 text-right text-white font-bold">Ahorro</th> <th class="py-2 md:py-3 text-right text-white font-bold">Reducción %</th> </tr> </thead> <tbody> <tr class="border-b border-gray-800"> <td class="py-2 md:py-3 text-white font-bold">Personal de atención al cliente</td> <td class="py-2 md:py-3 text-right text-white font-bold">$1.200.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$480.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">$720.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">60%</td> </tr> <tr class="border-b border-gray-800"> <td class="py-2 md:py-3 text-white font-bold">Procesamiento de documentos</td> <td class="py-2 md:py-3 text-right text-white font-bold">$850.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$340.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">$510.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">60%</td> </tr> <tr class="border-b border-gray-800"> <td class="py-2 md:py-3 text-white font-bold">Infraestructura tecnológica</td> <td class="py-2 md:py-3 text-right text-white font-bold">$450.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$380.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">$70.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">15%</td> </tr> <tr class="border-b border-gray-800"> <td class="py-2 md:py-3 text-white font-bold">Corrección de errores</td> <td class="py-2 md:py-3 text-right text-white font-bold">$350.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$70.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">$280.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">80%</td> </tr> <tr class="border-b border-gray-800"> <td class="py-2 md:py-3 text-white font-bold">Capacitación</td> <td class="py-2 md:py-3 text-right text-white font-bold">$220.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$180.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">$40.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">18%</td> </tr> <tr class="border-b border-gray-800"> <td class="py-2 md:py-3 text-white font-bold">Software y licencias</td> <td class="py-2 md:py-3 text-right text-white font-bold">$380.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$480.000</td> <td class="py-2 md:py-3 text-right text-red-400 font-bold">-$100.000</td> <td class="py-2 md:py-3 text-right text-red-400 font-bold">-26%</td> </tr> <tr class="border-b border-gray-800"> <td class="py-2 md:py-3 text-white font-bold">Horas extras</td> <td class="py-2 md:py-3 text-right text-white font-bold">$150.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$50.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">$100.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">67%</td> </tr> <tr class="font-bold"> <td class="py-2 md:py-3 text-white font-bold">TOTAL</td> <td class="py-2 md:py-3 text-right text-white font-bold">$3.600.000</td> <td class="py-2 md:py-3 text-right text-white font-bold">$1.980.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">$1.620.000</td> <td class="py-2 md:py-3 text-right text-green-400 font-bold">45%</td> </tr> </tbody> </table> </div> </div> </div> <div class="bg-gray-900 rounded-xl p-4 md:p-8 shadow-lg border border-amber-900/30 mb-8 md:mb-16 overflow-hidden"> <h2 class="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-amber-400">
5 Áreas Principales de Ahorro
</h2> <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 mb-4 md:mb-6"> <div class="bg-black/20 p-3 md:p-4 rounded-lg text-center"> <div class="text-xl md:text-3xl font-bold text-amber-400 mb-1 md:mb-2">60%</div> <h3 class="text-sm md:text-base text-white font-bold mb-1 md:mb-2">Personal</h3> <p class="text-xs md:text-sm text-white font-bold">
Reducción de personal para tareas repetitivas y básicas
</p> </div> <div class="bg-black/20 p-3 md:p-4 rounded-lg text-center"> <div class="text-xl md:text-3xl font-bold text-amber-400 mb-1 md:mb-2">80%</div> <h3 class="text-sm md:text-base text-white font-bold mb-1 md:mb-2">Errores</h3> <p class="text-xs md:text-sm text-white font-bold">
Menor costo en corrección de errores operativos
</p> </div> <div class="bg-black/20 p-3 md:p-4 rounded-lg text-center"> <div class="text-xl md:text-3xl font-bold text-amber-400 mb-1 md:mb-2">67%</div> <h3 class="text-sm md:text-base text-white font-bold mb-1 md:mb-2">Horas extras</h3> <p class="text-xs md:text-sm text-white font-bold">
Reducción en pagos de horas extras
</p> </div> <div class="bg-black/20 p-3 md:p-4 rounded-lg text-center"> <div class="text-xl md:text-3xl font-bold text-amber-400 mb-1 md:mb-2">75%</div> <h3 class="text-sm md:text-base text-white font-bold mb-1 md:mb-2">Tiempo</h3> <p class="text-xs md:text-sm text-white font-bold">
Reducción en tiempos de procesamiento
</p> </div> <div class="bg-black/20 p-3 md:p-4 rounded-lg text-center col-span-2 sm:col-span-1"> <div class="text-xl md:text-3xl font-bold text-amber-400 mb-1 md:mb-2">24/7</div> <h3 class="text-sm md:text-base text-white font-bold mb-1 md:mb-2">Disponibilidad</h3> <p class="text-xs md:text-sm text-white font-bold">
Atención continua sin costos adicionales
</p> </div> </div> <div class="bg-amber-900/20 p-3 md:p-4 rounded-lg"> <p class="text-white font-bold text-center text-sm md:text-base"> <span class="font-bold text-amber-400">Resultado final:</span> Por cada $10.000.000 en ventas,
            los agentes IA RAG permiten un ahorro de <span class="font-bold text-amber-400 text-sm md:text-base">$1.620.000</span> mensuales, lo que equivale a <span class="font-bold text-amber-400 text-sm md:text-base">$19.440.000</span>
anuales.
</p> </div> </div> <!-- Chat con estilo de gráficos oscuros --> <div class="bg-gray-900 rounded-xl p-4 md:p-8 shadow-lg border-2 border-amber-500 mb-8 md:mb-16 overflow-hidden"> ${renderComponent($$result, "ChatInterfaceDarkWrapper", $$ChatInterfaceDarkWrapper, {})} </div> <!-- Incluimos el componente TimelineChartsWrapper para que se cargue el componente React --> ${renderComponent($$result, "TimelineChartsWrapper", $$TimelineChartsWrapper, {})} </div> </div> </div>`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/HolaPart3Content.astro", void 0);

const $$Astro$8 = createAstro();
const $$EmpresaPart2Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$EmpresaPart2Content;
  const { section } = Astro2.props;
  return renderTemplate`<!-- Contenedor principal con estructura mínima como el ejemplo -->${maybeRenderHead()}<div id="empresa-part2-timeline" class="w-full relative z-10" style="height: 100%; position: relative; margin: 2rem; margin-left: 1rem; margin-right: 1rem;"> <div class="timeline-wrapper"> <!-- Título principal con propiedades CSS específicas --> <h2 class="text-5xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 md:mb-6 leading-tight">
Nuestra identidad corporativa
</h2> <div class="max-w-7xl"> <p class="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 leading-relaxed">
Los principios y valores que guían cada decisión en${" "} <span class="animated-gradient-text" style="background-image: linear-gradient(45deg, #00ff41 0%, #5fff78 25%, #85ff99 50%, #5fff78 75%, #00ff41 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline;">
Agente RAG
</span>, con el compromiso de transformar las${" "} <span class="inline-block bg-gradient-to-r from-white via-gray-100 to-white bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer">
PyMEs de Latinoamérica
</span>${" "}
🌟.
</p> </div> </div> <!-- CONTENIDO CON MÁRGENES LATERALES --> <div class="mx-auto pb-16 lg:pb-24 mt-16 px-2" style="max-width: calc(100vw - 2rem);"> <!-- Grid principal con Misión y Visión --> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"> <!-- Misión --> <div class="bg-gradient-to-br from-green-900/60 to-emerald-800/40 backdrop-blur-md rounded-xl p-8 border border-green-400/30 hover:border-green-400/50 transition-all duration-300"> <div class="flex items-center mb-6"> <div class="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mr-4"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <h3 class="text-3xl font-bold text-white">Nuestra Misión</h3> </div> <p class="text-green-100 text-lg leading-relaxed">
Transformar la gestión administrativa en las PYMEs con IA, permitiendo que cada empresa
          opere de forma ágil y rentable. Aspiramos a que, a través de nuestra tecnología, nuestros
          clientes se liberen de tareas repetitivas y se concentren en desarrollar su negocio,
          consolidándonos como líderes en soluciones de IA que reducen costos y potencian el
          crecimiento.
</p> </div> <!-- Visión --> <div class="bg-gradient-to-br from-emerald-900/60 to-teal-800/40 backdrop-blur-md rounded-xl p-8 border border-green-400/30 hover:border-green-400/50 transition-all duration-300"> <div class="flex items-center mb-6"> <div class="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center mr-4"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> </div> <h3 class="text-3xl font-bold text-white">Nuestra Visión</h3> </div> <p class="text-green-100 text-lg leading-relaxed">
Ser la empresa líder en soluciones IA que reduce costos y potencia la eficiencia en las
          PYMEs en Latino América.
</p> </div> </div> <!-- Nuestro Propósito - Sección destacada --> <div class="bg-gradient-to-r from-green-900/60 to-emerald-800/40 rounded-xl p-6 md:p-8 backdrop-blur-sm border border-green-400/30 mb-8 md:mb-12"> <div class="text-center"> <div class="w-20 h-20 md:w-24 md:h-24 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8"> <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 md:h-12 md:w-12 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path> </svg> </div> <h3 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
Nuestro Propósito
</h3> <p class="text-green-200 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto px-2">
En Agente RAG, creemos que todas las PYMEs merecen acceder a soluciones tecnológicas
          avanzadas que impulsen su crecimiento. Por ello, nos dedicamos a desarrollar herramientas
          de inteligencia artificial que automatizan tareas administrativas, permitiendo a las
          empresas enfocarse en lo que realmente importa: su desarrollo y éxito sostenible.
</p> </div> </div> <!-- Nuestros Valores --> <div class="bg-black/50 backdrop-blur-md rounded-xl p-6 md:p-8 border border-green-400/30 mb-6 md:mb-8"> <div class="text-center mb-8 md:mb-10"> <h3 class="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Nuestros Valores</h3> <p class="text-green-200 text-base md:text-lg max-w-3xl mx-auto px-2">
Los principios que definen nuestra forma de trabajar y nos comprometen con el éxito de
          nuestros clientes.
</p> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"> <!-- Innovación --> <div class="text-center group"> <div class="w-16 h-16 md:w-20 md:h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path> </svg> </div> <h4 class="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Innovación</h4> <p class="text-green-200 text-sm md:text-base leading-relaxed">
Desarrollamos soluciones tecnológicas de vanguardia que anticipan las necesidades del
            mercado.
</p> </div> <!-- Accesibilidad --> <div class="text-center group"> <div class="w-16 h-16 md:w-20 md:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> </div> <h4 class="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Accesibilidad</h4> <p class="text-green-200 text-sm md:text-base leading-relaxed">
Democratizamos la tecnología avanzada, haciéndola asequible para todas las PYMEs.
</p> </div> <!-- Transparencia --> <div class="text-center group"> <div class="w-16 h-16 md:w-20 md:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-10 md:w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path> </svg> </div> <h4 class="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Transparencia</h4> <p class="text-green-200 text-sm md:text-base leading-relaxed">
Operamos con honestidad total, sin costos ocultos ni promesas irreales.
</p> </div> <!-- Compromiso --> <div class="text-center group"> <div class="w-16 h-16 md:w-20 md:h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path> </svg> </div> <h4 class="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Compromiso</h4> <p class="text-green-200 text-sm md:text-base leading-relaxed">
Nos dedicamos completamente al éxito de nuestros clientes y al crecimiento sostenible.
</p> </div> </div> </div> <!-- Llamada a la acción --> <div class="bg-gradient-to-r from-green-800/60 to-emerald-700/40 rounded-xl p-4 md:p-6 backdrop-blur-sm border border-green-400/30 text-center"> <h3 class="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
¿Listo para Transformar tu PYME?
</h3> <p class="text-green-200 text-base md:text-lg mb-4 md:mb-6 max-w-2xl mx-auto">
Descubre cómo nuestra tecnología puede liberar a tu empresa de tareas repetitivas y
        potenciar su crecimiento.
</p> <div class="flex justify-center items-center"> <a href="#contacto-part2" class="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-300 min-w-[200px] inline-block text-center">
Solicitar Consulta Gratuita
</a> </div> </div> </div> </div>`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/EmpresaPart2Content.astro", void 0);

const $$Astro$7 = createAstro();
const $$EmpresaPart3Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$EmpresaPart3Content;
  const { section } = Astro2.props;
  const methodologySteps = [
    {
      step: "01",
      title: "Descubrimiento y An\xE1lisis",
      description: "Nos sumergimos en tu negocio para entender tus desaf\xEDos y objetivos. Analizamos tus procesos actuales para identificar las oportunidades de automatizaci\xF3n m\xE1s impactantes y con mayor retorno de inversi\xF3n.",
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />`
    },
    {
      step: "02",
      title: "Dise\xF1o y Prototipado",
      description: "Creamos un plan de acci\xF3n detallado y un prototipo funcional del Agente RAG. Validamos la soluci\xF3n contigo para asegurar que cumple con tus expectativas y se integra perfectamente en tu flujo de trabajo.",
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />`
    },
    {
      step: "03",
      title: "Desarrollo e Implementaci\xF3n",
      description: "Nuestro equipo de expertos construye y entrena a tu Agente IA a medida. Nos encargamos de la implementaci\xF3n completa, asegurando una transici\xF3n fluida y sin interrupciones para tu operaci\xF3n diaria.",
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l-4 4-4-4-4 4" />`
    },
    {
      step: "04",
      title: "Soporte y Optimizaci\xF3n",
      description: "El lanzamiento es solo el comienzo. Monitoreamos el rendimiento, proporcionamos soporte continuo y optimizamos tu agente para que evolucione y se adapte a las nuevas necesidades de tu empresa.",
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`
    }
  ];
  return renderTemplate`${maybeRenderHead()}<div id="empresa-part3-timeline" class="w-full relative z-10" style="height: 100%; position: relative; margin: 2rem; margin-left: 1rem; margin-right: 1rem;"> <div class="timeline-wrapper"> <h2 class="text-5xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 md:mb-6 leading-tight">
Nuestra metodología de desarrollo
</h2> <div class="max-w-8xl"> <p class="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 leading-relaxed">
Implementar${" "} <span class="animated-gradient-text" style="background-image: linear-gradient(45deg, #00ff41 0%, #5fff78 25%, #85ff99 50%, #5fff78 75%, #00ff41 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline;">
metodologías ágiles especializadas
</span>${" "}
es${" "} <span class="inline-block bg-gradient-to-r from-white via-gray-100 to-white bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer">
garantía de éxito
</span>${" "}
🎯.
</p> </div> </div> <!-- Contenido en Contenedor --> <div class="container mx-auto px-4 pb-16 lg:pb-24 mt-16"> <div class="grid grid-cols-1 md:grid-cols-2 gap-8"> ${methodologySteps.map((step) => renderTemplate`<div class="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-xl p-8 hover:border-green-400/40 transition-all duration-300"> <div class="flex items-start gap-4"> <div class="flex-shrink-0 w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center border-2 border-green-500/50"> <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">${unescapeHTML(step.icon)}</svg> </div> <div class="flex-1"> <h3 class="text-2xl font-bold text-white mb-2">${step.title}</h3> <p class="text-green-100/80 leading-relaxed">${step.description}</p> </div> </div> </div>`)} </div> </div> </div>`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/EmpresaPart3Content.astro", void 0);

const $$Astro$6 = createAstro();
const $$EmpresaPart4Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$EmpresaPart4Content;
  const { section } = Astro2.props;
  const competencies = {
    "AI / ML": [
      "Inteligencia Artificial",
      "Machine Learning",
      "LLMs",
      "NLP",
      "Computer Vision",
      "LangChain",
      "PyTorch",
      "TensorFlow",
      "Hugging Face",
      "Scikit-learn"
    ],
    "Data": [
      "Data Analytics",
      "Pandas",
      "NumPy",
      "ETL",
      "Bases de Datos Vectoriales",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "Firebase"
    ],
    "Backend": [
      "Python",
      "Node.js",
      "FastAPI",
      "Django",
      "Flask",
      "Express.js",
      "Go",
      "Rust",
      "Java",
      "Spring Boot",
      "REST APIs",
      "GraphQL",
      "WebSockets",
      "Microservicios",
      "Clean Architecture",
      "SOLID Principles",
      "Design Patterns",
      "API Gateway",
      "Message Queues",
      "RabbitMQ",
      "Apache Kafka",
      "Event-Driven Architecture",
      "CQRS",
      "Domain-Driven Design",
      "Serverless Functions"
    ],
    "Frontend": [
      "Astro",
      "React",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Svelte",
      "Vue.js"
    ],
    "DevOps & Cloud": [
      "AWS",
      "Google Cloud Platform",
      "Microsoft Azure",
      "Docker",
      "Kubernetes",
      "Helm",
      "Terraform",
      "Ansible",
      "Jenkins",
      "GitHub Actions",
      "GitLab CI/CD",
      "CircleCI",
      "ArgoCD",
      "Prometheus",
      "Grafana",
      "ELK Stack",
      "Nginx",
      "Apache",
      "Load Balancing",
      "CDN",
      "Vercel",
      "Netlify",
      "Railway",
      "DigitalOcean",
      "Monitoring & Alerting",
      "Infrastructure as Code",
      "Blue-Green Deployment",
      "Canary Releases",
      "Service Mesh",
      "Istio",
      "Container Orchestration",
      "Secrets Management",
      "Vault",
      "Linux Administration",
      "Bash Scripting",
      "Network Security",
      "VPN",
      "SSL/TLS",
      "OAuth & JWT"
    ]
  };
  const categoryColors = {
    "AI / ML": "#00ff41",
    // Verde terminal clásico
    "Data": "#00ff41",
    // Verde terminal clásico
    "Backend": "#00ff41",
    // Verde terminal clásico
    "Frontend": "#00ff41",
    // Verde terminal clásico
    "DevOps & Cloud": "#00ff41"
    // Verde terminal clásico
  };
  return renderTemplate`<!-- Contenedor principal con estructura optimizada como otras secciones -->${maybeRenderHead()}<div id="empresa-part4-timeline" class="w-full relative z-10" style="height: 100%; position: relative; margin: 2rem; margin-left: 1rem; margin-right: 1rem;" data-astro-cid-kxcw6cxw> <div class="timeline-wrapper" data-astro-cid-kxcw6cxw> <!-- Título principal con propiedades CSS específicas --> <h2 class="text-7xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 md:mb-6 leading-tight" data-astro-cid-kxcw6cxw>
Competencias técnicas
</h2> <div class="max-w-8xl" data-astro-cid-kxcw6cxw> <p class="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 leading-relaxed" data-astro-cid-kxcw6cxw>
Nuestro${" "} <span class="animated-gradient-text" style="background-image: linear-gradient(45deg, #00ff41 0%, #5fff78 25%, #85ff99 50%, #5fff78 75%, #00ff41 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline;" data-astro-cid-kxcw6cxw>
stack tecnológico avanzado
</span>${" "}
construye soluciones${" "} <span class="inline-block bg-gradient-to-r from-white via-gray-100 to-white bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer" data-astro-cid-kxcw6cxw>
robustas y escalables
</span>${" "}
🚀.
</p> </div> </div> <!-- Múltiples Carruseles por Especialidad --> <div class="space-y-12 mt-16" data-astro-cid-kxcw6cxw> ${Object.entries(competencies).map(([category, techs], index) => renderTemplate`<div class="specialty-row" data-astro-cid-kxcw6cxw> <!-- Título de la especialidad con color específico --> <h3 class="text-3xl md:text-4xl font-bold mb-6 text-center font-mono"${addAttribute(`color: ${categoryColors[category]}`, "style")} data-astro-cid-kxcw6cxw> ${`> ${category}`} </h3> <!-- Carrusel infinito que se activa con viewport --> <div class="scroller viewport-carousel" data-speed="slow"${addAttribute(index % 2 === 0 ? "right" : "left", "data-direction")}${addAttribute(category, "data-category")} data-astro-cid-kxcw6cxw> <ul class="tag-list scroller__inner" data-astro-cid-kxcw6cxw> ${techs.map((tech) => renderTemplate`<li class="tech-tag"${addAttribute(category, "data-category")} data-astro-cid-kxcw6cxw>${tech}</li>`)} <!-- Duplicamos para el efecto infinito --> ${techs.map((tech) => renderTemplate`<li class="tech-tag"${addAttribute(category, "data-category")} data-astro-cid-kxcw6cxw>${tech}</li>`)} </ul> </div> </div>`)} </div> </div>  <!-- 
  =======================================
  LA CORRECCIÓN: EL SCRIPT VA AQUÍ AFUERA
  =======================================
--> ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/EmpresaPart4Content.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/EmpresaPart4Content.astro", void 0);

const $$Astro$5 = createAstro();
const $$SolucionesPart2Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$SolucionesPart2Content;
  const { section } = Astro2.props;
  const casosDeUso = [
    {
      icono: "\u2696\uFE0F",
      segmento: "Abogados",
      titulo: "Gesti\xF3n Legal Inteligente",
      descripcion: "Automatiza b\xFAsquedas jurisprudenciales, redacci\xF3n de contratos y consultas de normativas. Tu asistente legal que conoce toda tu documentaci\xF3n.",
      beneficios: ["B\xFAsqueda instant\xE1nea en expedientes", "Redacci\xF3n autom\xE1tica de documentos", "Consultas normativas 24/7"],
      colorAccent: "#00ff41"
    },
    {
      icono: "\u{1F3E5}",
      segmento: "Cl\xEDnicas",
      titulo: "Asistente M\xE9dico RAG",
      descripcion: "Optimiza gesti\xF3n de historiales, citas y consultas m\xE9dicas. Acceso instant\xE1neo a protocolos y informaci\xF3n de pacientes.",
      beneficios: ["Gesti\xF3n de historiales m\xE9dicos", "Programaci\xF3n inteligente de citas", "Consultas de protocolos m\xE9dicos"],
      colorAccent: "#00ff41"
    },
    {
      icono: "\u{1F393}",
      segmento: "Educaci\xF3n",
      titulo: "Campus Inteligente",
      descripcion: "Centraliza informaci\xF3n acad\xE9mica, procedimientos y consultas estudiantiles. Tu asistente educativo que conoce toda la instituci\xF3n.",
      beneficios: ["Consultas acad\xE9micas automatizadas", "Gesti\xF3n de procedimientos", "Soporte estudiantil 24/7"],
      colorAccent: "#00ff41"
    },
    {
      icono: "\u{1F4E6}",
      segmento: "Log\xEDstica",
      titulo: "Operaciones Optimizadas",
      descripcion: "Automatiza seguimiento de env\xEDos, inventarios y procedimientos operativos. Control total de tu cadena log\xEDstica.",
      beneficios: ["Tracking autom\xE1tico de env\xEDos", "Gesti\xF3n inteligente de inventarios", "Optimizaci\xF3n de rutas"],
      colorAccent: "#00ff41"
    },
    {
      icono: "\u{1F527}",
      segmento: "Servicios",
      titulo: "Gesti\xF3n de Servicios Pro",
      descripcion: "Centraliza manuales t\xE9cnicos, procedimientos y atenci\xF3n al cliente. Tu base de conocimiento t\xE9cnico siempre disponible.",
      beneficios: ["Manuales t\xE9cnicos accesibles", "Procedimientos estandarizados", "Soporte t\xE9cnico inteligente"],
      colorAccent: "#00ff41"
    },
    {
      icono: "\u{1F3ED}",
      segmento: "Manufactura",
      titulo: "Producci\xF3n Inteligente",
      descripcion: "Optimiza procesos productivos, control de calidad y mantenimiento. Tu asistente de producci\xF3n experto.",
      beneficios: ["Control de calidad automatizado", "Gesti\xF3n de mantenimiento", "Optimizaci\xF3n de procesos"],
      colorAccent: "#00ff41"
    }
  ];
  return renderTemplate`<!-- Contenedor principal con estructura mínima como el ejemplo -->${maybeRenderHead()}<div id="soluciones-part2-timeline" class="w-full relative z-10" style="height: 100%; position: relative; margin: 2rem; margin-left: 1rem; margin-right: 1rem;" data-astro-cid-ttvasp3g> <div class="timeline-wrapper" data-astro-cid-ttvasp3g> <h2 class="text-7xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 md:mb-6 leading-tight" data-astro-cid-ttvasp3g>
Casos de Uso Inteligentes por Segmento
</h2> <div class="max-w-7xl" data-astro-cid-ttvasp3g> <p class="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 leading-relaxed" data-astro-cid-ttvasp3g>
Hoy${" "} ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })}${" "}
implementar${" "} <span class="animated-gradient-text" style="background-image: linear-gradient(45deg, #00ff41 0%, #5fff78 25%, #85ff99 50%, #5fff78 75%, #00ff41 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline;" data-astro-cid-ttvasp3g>
soluciones RAG especializadas
</span>${" "}
es${" "} <span class="inline-block bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer" data-astro-cid-ttvasp3g>
rentable y alcanzable
</span>${" "}
🚀.
</p> </div> </div> <!-- Carrusel de Casos de Uso --> <div class="carrusel-container mt-16" data-astro-cid-ttvasp3g> <!-- Contenedor scrolleable con mask para desvanecimiento --> <div class="carrusel-scroll" id="carrusel-casos" data-astro-cid-ttvasp3g> ${casosDeUso.map((caso, index) => renderTemplate`<div class="caso-card" data-astro-cid-ttvasp3g> <!-- Header de la tarjeta --> <div class="caso-header" data-astro-cid-ttvasp3g> <div class="caso-icono" data-astro-cid-ttvasp3g> ${caso.icono} </div> <div class="caso-segmento" data-astro-cid-ttvasp3g>${caso.segmento}</div> </div> <!-- Contenido --> <div class="caso-content" data-astro-cid-ttvasp3g> <h3 class="caso-titulo" data-astro-cid-ttvasp3g>${caso.titulo}</h3> <p class="caso-descripcion" data-astro-cid-ttvasp3g>${caso.descripcion}</p> <!-- Lista de beneficios --> <ul class="caso-beneficios" data-astro-cid-ttvasp3g> ${caso.beneficios.map((beneficio) => renderTemplate`<li class="caso-beneficio" data-astro-cid-ttvasp3g> <span class="beneficio-bullet" data-astro-cid-ttvasp3g>▸</span> ${beneficio} </li>`)} </ul> </div> <!-- CTA --> <div class="caso-cta" data-astro-cid-ttvasp3g> <a href="#contacto-part2" class="cta-button" data-astro-cid-ttvasp3g> <span class="cta-text" data-astro-cid-ttvasp3g>Implementar Solución</span> <span class="cta-arrow" data-astro-cid-ttvasp3g>→</span> </a> </div> </div>`)} </div> </div> <!-- Indicador de scroll (opcional) --> <div class="scroll-indicator" data-astro-cid-ttvasp3g> <p class="text-sm text-gray-400 text-center mt-8" data-astro-cid-ttvasp3g>
← Desliza horizontalmente para ver más soluciones →
</p> </div> </div>  ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/SolucionesPart2Content.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/SolucionesPart2Content.astro", void 0);

const TEMAS_PREDEFINIDOS = [
  {
    id: "llm",
    nombre: "Large Language Models",
    emoji: "🧠",
    descripcion: "Modelos de lenguaje y sus aplicaciones",
    keywords: ["LLM", "GPT", "Transformers", "NLP", "ChatGPT", "Claude", "Gemini"]
  },
  {
    id: "rag",
    nombre: "RAG",
    emoji: "🔍",
    descripcion: "Generación aumentada por recuperación",
    keywords: ["RAG", "Vector DB", "Embeddings", "Retrieval", "Knowledge Base"]
  },
  {
    id: "ia-generativa",
    nombre: "IA Generativa",
    emoji: "🎨",
    descripcion: "Creación de contenido con IA",
    keywords: ["Generative AI", "DALL-E", "Midjourney", "Stable Diffusion", "Content Creation"]
  },
  {
    id: "machine-learning",
    nombre: "Machine Learning",
    emoji: "⚡",
    descripcion: "Aprendizaje automático y algoritmos",
    keywords: [
      "ML",
      "Deep Learning",
      "Neural Networks",
      "Supervised Learning",
      "Unsupervised Learning"
    ]
  },
  {
    id: "computer-vision",
    nombre: "Computer Vision",
    emoji: "👁️",
    descripcion: "Análisis de imágenes por computadora",
    keywords: ["Computer Vision", "Image Recognition", "Object Detection"]
  },
  {
    id: "nlp",
    nombre: "Procesamiento de Lenguaje Natural",
    emoji: "💬",
    descripcion: "Comprensión del lenguaje humano",
    keywords: ["NLP", "Sentiment Analysis", "Text Mining", "Chatbots"]
  },
  {
    id: "automatizacion-ia",
    nombre: "Automatización con IA",
    emoji: "🤖",
    descripcion: "Automatización de procesos con IA",
    keywords: ["RPA", "Automation", "Process Mining", "Workflow"]
  },
  {
    id: "etica-ia",
    nombre: "Ética en IA",
    emoji: "⚖️",
    descripcion: "Consideraciones éticas y responsables",
    keywords: ["AI Ethics", "Bias", "Fairness", "Transparency"]
  }
];
const BlogModal = ({
  blog,
  onClose,
  onLike
}) => {
  const renderMarkdown = (markdown) => {
    if (!markdown) return "";
    const contenidoLimpio = markdown.replace(/^```markdown\s*/i, "").replace(/\s*```\s*$/i, "").replace(/^```\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const html = contenidoLimpio.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-6">$1</h1>').replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mb-4 mt-8">$1</h2>').replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mb-3 mt-6">$1</h3>').replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-white">$1</strong>').replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>').replace(
      /^- (.*$)/gim,
      `<li class="mb-2 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-400">$1</li>`
    ).replace(/<p><ul>/g, "<ul>").replace(/<\/ul><\/p>/g, "</ul>").replace(/\n/g, "<br />");
    return `<div class="prose prose-invert max-w-none text-gray-300 leading-relaxed">${html.replace(/<p><br \/><\/p>/g, "")}</div>`;
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-gray-900 border border-gray-600 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between p-6 border-b border-gray-600 flex-shrink-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-3xl", children: TEMAS_PREDEFINIDOS.find((t) => blog.tags?.some((tag) => t.keywords.includes(tag)))?.emoji || "📝" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-white truncate", children: blog.titulo }),
                  /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-sm", children: [
                    blog.autor || "IA",
                    " •",
                    " ",
                    new Date(blog.fecha_publicacion).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    }),
                    " ",
                    "• ",
                    blog.tiempo_lectura,
                    " min"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "text-gray-400 hover:text-white text-3xl transition-colors",
                  children: "×"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-y-auto p-6", children: [
              blog.imagen_url && /* @__PURE__ */ jsxs("div", { className: "relative mb-6 rounded-lg overflow-hidden", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: blog.imagen_url,
                    alt: blog.titulo,
                    className: "w-full h-64 object-cover",
                    loading: "lazy",
                    onError: (e) => {
                      e.currentTarget.parentElement.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" })
              ] }),
              /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: renderMarkdown(blog.contenido) } })
            ] }),
            /* @__PURE__ */ jsxs("footer", { className: "flex items-center justify-between p-6 border-t border-gray-600 bg-gray-800/50 flex-shrink-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-400", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "👁️ ",
                  blog.vistas || 0,
                  " vistas"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "❤️ ",
                  blog.likes || 0,
                  " likes"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onLike(blog.id),
                    className: "px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2",
                    children: "❤️ Me gusta"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors",
                    children: "Cerrar"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
};
function GeneradorBlogIA() {
  const [temaSeleccionado, setTemaSeleccionado] = useState("");
  const [estadoGeneracion, setEstadoGeneracion] = useState({ estado: "inicial" });
  const [blogs, setBlogs] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_published: 0,
    total_views: 0,
    total_likes: 0,
    avg_reading_time: 0,
    avg_generation_time: 0
  });
  const [blogSeleccionado, setBlogSeleccionado] = useState(null);
  useEffect(() => {
    const styles = `
      @keyframes fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out;
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-shimmer {
        animation: shimmer 3s ease-in-out infinite;
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
  const cargarDatos = useCallback(async (temaId = "") => {
    try {
      const temaInfo = TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
      const esBusquedaPorTema = temaId && temaInfo;
      const blogsUrl = esBusquedaPorTema ? "/api/blog/buscar-por-tema" : "/api/blog/obtener-generados";
      const blogsMethod = esBusquedaPorTema ? "POST" : "GET";
      const blogsBody = esBusquedaPorTema ? JSON.stringify({ keywords: temaInfo.keywords }) : null;
      const [blogsRes, statsRes] = await Promise.all([
        fetch(blogsUrl, {
          method: blogsMethod,
          headers: { "Content-Type": "application/json" },
          body: blogsBody
        }),
        fetch("/api/blog/estadisticas")
      ]);
      const blogsData = await blogsRes.json();
      const statsData = await statsRes.json();
      setBlogs(blogsData.blogs || []);
      setEstadisticas(
        statsData.estadisticas || {
          total_published: 0,
          total_views: 0,
          total_likes: 0,
          avg_reading_time: 0,
          avg_generation_time: 0
        }
      );
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, []);
  useEffect(() => {
    cargarDatos(temaSeleccionado);
  }, [temaSeleccionado, cargarDatos]);
  const handleGenerarBlog = async () => {
    if (!temaSeleccionado) {
      setEstadoGeneracion({ estado: "error", mensaje: "Por favor selecciona un tema" });
      return;
    }
    setEstadoGeneracion({ estado: "generando" });
    try {
      const response = await fetch("/api/blog/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temaId: temaSeleccionado })
      });
      const result = await response.json();
      if (result.success) {
        setEstadoGeneracion({ estado: "exito", blogGenerado: result.post });
        await cargarDatos(temaSeleccionado);
        setTimeout(() => setEstadoGeneracion({ estado: "inicial" }), 4e3);
      } else {
        setEstadoGeneracion({ estado: "error", mensaje: result.error || "Error desconocido" });
      }
    } catch (error) {
      console.error("Error generando blog:", error);
      setEstadoGeneracion({ estado: "error", mensaje: "Error de conexión" });
    }
  };
  const abrirBlog = async (blogId) => {
    try {
      await fetch("/api/blog/incrementar-vistas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: blogId })
      });
      const response = await fetch(`/api/blog/obtener-completo/${blogId}`);
      const data = await response.json();
      if (data.success) {
        setBlogSeleccionado(data.blog);
        cargarDatos(temaSeleccionado);
      }
    } catch (error) {
      console.error("Error abriendo blog:", error);
    }
  };
  const darLike = async (blogId) => {
    try {
      await fetch("/api/blog/incrementar-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: blogId })
      });
      if (blogSeleccionado && blogSeleccionado.id === blogId) {
        setBlogSeleccionado((prev) => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      }
      const blogIndex = blogs.findIndex((b) => b.id === blogId);
      if (blogIndex > -1) {
        const newBlogs = [...blogs];
        newBlogs[blogIndex].likes = (newBlogs[blogIndex].likes || 0) + 1;
        setBlogs(newBlogs);
      }
      cargarDatos(temaSeleccionado);
    } catch (error) {
      console.error("Error dando like:", error);
    }
  };
  const temaActual = TEMAS_PREDEFINIDOS.find((t) => t.id === temaSeleccionado);
  const blogsAMostrar = blogs;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    blogSeleccionado && /* @__PURE__ */ jsx(
      BlogModal,
      {
        blog: blogSeleccionado,
        onClose: () => setBlogSeleccionado(null),
        onLike: darLike
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-left mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-6xl md:text-9xl font-bold text-white mb-6 leading-tight", children: "Automatizamos la generación de contenido de tú empresa" }),
        /* @__PURE__ */ jsx("div", { className: "max-w-4xl", children: /* @__PURE__ */ jsxs("p", { className: "text-lg md:text-4xl text-gray-300 leading-relaxed", children: [
          "Hoy",
          " ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long"
          }),
          " ",
          "con",
          " ",
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "relative inline-block font-semibold px-2 py-1 rounded-md",
              style: {
                backgroundImage: "linear-gradient(45deg, #22ff6c 0%, #43ffba 25%, #65f0ff 50%, #43ffba 75%, #22ff6c 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block",
                textShadow: "none",
                fontWeight: "600"
              },
              children: "inteligencia artificial RAG"
            }
          ),
          " ",
          "generar un blog",
          " ",
          /* @__PURE__ */ jsx("span", { className: "inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer", children: "automatizado" }),
          " ",
          "es 100% real no fake 👇."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-500/10 rounded-lg p-3 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-300", children: estadisticas.total_published }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-blue-200", children: "Publicados" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-green-500/10 rounded-lg p-3 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-300", children: estadisticas.total_views }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-green-200", children: "Vistas" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-purple-500/10 rounded-lg p-3 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-purple-300", children: estadisticas.total_likes }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-purple-200", children: "Likes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-orange-500/10 rounded-lg p-3 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-orange-300", children: Math.round(estadisticas.avg_reading_time) }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-orange-200", children: "Min. Lectura" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-yellow-500/10 rounded-lg p-3 text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-yellow-300", children: [
            (estadisticas.avg_generation_time / 1e3).toFixed(1),
            "s"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-yellow-200", children: "T. Gen. Prom." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-500/10 rounded-lg p-3 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-pink-300", children: estadisticas.total_published }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-pink-200", children: "Blogs Generados" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white font-semibold mb-4", children: "Selecciona un tema para generar o ver blogs:" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none",
              style: {
                background: "linear-gradient(to right, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none",
              style: {
                background: "linear-gradient(to left, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)"
              }
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex gap-4 overflow-x-auto py-2 pb-4 px-1 scrollbar-hide hover:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500/50", children: TEMAS_PREDEFINIDOS.map((tema, index) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setTemaSeleccionado(tema.id === temaSeleccionado ? "" : tema.id),
              className: `flex-shrink-0 w-52 p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-[1.02] group ${temaSeleccionado === tema.id ? "border-blue-400 bg-blue-500/30 shadow-lg shadow-blue-500/20 scale-[1.02]" : "border-blue-600/40 bg-blue-800/30 hover:border-blue-400/60 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10"}`,
              style: {
                animationDelay: `${index * 0.05}s`
              },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: `text-3xl transition-transform duration-300 ${temaSeleccionado === tema.id ? "scale-110" : "group-hover:scale-105"}`,
                      children: tema.emoji
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: `font-semibold text-sm mb-1 transition-colors ${temaSeleccionado === tema.id ? "text-blue-100" : "text-white group-hover:text-blue-200"}`,
                        children: tema.nombre
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: `text-xs leading-relaxed transition-colors ${temaSeleccionado === tema.id ? "text-blue-200" : "text-blue-300 group-hover:text-blue-100"}`,
                        children: tema.descripcion
                      }
                    )
                  ] })
                ] }),
                temaSeleccionado === tema.id && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 text-xs text-blue-200", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-blue-400 rounded-full animate-pulse" }),
                  /* @__PURE__ */ jsx("span", { children: "Tema seleccionado" })
                ] })
              ]
            },
            tema.id
          )) }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-2", children: /* @__PURE__ */ jsx("div", { className: "text-xs text-blue-400 bg-blue-800/20 px-2 py-1 rounded-full border border-blue-600/20", children: "Desliza para explorar temas →" }) })
        ] })
      ] }),
      estadoGeneracion.estado === "inicial" && temaSeleccionado && /* @__PURE__ */ jsx("div", { className: "text-center mb-6 animate-fade-in", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleGenerarBlog,
          disabled: !temaSeleccionado,
          className: "px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105",
          children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "🚀" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Generar Blog sobre ",
              temaActual?.nombre
            ] })
          ] })
        }
      ) }),
      estadoGeneracion.estado === "generando" && /* @__PURE__ */ jsxs("div", { className: "text-center py-8 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-block relative mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🤖" }) })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Generando artículo..." }),
        /* @__PURE__ */ jsxs("p", { className: "text-blue-200 text-sm", children: [
          "Creando contenido sobre ",
          temaActual?.nombre
        ] })
      ] }),
      estadoGeneracion.estado === "exito" && /* @__PURE__ */ jsxs("div", { className: "bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 text-center animate-fade-in", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl mb-2", children: "🎉" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white mb-2", children: "¡Blog generado exitosamente!" }),
        /* @__PURE__ */ jsx("p", { className: "text-green-200 text-sm", children: "El artículo ha sido publicado y aparece abajo." })
      ] }),
      estadoGeneracion.estado === "error" && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-center animate-fade-in", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl mb-2", children: "❌" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white mb-2", children: "Error al generar el blog" }),
        /* @__PURE__ */ jsx("p", { className: "text-red-200 text-sm mb-3", children: estadoGeneracion.mensaje }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setEstadoGeneracion({ estado: "inicial" }),
            className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors",
            children: "Intentar de nuevo"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-600/30 pt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white", children: temaSeleccionado ? `Blogs sobre ${temaActual?.nombre}` : "Blogs Generados Recientemente" }),
          temaSeleccionado && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTemaSeleccionado(""),
              className: "text-blue-300 hover:text-blue-200 text-sm underline",
              children: "Ver todos"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none",
              style: {
                background: "linear-gradient(to right, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none",
              style: {
                background: "linear-gradient(to left, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)"
              }
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex gap-4 overflow-x-auto py-2 pb-6 px-1 scrollbar-hide hover:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500/50", children: blogsAMostrar.length > 0 ? blogsAMostrar.slice(0, 12).map((blog, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => abrirBlog(blog.id),
              className: "flex-shrink-0 w-72 bg-blue-800/40 backdrop-blur-sm border border-blue-600/50 rounded-lg overflow-hidden hover:border-blue-400/60 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-500/10 group",
              children: [
                blog.imagen_url ? /* @__PURE__ */ jsxs("div", { className: "relative h-40 overflow-hidden", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: blog.imagen_url,
                      alt: blog.titulo,
                      className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                      loading: "lazy",
                      onError: (e) => {
                        e.currentTarget.style.display = "none";
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2 text-xl bg-black/60 backdrop-blur-sm rounded-full p-1.5", children: TEMAS_PREDEFINIDOS.find(
                    (t) => blog.tags?.some((tag) => t.keywords.includes(tag))
                  )?.emoji || "📝" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-blue-400/30", children: TEMAS_PREDEFINIDOS.find(
                    (t) => blog.tags?.some((tag) => t.keywords.includes(tag))
                  )?.nombre || "General" })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "h-40 bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center relative", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-4xl opacity-60", children: TEMAS_PREDEFINIDOS.find(
                    (t) => blog.tags?.some((tag) => t.keywords.includes(tag))
                  )?.emoji || "📝" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-blue-400/30", children: TEMAS_PREDEFINIDOS.find(
                    (t) => blog.tags?.some((tag) => t.keywords.includes(tag))
                  )?.nombre || "General" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
                  /* @__PURE__ */ jsx("h4", { className: "text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors", children: blog.titulo }),
                  /* @__PURE__ */ jsx("p", { className: "text-blue-100 text-xs line-clamp-2 leading-relaxed mb-3", children: blog.resumen }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-blue-300", children: [
                    /* @__PURE__ */ jsx("span", { children: new Date(blog.fecha_publicacion).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric"
                    }) }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      blog.tiempo_lectura,
                      " min"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-blue-400", children: [
                        "👁️ ",
                        blog.vistas
                      ] }),
                      /* @__PURE__ */ jsxs("span", { className: "text-pink-400", children: [
                        "❤️ ",
                        blog.likes
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-lg", children: TEMAS_PREDEFINIDOS.find(
                        (t) => blog.tags?.some((tag) => t.keywords.includes(tag))
                      )?.emoji || "📝" }),
                      /* @__PURE__ */ jsx("span", { className: "text-blue-300 text-xs truncate max-w-20", children: TEMAS_PREDEFINIDOS.find(
                        (t) => blog.tags?.some((tag) => t.keywords.includes(tag))
                      )?.nombre || "General" })
                    ] })
                  ] })
                ] })
              ]
            },
            blog.id
          )) : /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 w-72 h-56 border border-dashed border-blue-500 rounded-lg flex flex-col items-center justify-center text-blue-300", children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: "📝" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-center px-4", children: temaSeleccionado ? `No hay blogs sobre ${temaActual?.nombre}` : "No hay blogs generados aún" })
          ] }) }),
          blogsAMostrar.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-3", children: /* @__PURE__ */ jsx("div", { className: "text-xs text-blue-300 bg-blue-800/30 px-2 py-1 rounded-full border border-blue-600/30", children: "Desliza para ver más →" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-4 border-t border-gray-600/30 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Generados con información actualizada y almacenan base de datos automáticamente" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-1", children: "⚡ Powered by agenterag.com" })
      ] })
    ] })
  ] });
}

const $$Astro$4 = createAstro();
const $$GeneradorBlogIAWrapper = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$GeneradorBlogIAWrapper;
  const { section } = Astro2.props;
  return renderTemplate`<!-- 
  3. Renderizamos el componente React.
  La directiva \`client:load\` es la magia aquí. Le dice a Astro que
  envíe el JavaScript de React al navegador para que el componente
  sea interactivo y toda tu aplicación cobre vida.
-->${maybeRenderHead()}<div class="w-full max-w-8xl mx-auto min-h-[800px] px-4 py-8"> ${renderComponent($$result, "GeneradorBlogIA", GeneradorBlogIA, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/react/GeneradorBlogIA", "client:component-export": "default" })} </div>`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/GeneradorBlogIAWrapper.astro", void 0);

const $$ChatInterfaceWrapper = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="chat-interface-wrapper" class="w-full h-full" data-astro-cid-ra2ekbnz> <!-- El componente React se montará aquí --> </div> ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ChatInterfaceWrapper.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ChatInterfaceWrapper.astro", void 0);

const $$Astro$3 = createAstro();
const $$FAQPart2Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$FAQPart2Content;
  const { section } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="section-inner w-full p-0 m-0 relative overflow-hidden" data-astro-cid-ql5yvob5> <div class="w-full relative z-10" data-astro-cid-ql5yvob5> <!-- Container principal con padding responsive --> <div class="container mx-auto py-6 md:py-10 px-4 md:px-5" data-astro-cid-ql5yvob5> <!-- Grid principal: Texto a la izquierda, Chat a la derecha --> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px]" data-astro-cid-ql5yvob5> <!-- LADO IZQUIERDO: Título "La evolución del FAQ" --> <div class="flex flex-col justify-center space-y-6 lg:space-y-8" data-astro-cid-ql5yvob5> <!-- Título principal en letras grandes --> <div class="space-y-4" data-astro-cid-ql5yvob5> <h2 class="text-7xl md:text-6xl lg:text-7xl xl:text-9xl font-bold leading-tight" data-astro-cid-ql5yvob5> <span class="block text-gray-900 mb-2" data-astro-cid-ql5yvob5>La evolución</span> <span class="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-700" data-astro-cid-ql5yvob5>
del FAQ
</span> </h2> <!-- Línea decorativa --> <div class="w-24 md:w-32 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full" data-astro-cid-ql5yvob5></div> </div> <!-- Subtítulo descriptivo --> <div class="space-y-4" data-astro-cid-ql5yvob5> <p class="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed" data-astro-cid-ql5yvob5>
De preguntas estáticas a conversaciones inteligentes
</p> <p class="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg" data-astro-cid-ql5yvob5>
Los FAQ tradicionales han evolucionado. Ahora puedes tener conversaciones naturales y
              obtener respuestas personalizadas en tiempo real gracias a la IA.
</p> </div> <!-- Características destacadas --> <div class="space-y-3" data-astro-cid-ql5yvob5> <div class="flex items-center space-x-3" data-astro-cid-ql5yvob5> <div class="w-3 h-3 bg-red-500 rounded-full" data-astro-cid-ql5yvob5></div> <span class="text-gray-700 font-medium" data-astro-cid-ql5yvob5>Respuestas instantáneas 24/7</span> </div> <div class="flex items-center space-x-3" data-astro-cid-ql5yvob5> <div class="w-3 h-3 bg-red-500 rounded-full" data-astro-cid-ql5yvob5></div> <span class="text-gray-700 font-medium" data-astro-cid-ql5yvob5>Conversaciones naturales</span> </div> <div class="flex items-center space-x-3" data-astro-cid-ql5yvob5> <div class="w-3 h-3 bg-red-500 rounded-full" data-astro-cid-ql5yvob5></div> <span class="text-gray-700 font-medium" data-astro-cid-ql5yvob5>Aprendizaje continuo</span> </div> </div> <!-- Call to action --> <div class="pt-4" data-astro-cid-ql5yvob5></div> </div> <!-- LADO DERECHO: Chat Interface Claro --> <div class="flex justify-center lg:justify-end" data-astro-cid-ql5yvob5> <div class="w-full max-w-lg lg:max-w-3xl xl:max-w-4xl" data-astro-cid-ql5yvob5> <!-- 🆕 Aumentado de xl:max-w-xl a xl:max-w-2xl --> <!-- Contenedor del chat con efectos visuales --> <div class="relative" data-astro-cid-ql5yvob5> <!-- Efecto de sombra/glow sutil --> <div class="" data-astro-cid-ql5yvob5></div> <!-- Chat container --> <div class="" data-astro-cid-ql5yvob5> ${renderComponent($$result, "ChatInterfaceWrapper", $$ChatInterfaceWrapper, { "data-astro-cid-ql5yvob5": true })} </div> <!-- Elementos decorativos --> <div class="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full opacity-80 animate-pulse" data-astro-cid-ql5yvob5></div> <div class="absolute -bottom-4 -left-4 w-6 h-6 bg-red-300 rounded-full opacity-60 animate-pulse" style="animation-delay: 1s;" data-astro-cid-ql5yvob5></div> </div> </div> </div> </div> <!-- Sección adicional: Comparativa FAQ tradicional vs IA --> <div class="mt-16 lg:mt-24" data-astro-cid-ql5yvob5> <div class="bg-gradient-to-r from-gray-200 to-gray-200 rounded-2xl p-8 md:p-12" data-astro-cid-ql5yvob5> <h3 class="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900" data-astro-cid-ql5yvob5>
FAQ Tradicional vs FAQ con IA
</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-8" data-astro-cid-ql5yvob5> <!-- FAQ Tradicional --> <div class="bg-white rounded-xl p-6 shadow-md" data-astro-cid-ql5yvob5> <div class="flex items-center mb-4" data-astro-cid-ql5yvob5> <div class="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mr-4" data-astro-cid-ql5yvob5> <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ql5yvob5> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-astro-cid-ql5yvob5></path> </svg> </div> <h4 class="text-xl font-semibold text-gray-900" data-astro-cid-ql5yvob5>FAQ Tradicional</h4> </div> <ul class="space-y-3 text-gray-600" data-astro-cid-ql5yvob5> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-400 mt-1" data-astro-cid-ql5yvob5>×</span> <span data-astro-cid-ql5yvob5>Preguntas limitadas y predefinidas</span> </li> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-400 mt-1" data-astro-cid-ql5yvob5>×</span> <span data-astro-cid-ql5yvob5>Respuestas estáticas</span> </li> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-400 mt-1" data-astro-cid-ql5yvob5>×</span> <span data-astro-cid-ql5yvob5>Búsqueda manual</span> </li> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-400 mt-1" data-astro-cid-ql5yvob5>×</span> <span data-astro-cid-ql5yvob5>No contextual</span> </li> </ul> </div> <!-- FAQ con IA --> <div class="bg-gradient-to-br from-white to-white rounded-xl p-6 shadow-md border-2" data-astro-cid-ql5yvob5> <div class="flex items-center mb-4" data-astro-cid-ql5yvob5> <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4" data-astro-cid-ql5yvob5> <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ql5yvob5> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" data-astro-cid-ql5yvob5></path> </svg> </div> <h4 class="text-xl font-semibold text-gray-900" data-astro-cid-ql5yvob5>FAQ con IA</h4> </div> <ul class="space-y-3 text-gray-700" data-astro-cid-ql5yvob5> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-500 mt-1" data-astro-cid-ql5yvob5>✓</span> <span data-astro-cid-ql5yvob5>Conversaciones naturales ilimitadas</span> </li> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-500 mt-1" data-astro-cid-ql5yvob5>✓</span> <span data-astro-cid-ql5yvob5>Respuestas personalizadas</span> </li> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-500 mt-1" data-astro-cid-ql5yvob5>✓</span> <span data-astro-cid-ql5yvob5>Comprensión inteligente</span> </li> <li class="flex items-start space-x-2" data-astro-cid-ql5yvob5> <span class="text-red-500 mt-1" data-astro-cid-ql5yvob5>✓</span> <span data-astro-cid-ql5yvob5>Aprendizaje continuo</span> </li> </ul> </div> </div> </div> </div> </div> </div> </div> `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/FAQPart2Content.astro", void 0);

const $$Astro$2 = createAstro();
const $$ContactoPart2Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$ContactoPart2Content;
  const { section } = Astro2.props;
  const calendarConfig = {
    calendarId: "ricardo.huiscaleo@gmail.com",
    title: "",
    description: "",
    workingHoursStart: 9,
    workingHoursEnd: 20,
    slotDuration: 60,
    accentColor: "#9333EA",
    timeZone: "America/Santiago"
  };
  return renderTemplate`<!-- Contenedor principal con estructura mínima como el ejemplo -->${maybeRenderHead()}<div id="contacto-part2-timeline" class="w-full relative z-10" style="height: 100%; position: relative; margin: 1rem;" data-astro-cid-xgn6zlyd> <div class="timeline-wrapper" data-astro-cid-xgn6zlyd> <h2 class="text-5xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 md:mb-6 leading-tight" data-astro-cid-xgn6zlyd>
Reserva tu consultoría empresarial en tiempo récord
</h2> <div class="max-w-7xl" data-astro-cid-xgn6zlyd> <p class="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 leading-relaxed" data-astro-cid-xgn6zlyd>
Hoy${" "} ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })}${" "}
programar${" "} <span class="animated-gradient-text" style="background-image: linear-gradient(45deg, #22ff6c 0%, #43ffba 25%, #65f0ff 50%, #43ffba 75%, #22ff6c 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline;" data-astro-cid-xgn6zlyd>
reuniones inteligentes
</span>${" "}
con IA es${" "} <span class="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer" data-astro-cid-xgn6zlyd>
simple y automatizado
</span>${" "}
😎.
</p> </div> </div> <div class="mx-auto py-4 md:py-6 lg:py-10 max-w-7xl" style="padding-left: 0rem !important; padding-right: 0rem !important;" data-astro-cid-xgn6zlyd> <!-- Calendario directo integrado --> <div class="calendar-widget-minimal" data-astro-cid-xgn6zlyd> ${renderComponent($$result, "BookingCalendar", null, { "client:only": "react", "calendarId": calendarConfig.calendarId, "title": calendarConfig.title, "description": calendarConfig.description, "accentColor": calendarConfig.accentColor, "workingHoursStart": calendarConfig.workingHoursStart, "workingHoursEnd": calendarConfig.workingHoursEnd, "slotDuration": calendarConfig.slotDuration, "timeZone": calendarConfig.timeZone, "client:component-hydration": "only", "data-astro-cid-xgn6zlyd": true, "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/calendar/BookingCalendar.jsx", "client:component-export": "default" })} </div> <!-- Footer de branding --> <div class="text-center mt-8 pt-4 border-t border-gray-600/30" data-astro-cid-xgn6zlyd> <p class="text-gray-400 text-sm" data-astro-cid-xgn6zlyd>
Sistema de agendamiento automático potenciado con IA + Google Calendar.
</p> <p class="text-gray-400 text-xs mt-1" data-astro-cid-xgn6zlyd>⚡ Powered by agenterag.com</p> </div> </div> </div> `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/ContactoPart2Content.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="footer-enhanced" id="main-footer" data-astro-cid-dwl4onjj> <div class="container-footer" data-astro-cid-dwl4onjj></div> <div class="footer-grid-enhanced" data-astro-cid-dwl4onjj> <!-- Sección Info (igual) --> <div class="footer-section-enhanced collapsible" id="footer-rag-info" data-astro-cid-dwl4onjj> <h6 data-astro-cid-dwl4onjj>Agente RAG<span class="chevron-enhanced" data-astro-cid-dwl4onjj></span></h6> <div class="collapsible-content-enhanced" data-astro-cid-dwl4onjj> <p data-astro-cid-dwl4onjj>
Soluciones en Inteligencia Artificial SPA <br data-astro-cid-dwl4onjj> <strong data-astro-cid-dwl4onjj>78.109.539-7</strong> </p> <p data-astro-cid-dwl4onjj>Patente Comercial: Rol N° 2-199837</p> </div> </div> <!-- Sección Ubicación con CAMBIOS para Carga Diferida --> <div class="footer-section-enhanced collapsible" id="footer-location" data-astro-cid-dwl4onjj> <h6 data-astro-cid-dwl4onjj>Ubicación<span class="chevron-enhanced" data-astro-cid-dwl4onjj></span></h6> <div class="collapsible-content-enhanced footer-location-content" data-astro-cid-dwl4onjj> <p data-astro-cid-dwl4onjj>
Av. Santa Magdalena 75, Oficina 304, Providencia, Región Metropolitana <button class="map-load-button" id="load-map-button" type="button" data-astro-cid-dwl4onjj>Mostrar Mapa</button> </p> <!-- Contenedor donde se insertará el mapa --> <div class="footer-map-placeholder" id="map-placeholder" data-src="https://maps.google.com/maps?q=..." data-astro-cid-dwl4onjj></div> </div> </div> <!-- Sección Legal (igual) --> <div class="footer-section-enhanced collapsible" id="footer-legal" data-astro-cid-dwl4onjj> <h6 data-astro-cid-dwl4onjj>Legal<span class="chevron-enhanced" data-astro-cid-dwl4onjj></span></h6> <ul class="collapsible-content-enhanced" data-astro-cid-dwl4onjj> <li data-astro-cid-dwl4onjj><a href="/politica-de-privacidad" data-astro-cid-dwl4onjj>Política de privacidad</a></li> <li data-astro-cid-dwl4onjj><a href="/terminos-y-condiciones" data-astro-cid-dwl4onjj>Términos y condiciones</a></li> </ul> </div> <!-- Sección Empresa (igual) --> <div class="footer-section-enhanced collapsible" id="footer-empresa" data-astro-cid-dwl4onjj> <h6 data-astro-cid-dwl4onjj>Empresa<span class="chevron-enhanced" data-astro-cid-dwl4onjj></span></h6> <ul class="collapsible-content-enhanced" data-astro-cid-dwl4onjj> <li data-astro-cid-dwl4onjj> <a href="/nosotros-solucionamos-la-automatizacion-de-tareas-administrativas" data-astro-cid-dwl4onjj>Nosotros</a> </li> <li data-astro-cid-dwl4onjj> <a href="/consulta-gratis-soluciones-con-inteligencia-artificial" data-astro-cid-dwl4onjj>Consulta Gratis</a> </li> <li data-astro-cid-dwl4onjj><a href="/faq-agente-rag" data-astro-cid-dwl4onjj>Preguntas Frecuentes</a></li> </ul> </div> <!-- Sección Social (igual) --> <div class="footer-section-enhanced collapsible footer-social-icons" id="footer-social" data-astro-cid-dwl4onjj> <h6 data-astro-cid-dwl4onjj>Social<span class="chevron-enhanced" data-astro-cid-dwl4onjj></span></h6> <div class="collapsible-content-enhanced" data-astro-cid-dwl4onjj> <a href="https://www.linkedin.com/in/rhuiscaleo/" target="_blank" rel="noopener noreferrer" title="Ir a LinkedIn" data-astro-cid-dwl4onjj> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="LinkedIn" data-astro-cid-dwl4onjj> <path fill="currentColor" d="M6.2 21H1.85v-14H6.2v14zM4.02 5.07c-1.39 0-2.52-1.15-2.52-2.55S2.63 0 4.02 0s2.52 1.15 2.52 2.52c0 1.4-1.13 2.55-2.52 2.55zM22.5 21h-4.35v-6.83c0-1.63-.03-3.71-2.26-3.71c-2.26 0-2.6 1.77-2.6 3.6v7H8.93V7h4.17v1.9h.06c.58-1.1 2-2.27 4.17-2.27c4.47 0 5.3 2.94 5.3 6.76V21z" data-astro-cid-dwl4onjj></path> </svg> </a> </div> </div> </div> <!-- Footer branding específico --> <div class="footer-branding-section" data-astro-cid-dwl4onjj> <div class="footer-branding-content" data-astro-cid-dwl4onjj> <p class="footer-value-message" data-astro-cid-dwl4onjj>
Aumentamos el valor agregado de tu servicio con${" "} <span class="footer-gradient-text" data-astro-cid-dwl4onjj>Inteligencia Artificial RAG</span>.
</p> <p class="footer-powered-by" data-astro-cid-dwl4onjj>
⚡ Powered by <span class="footer-brand-name" data-astro-cid-dwl4onjj>agenterag.com</span> 2025
</p> </div> </div> <!-- Script: Original del Acordeón + NUEVA lógica para cargar mapa --> ${renderScript($$result, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/footer/Footer.astro?astro&type=script&index=0&lang.ts")}  </footer>`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/footer/Footer.astro", void 0);

const $$Astro$1 = createAstro();
const $$ContactoPart3Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ContactoPart3Content;
  const { section } = Astro2.props;
  return renderTemplate`<!-- Contenedor principal con estructura optimizada como otras secciones -->${maybeRenderHead()}<div id="contacto-part3-timeline" class="w-full relative z-10" style="height: 100%; position: relative; margin: 2rem; margin-left: 1rem; margin-right: 1rem;" data-astro-cid-iygsxiag> <div class="timeline-wrapper" data-astro-cid-iygsxiag> <!-- Título principal con propiedades CSS específicas --> <h2 class="text-7xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 md:mb-6 leading-tight" data-astro-cid-iygsxiag>
¿Listo para Transformar tu Empresa?
</h2> <div class="max-w-8xl" data-astro-cid-iygsxiag> <p class="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 leading-relaxed" data-astro-cid-iygsxiag>
Agenda tu${" "} <span class="animated-gradient-text" style="background-image: linear-gradient(45deg, #06b6d4 0%, #3b82f6 25%, #8b5cf6 50%, #3b82f6 75%, #06b6d4 100%); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline;" data-astro-cid-iygsxiag>
consulta gratuita personalizada
</span>${" "}
y descubre cómo la${" "} <span class="inline-block bg-gradient-to-r from-white via-gray-100 to-white bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer" data-astro-cid-iygsxiag>
Inteligencia Artificial RAG
</span>${" "}
puede revolucionar tu negocio en 30 días 🚀.
</p> </div> </div> <!-- Contenedor del contenido con márgenes laterales --> <div class="mx-auto pb-4 lg:pb-6 mt-8 px-2" style="max-width: calc(100vw - 2rem);" data-astro-cid-iygsxiag> <!-- Grid principal con tarjetas de contacto --> <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" data-astro-cid-iygsxiag> <!-- Email --> <a href="mailto:contacto@agenterag.com" class="contact-card bg-purple-700/30 backdrop-blur-sm rounded-lg p-4 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 block group hover:bg-purple-700/40" data-astro-cid-iygsxiag> <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3" data-astro-cid-iygsxiag> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-iygsxiag> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" data-astro-cid-iygsxiag></path> </svg> </div> <h3 class="text-base font-semibold text-white mb-1 text-center" data-astro-cid-iygsxiag>Email</h3> <p class="text-purple-200 text-center mb-2 text-sm" data-astro-cid-iygsxiag>Escríbenos directamente</p> <div class="text-center" data-astro-cid-iygsxiag> <span class="text-xs text-purple-300 font-mono bg-purple-900/30 px-2 py-1 rounded-full" data-astro-cid-iygsxiag>
contacto@agenterag.com
</span> </div> </a> <!-- LinkedIn --> <a href="https://www.linkedin.com/in/rhuiscaleo/" target="_blank" rel="noopener noreferrer" class="contact-card bg-purple-700/30 backdrop-blur-sm rounded-lg p-4 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 block group hover:bg-purple-700/40" data-astro-cid-iygsxiag> <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3" data-astro-cid-iygsxiag> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-iygsxiag> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" data-astro-cid-iygsxiag></path> </svg> </div> <h3 class="text-base font-semibold text-white mb-1 text-center" data-astro-cid-iygsxiag>LinkedIn</h3> <p class="text-purple-200 text-center mb-2 text-sm" data-astro-cid-iygsxiag>Conéctate profesionalmente</p> <div class="text-center" data-astro-cid-iygsxiag> <span class="text-xs text-purple-300 font-mono bg-purple-900/30 px-2 py-1 rounded-full" data-astro-cid-iygsxiag>
@rhuiscaleo
</span> </div> </a> </div> <!-- CTA adicional --> <div class="text-center mb-4" data-astro-cid-iygsxiag> <p class="text-base md:text-lg text-purple-200 mb-3" data-astro-cid-iygsxiag>
💡 <span class="font-semibold" data-astro-cid-iygsxiag>Inteligente</span> • 🚀 <span class="font-semibold" data-astro-cid-iygsxiag>Eficiente</span> • ⚡ <span class="font-semibold" data-astro-cid-iygsxiag>Escalable</span> </p> </div> </div> </div> <!-- Footer como wrapper --> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-iygsxiag": true })} `;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/sections/ContactoPart3Content.astro", void 0);

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const sections = [
    { id: "rag", number: "00", title: "Agente RAG", bgColor: "bg-white" },
    { id: "hola", number: "01", title: "Hola", bgColor: "bg-orange-500" },
    { id: "empresa", number: "02", title: "Empresa", bgColor: "bg-green-500" },
    { id: "soluciones", number: "03", title: "Soluciones", bgColor: "bg-gray-500" },
    { id: "blog", number: "04", title: "Blog", bgColor: "bg-blue-600" },
    { id: "faq", number: "05", title: "FAQ", bgColor: "bg-red-500" },
    { id: "contacto", number: "06", title: "Contacto", bgColor: "bg-purple-600" }
  ];
  const sectionParts = {
    hola: 3,
    empresa: 4,
    soluciones: 2,
    blog: 2,
    faq: 2,
    // 🆕 Cambiado de 1 a 2 para incluir FAQ (Parte 2)
    contacto: 3
    // 🆕 Cambiado de 2 a 3 para incluir contacto-part3
  };
  const generateSubtitle = (sectionId, part) => {
    const section = sections.find((s) => sectionId.startsWith(s.id));
    if (!section) return "";
    const isIntroSection = sectionId.endsWith("-intro");
    if (part && !isIntroSection) {
      const currentPartNumber = part.match(/\d+/)?.[0] || "1";
      const totalParts = sectionParts[section.id] || 1;
      return `/${section.title} (Parte ${currentPartNumber} de ${totalParts})`;
    }
    return `Est\xE1s viendo / Secci\xF3n ${section.number} / ${section.title}`;
  };
  const contentSections = [
    {
      id: "rag-home",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "Agente RAG",
        size: "text-[300px]",
        position: "center",
        alignment: "text-center"
      },
      subtitle: {
        text: "Soluciones con Inteligencia Artificial RAG",
        size: "text-[20px]",
        position: "bottom-[220px] inset-x-0 md:bottom-5 md:left-auto md:right-5",
        alignment: "text-center md:text-right",
        hasClaim: true
      },
      bgColor: "bg-white",
      height: "h-[750px]"
    },
    {
      id: "hola-intro",
      number: { text: "", size: "text-[14px]", position: "top-0 left-0", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[180px]",
        position: "bottom-12 left-12",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("hola"),
        size: "text-xs",
        position: "inset-y-0 left-1 flex items-center",
        alignment: "text-right",
        hasClaim: true
      },
      parrafo: {
        text: "",
        size: "text-base",
        position: "top-20 left-5",
        alignment: "text-left",
        hasClaim: false
      },
      bgColor: "bg-orange-500",
      height: "h-[30px]"
    },
    {
      id: "hola-part1",
      number: { text: "01", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "Hola",
        size: "text-[300px]",
        position: "bottom-5 left-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("hola", "Parte 1"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-orange-500",
      height: "h-[900px]"
    },
    {
      id: "hola-part2",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5",
        alignment: "text-left",
        style: "font-size: 200px"
      },
      subtitle: {
        text: generateSubtitle("hola", "Parte 2"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      parrafos: [],
      bgColor: "bg-transparent",
      height: "h-[900px] md:h-auto",
      border: "border border-gray-400",
      layout: "custom",
      rows: 3,
      showDivider: true
    },
    {
      id: "hola-part3",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5 right-5",
        alignment: "text-left",
        style: "font-size: 200px"
      },
      subtitle: {
        text: generateSubtitle("hola", "Parte 3"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      parrafos: [],
      bgColor: "bg-transparent",
      height: "h-auto",
      rows: 3,
      showDivider: true,
      customBgClass: "hola-part3-bg"
    },
    {
      id: "empresa-intro",
      number: { text: "", size: "text-[14px]", position: "top-0 left-0", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[180px]",
        position: "bottom-12 left-12",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("empresa"),
        size: "text-xs",
        position: "inset-y-0 left-1 flex items-center",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-green-500",
      height: "h-[30px]"
    },
    {
      id: "empresa-part1",
      number: { text: "02", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "Empresa",
        size: "text-[300px]",
        position: "bottom-5 left-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("empresa", "Parte 1"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-green-500",
      height: "h-[800px]"
    },
    {
      id: "empresa-part2",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5 right-5",
        alignment: "text-left",
        style: "font-size: 200px"
      },
      subtitle: {
        text: generateSubtitle("empresa", "Parte 2"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      parrafos: [],
      bgColor: "bg-transparent",
      height: "h-auto",
      rows: 3,
      showDivider: true,
      customBgClass: "empresa-part2-bg"
    },
    {
      id: "empresa-part3",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5 right-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("empresa", "Parte 3"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-green-500",
      height: "h-auto"
    },
    {
      id: "empresa-part4",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5 right-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("empresa", "Parte 4"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-green-600",
      height: "h-auto"
    },
    {
      id: "soluciones-intro",
      number: { text: "", size: "text-[14px]", position: "top-0 left-0", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[180px]",
        position: "bottom-12 left-12",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("soluciones"),
        size: "text-xs",
        position: "inset-y-0 left-1 flex items-center",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-gray-500",
      height: "h-[30px]"
    },
    {
      id: "soluciones-part1",
      number: { text: "03", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "Soluciones",
        size: "text-[300px]",
        position: "bottom-5 left-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("soluciones", "Parte 1"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-gray-500",
      height: "h-[800px]"
    },
    {
      id: "soluciones-part2",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5 right-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("soluciones", "Parte 2"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-gray-600",
      height: "h-auto",
      customBgClass: "soluciones-part2-bg"
    },
    {
      id: "blog-intro",
      number: { text: "", size: "text-[14px]", position: "top-0 left-0", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[180px]",
        position: "bottom-12 left-12",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("blog"),
        size: "text-xs",
        position: "inset-y-0 left-1 flex items-center",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-blue-600",
      height: "h-[30px]"
    },
    {
      id: "blog-part1",
      number: { text: "04", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "Blog",
        size: "text-[300px]",
        position: "bottom-5 left-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("blog", "Parte 1"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-blue-600",
      height: "h-[800px]"
    },
    {
      id: "blog-part2",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5 right-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("blog", "Parte 2"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-blue-700",
      height: "h-auto"
    },
    {
      id: "faq-intro",
      number: { text: "", size: "text-[14px]", position: "top-0 left-0", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[180px]",
        position: "bottom-12 left-12",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("faq"),
        size: "text-xs",
        position: "inset-y-0 left-1 flex items-center",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-red-500",
      height: "h-[30px]"
    },
    {
      id: "faq-part1",
      number: { text: "05", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "FAQ",
        size: "text-[300px]",
        position: "bottom-5 left-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("faq", "Parte 1"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-red-500",
      height: "h-[800px]"
    },
    {
      id: "faq-part2",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[200px]",
        position: "top-5 left-5 right-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("faq", "Parte 2"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-white",
      height: "h-auto",
      border: "border-2 border-red-400"
      // 🆕 Borde rojo agregado
    },
    {
      id: "contacto-intro",
      number: { text: "", size: "text-[14px]", position: "top-0 left-0", alignment: "text-left" },
      title: {
        text: "",
        size: "text-[180px]",
        position: "bottom-12 left-12",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("contacto"),
        size: "text-xs",
        position: "inset-y-0 left-1 flex items-center",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-purple-600",
      height: "h-[30px]"
    },
    {
      id: "contacto-part1",
      number: { text: "06", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: {
        text: "Contacto",
        size: "text-[300px]",
        position: "bottom-5 left-5",
        alignment: "text-left"
      },
      subtitle: {
        text: generateSubtitle("contacto", "Parte 1"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-purple-600",
      height: "h-[800px]"
    },
    {
      id: "contacto-part2",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: { text: "", size: "text-[300px]", position: "bottom-5 left-5", alignment: "text-left" },
      subtitle: {
        text: generateSubtitle("contacto", "Parte 2"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-purple-600",
      height: "h-auto",
      customBgClass: "contacto-part2-bg"
    },
    {
      id: "contacto-part3",
      number: { text: "", size: "text-[120px]", position: "top-5 left-5", alignment: "text-left" },
      title: { text: "", size: "text-[300px]", position: "bottom-5 left-5", alignment: "text-left" },
      subtitle: {
        text: generateSubtitle("contacto", "Parte 3"),
        size: "text-[16px]",
        position: "top-0 right-0",
        alignment: "text-right",
        hasClaim: true
      },
      bgColor: "bg-purple-800/30",
      height: "h-auto",
      border: "border-2 border-purple-800",
      // 🆕 Borde rojo agregado
      customBgClass: "contacto-part3-blur-bg"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Agente RAG - Soluciones con Inteligencia Artificial" }, { "default": ($$result2) => renderTemplate`  ${renderScript($$result2, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/index.astro?astro&type=script&index=0&lang.ts")} ${maybeRenderHead()}<div class="layout-container"> ${renderComponent($$result2, "CursorOptimizerWrapper", $$CursorOptimizerWrapper, { "showMarkers": false })} <aside class="sidebar"> <nav class="nav-container"> ${sections.map((section) => renderTemplate`${renderComponent($$result2, "NavCard", $$NavCard, { "sectionId": section.id, "number": section.number, "title": section.title, "bgColor": section.bgColor, "hoverColor": "" })}`)} </nav> </aside> <main class="main-content"> ${contentSections.map((section) => renderTemplate`<section${addAttribute(section.id, "id")}${addAttribute([
    `content-section ${section.bgColor} ${section.height}`,
    "relative",
    {
      "text-gray-900": section.bgColor === "bg-white" || section.bgColor === "bg-transparent",
      "text-white": section.bgColor !== "bg-white" && section.bgColor !== "bg-transparent"
    },
    section.border ?? "",
    section.layout === "rows" ? `section-rows section-rows-${section.rows}` : "",
    section.layout === "columns" ? `section-columns section-columns-${section.columns}` : "",
    section.backgroundStyle || "",
    section.customBgClass
  ], "class:list")}> ${section.id === "rag-home" ? renderTemplate`${renderComponent($$result2, "AuroraBackground", AuroraBackground, { "className": "w-full h-full", "showRadialGradient": false, "mouseActivatedOnDesktop": true, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/ui/aurora-background", "client:component-export": "AuroraBackground" }, { "default": ($$result3) => renderTemplate` <div class="section-inner relative z-10"> <div class="absolute bottom-[120px] left-1/2 transform -translate-x-1/2 md:bottom-[5px] md:left-5 md:transform-none z-20"> ${" "} <img src="/compressed/logo-oscuro-optimizado.png" alt="Logo AR" class="ar-logo w-auto h-[40px] md:h-[40px] transition-all duration-300 opacity-70" id="ar-logo">${" "} </div> ${section.subtitle.text && renderTemplate`<div${addAttribute(`absolute ${section.subtitle.position} ${section.subtitle.alignment}`, "class")}> ${" "} <p${addAttribute(`section-subtitle ${section.subtitle.hasClaim ? "claim-text" : ""}`, "class")}> ${" "} ${renderComponent($$result3, "GradientText", null, { "client:only": "react", "className": "animated-gradient-text", "colors": ["#9C8AC0", "#78A8D6", "#ACDED8", "#ED645A", "#FF8C00"], "darkModeColors": ["#9C8AC0", "#78A8D6", "#ACDED8", "#ED645A", "#FF8C00"], "showShimmer": true, "shimmerIntensity": "low", "enhancedContrast": false, "id": "gradient-text-rag-home", "client:component-hydration": "only", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/text/GradientText.jsx", "client:component-export": "default" }, { "default": ($$result4) => renderTemplate`${" "}${section.subtitle.text}${" "}` })}${" "} </p>${" "} </div>`} <div class="flex items-center justify-center h-full w-full"> ${" "} <div class="text-pressure-wrapper"> ${" "} ${renderComponent($$result3, "TextPressureWrapper", $$TextPressureWrapper, {})}${" "} </div>${" "} </div> <div${addAttribute(`absolute ${section.number.position} ${section.number.alignment}`, "class")}> ${" "} <h1 class="section-number font-bold font-mono" style="font-family: 'SF Mono', SFMono-Regular, ui-monospace, Monaco, monospace;"> ${" "} ${section.number.text}${" "} </h1>${" "} </div> </div> ` })}` : renderTemplate`<div class="section-inner relative"> ${section.subtitle.text && renderTemplate`<div${addAttribute(`absolute ${section.subtitle.position} ${section.subtitle.alignment}`, "class")}> ${" "} <p${addAttribute(`section-subtitle ${section.subtitle.hasClaim ? "claim-text" : ""}`, "class")}> ${" "} ${section.id === "rag-home" ? renderTemplate`${renderComponent($$result2, "GradientText", null, { "client:only": "react", "className": "animated-gradient-text", "colors": ["#9C8AC0", "#78A8D6", "#ACDED8", "#ED645A", "#FF8C00"], "darkModeColors": ["#9C8AC0", "#78A8D6", "#ACDED8", "#ED645A", "#FF8C00"], "showShimmer": true, "shimmerIntensity": "low", "enhancedContrast": false, "id": "gradient-text-conditional", "client:component-hydration": "only", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/text/GradientText.jsx", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate`${" "}${section.subtitle.text}${" "}` })}` : section.subtitle.text}${" "} </p>${" "} </div>`} ${(section.id === "hola-part1" || section.id === "empresa-part1" || section.id === "soluciones-part1" || section.id === "blog-part1" || section.id === "faq-part1" || section.id === "contacto-part1") && renderTemplate`<div class="absolute inset-0 z-0 w-full h-full"> ${" "} ${renderComponent($$result2, "AstroP5Container", $$AstroP5Container, { "fullWidth": true, "fullHeight": true, "isFixed": true, "class": "w-full h-full", "sectionId": section.id })}${" "} </div>`}  ${section.id === "hola-part2" && renderTemplate`${renderComponent($$result2, "HolaPart2Content", $$HolaPart2Content, { "section": section })}`} ${section.id === "hola-part3" && renderTemplate`${renderComponent($$result2, "HolaPart3Content", $$HolaPart3Content, { "section": section })}`} ${section.id === "empresa-part2" && renderTemplate`${renderComponent($$result2, "EmpresaPart2Content", $$EmpresaPart2Content, { "section": section })}`} ${section.id === "empresa-part3" && renderTemplate`${renderComponent($$result2, "EmpresaPart3Content", $$EmpresaPart3Content, { "section": section })}`} ${section.id === "empresa-part4" && renderTemplate`${renderComponent($$result2, "EmpresaPart4Content", $$EmpresaPart4Content, { "section": section })}`} ${section.id === "soluciones-part2" && renderTemplate`${renderComponent($$result2, "SolucionesPart2Content", $$SolucionesPart2Content, { "section": section })}`} ${section.id === "blog-part2" && renderTemplate`${renderComponent($$result2, "GeneradorBlogIAWrapper", $$GeneradorBlogIAWrapper, { "section": section })}`} ${section.id === "faq-part2" && renderTemplate`${renderComponent($$result2, "FAQPart2Content", $$FAQPart2Content, { "section": section })}`} ${section.id === "contacto-part2" && renderTemplate`${renderComponent($$result2, "ContactoPart2Content", $$ContactoPart2Content, { "section": section })}`} ${section.id === "contacto-part3" && renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "ChladniBackgroundOptimized", $$ChladniBackgroundOptimized, { "particleCount": 1500, "opacity": 0.4, "speed": 0.6, "colors": ["#7c3aed", "#a855f7", "#c084fc", "#e879f9", "#ddd6fe"] })} ${renderComponent($$result3, "ContactoPart3Content", $$ContactoPart3Content, { "section": section })} ` })}`}  ${section.parrafos && section.parrafos.length > 0 ? section.parrafos.map((item) => renderTemplate`<div${addAttribute(`absolute ${item.position} ${item.alignment}`, "class")}> ${" "} <p class="section-parrafo"${addAttribute({
    fontSize: item.size.includes("text-[") ? `clamp(40px, 15vw, ${item.size.match(/\[(.*?)\]/)?.[1] ?? "40px"})` : void 0
  }, "style")}> ${" "} ${item.text}${" "} </p>${" "} </div>`) : section.parrafo && section.parrafo.text ? renderTemplate`<div${addAttribute(`absolute ${section.parrafo.position} ${section.parrafo.alignment}`, "class")}> ${" "} <p class="section-parrafo"${addAttribute({
    fontSize: section.parrafo.size.includes("text-[") ? `clamp(40px, 15vw, ${section.parrafo.size.match(/\[(.*?)\]/)?.[1] ?? "40px"})` : void 0
  }, "style")}> ${" "} ${section.parrafo.text}${" "} </p>${" "} </div>` : null} ${section.id !== "rag-home" && renderTemplate`<div${addAttribute(`absolute ${section.title.position} ${section.title.alignment}`, "class")}> ${" "} <h2 class="section-title font-bold">${section.title.text}</h2>${" "} </div>`} <div${addAttribute(`absolute ${section.number.position} ${section.number.alignment}`, "class")}> ${" "} <h1 class="section-number font-bold font-mono" style="font-family: 'SF Mono', SFMono-Regular, ui-monospace, Monaco, monospace;"> ${" "} ${section.number.text}${" "} </h1>${" "} </div> </div>`} </section>`)} </main> </div> ${renderScript($$result2, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/index.astro?astro&type=script&index=1&lang.ts")} ` })}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/index.astro", void 0);

const $$file = "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
