import{r as b}from"./index.Bd8wGOW-.js";import{S as C,g as y}from"./ScrollTrigger.CKx49QUS.js";import"./_commonjsHelpers.D6-XlEtG.js";import"./index.c0qeY2gs.js";function k({showMarkers:c=!1}){const w=b.useRef(!1),p=b.useRef({}),n=(d,i,m="log",e=5e3)=>{if(!c)return;const r=Date.now();(!p.current[d]||r-p.current[d]>e)&&(console[m](`[CursorOptimizer] ${i}`),p.current[d]=r)};return b.useEffect(()=>{if(w.current)return;w.current=!0;const d=async()=>{if(y.registerPlugin(C),c){const e=document.createElement("style");e.textContent=`
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
        `,document.head.appendChild(e)}else{const e=document.createElement("style");e.textContent=`
          /* Eliminar texto de depuración en entorno de producción */
          .gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end,
          .section-debug-label, .debug-section-overlay, [data-section-label] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `,document.head.appendChild(e)}setTimeout(()=>{const e=document.querySelectorAll('[id$="-part1"]');if(!window._P5CursorInstances){window._P5CursorInstances={},n("init","Inicializando contexto global de cursores");return}n("setup",`Configurando optimización para ${e.length} secciones`),document.querySelectorAll(".section-debug-label, .debug-section-overlay, [data-section-label]").forEach(r=>r.remove()),e.forEach(r=>{const t=r.id,o=t.split("-")[0];C.create({trigger:r,start:"top 80%",end:"bottom 20%",markers:c,id:`cursor-${o}`,toggleClass:{targets:r,className:"cursor-active"},onEnter:()=>{n(`enter-${o}`,`Activando cursor para ${t}`,"log",3e3),i(t,!0)},onLeave:()=>{n(`leave-${o}`,`Desactivando cursor para ${t}`,"log",3e3),i(t,!1)},onEnterBack:()=>{n(`enterback-${o}`,`Reactivando cursor para ${t}`,"log",3e3),i(t,!0)},onLeaveBack:()=>{n(`leaveback-${o}`,`Desactivando cursor para ${t}`,"log",3e3),i(t,!1)}})}),m()},1500)},i=(e,r)=>{const t=e.split("-")[0];if(!window._P5CursorInstances||Object.keys(window._P5CursorInstances).length===0)return n("error-no-instances","No hay instancias de cursores disponibles","warn",1e4),!1;const o=document.querySelector(`[data-section-id="${e}"]`)||document.querySelector(`[data-section-id="${t}"]`);if(o){const a=o.getAttribute("data-react-id");if(a&&window._P5CursorInstances[a])try{return window._P5CursorInstances[a].setActive(r),c&&(r?o.style.outline="2px solid rgba(0, 255, 0, 0.3)":o.style.outline="none"),n(`success-${t}`,`✅ Cursor ${r?"activado":"desactivado"} correctamente`,"log",5e3),!0}catch(s){n("error-setactive",`Error al cambiar estado del cursor: ${s.message}`,"error",1e4)}}let u=!1;for(const a in window._P5CursorInstances){const s=window._P5CursorInstances[a];if(s&&typeof s.setActive=="function"){const l=s.sectionId||"";if(l===e||l===t||l.includes(t)||t.includes(l))try{if(s.setActive(r),c){const g=`p5-container-${l}`,f=document.getElementById(g)||document.querySelector(`[data-section-id="${l}"]`);f&&(r?f.style.outline="2px solid rgba(0, 255, 0, 0.3)":f.style.outline="none")}u=!0}catch(g){n("error-instance",`Error en instancia ${a}: ${g.message}`,"error",1e4)}}}if(!u&&(t==="hola"||e==="hola-part1"))for(const a in window._P5CursorInstances)try{window._P5CursorInstances[a].setActive(r),u=!0}catch(s){n("error-fallback",`Error en fallback: ${s.message}`,"error",1e4)}return u||n(`notfound-${t}`,`⚠️ No se encontró cursor para ${e}`,"warn",8e3),u},m=()=>{document.addEventListener("navCardStateChanged",e=>{if(n("nav-change",`Navegación cambió a sección: ${e.detail?.sectionId}`,"log",2e3),window._P5CursorInstances&&Object.keys(window._P5CursorInstances).forEach(r=>{const t=window._P5CursorInstances[r];t&&typeof t.setActive=="function"&&t.setActive(!1)}),e.detail&&e.detail.sectionId){const r=`${e.detail.sectionId}-part1`;i(r,!0)}})};return d(),()=>{C.getAll().filter(e=>e.id&&e.id.startsWith("cursor-")).forEach(e=>e.kill())}},[c]),null}export{k as default};
