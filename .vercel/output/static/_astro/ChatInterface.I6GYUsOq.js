import{j as i}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.Bd8wGOW-.js";import{S as $}from"./animated-tooltip.C9LK3Wtw.js";import"./_commonjsHelpers.D6-XlEtG.js";import"./index.c0qeY2gs.js";const se=()=>{const w=n.useRef(null),a=n.useRef(null),C=n.useRef(null),_=n.useRef(null),F=n.useRef(null),B=n.useRef(null);n.useRef(null),n.useRef(null),n.useRef(null);const[Z,W]=n.useState(!1),[j,z]=n.useState(!1),[G,U]=n.useState(0),h=n.useRef(null),I=n.useRef(null),E=n.useRef(null),K="https://primary-production-33e8.up.railway.app/webhook/8e1404f9-1d5d-4126-b321-df21a22bc27c",H=["Hola, ¿cómo están? Me gustaría agendar una reunión con el área comercial. Mi nombre es:","Me gustaría conocer más sobre los servicios que ofrecen para mi empresa. Mi nombre es:","Estoy interesado en aprender más sobre Agente RAG para implementarlo en mi negocio. Mi nombre es:","Quisiera conocer los costos asociados con la implementación de sus soluciones. Mi nombre es:","Necesito automatizar procesos en mi empresa y estoy buscando asesoría. Mi nombre es:","Me interesa conocer qué tipos de integraciones ofrecen con sistemas existentes. Mi nombre es:","Estoy buscando mejorar la experiencia de mis clientes con herramientas de IA. Mi nombre es:"],J=()=>{a.current&&(k(),a.current.value=H[G],y(),a.current.focus(),U(e=>(e+1)%H.length))},R=["Hola, ¿cómo estás?","Pregúntame sobre IA RAG","Agenda una reunión","Consulta por servicios","Necesito ayuda","Conversemos sobre tu negocio"],L="Escribe tu mensaje...",b=n.useRef(0),f=n.useRef(""),x=n.useRef(null),m=n.useRef(null),V=()=>{const e=a.current;if(e&&e.value===""&&document.activeElement!==e&&!e.classList.contains("placeholder-blur-transition")){const t=e.placeholder;e.placeholder=t.endsWith("|")?f.current:f.current+"|"}},Y=()=>{const e=a.current;e&&(e.value===""&&document.activeElement!==e?(e.classList.add("placeholder-blur-transition"),m.current&&clearInterval(m.current),m.current=null,e.placeholder=f.current,setTimeout(()=>{b.current=(b.current+1)%R.length,f.current=R[b.current],e.placeholder=f.current,setTimeout(()=>{e.classList.remove("placeholder-blur-transition"),D()},250)},150)):(x.current&&clearInterval(x.current),x.current=null,e.value===""&&(e.placeholder=L)))},D=()=>{const e=a.current;e&&(m.current&&clearInterval(m.current),e.value===""&&document.activeElement!==e&&!e.classList.contains("placeholder-blur-transition")&&(f.current=R[b.current],e.placeholder=f.current+"|",m.current=setInterval(V,530)))},T=()=>{const e=a.current;e&&(k(),e.value===""&&document.activeElement!==e&&(b.current=Math.floor(Math.random()*R.length),f.current=R[b.current],D(),x.current=setInterval(Y,3800)))},k=()=>{const e=a.current;e&&(clearInterval(m.current),clearInterval(x.current),m.current=null,x.current=null,e.classList.remove("placeholder-blur-transition"),e.value===""&&(e.placeholder=L))},y=()=>{const e=a.current;e&&(e.style.height="auto",e.style.height=e.scrollHeight+"px")},Q=()=>{const e=w.current;if(!e)return;const t=e.querySelector("h2");if(t&&(t.style.display="none"),E.current)return;const o=document.createElement("div");o.classList.add("message","bot"),e.appendChild(o),E.current=o;const r=document.createElement("div");r.classList.add("bot-typing-status-container"),o.appendChild(r);const s=document.createElement("span");s.classList.add("bot-typing-indicator"),r.appendChild(s);const l=document.createElement("span");l.classList.add("bot-status-text"),l.textContent="Pensando...",l.classList.add("shimmer-animation"),r.appendChild(l),I.current=l,e.scrollTop=e.scrollHeight;let c=0;h.current&&clearInterval(h.current),h.current=setInterval(()=>{if(!I.current){clearInterval(h.current);return}c++;let d="";c>=19?d="Elaborando respuesta":c>=15?d="Revisando trabajo Agentes RAG":c>=10?d="Consultando Agentes RAG":c>=4?d="Buscando conversaciones":d="Pensando...",I.current.textContent!==d&&(I.current.textContent=d)},1e3)},N=()=>{h.current&&clearInterval(h.current),h.current=null,E.current&&(E.current.remove(),E.current=null),I.current=null},O=async()=>{const e=a.current,t=C.current,o=w.current;if(!e||!t||!o||t.disabled||j)return;const r=e.value.trim();if(r){k(),X(r),e.value="",y(),e.placeholder=L,t.classList.add("plane-flying"),t.disabled=!0,z(!0),Q();try{let s=localStorage.getItem("session_id");s||(s=crypto.randomUUID().replace(/-/g,""),localStorage.setItem("session_id",s));const l=await fetch(K,{method:"POST",headers:{"Content-Type":"application/json","x-session-id":s},body:JSON.stringify({message:r})});if(N(),l.ok){const c=await l.json();let d=c.output||Array.isArray(c)&&c.length>0&&c[0].output||"";await A(d||"...","bot")}else console.error("Server error:",l.status),await A("Error al obtener respuesta del servidor.","bot")}catch(s){console.error("Fetch Error:",s),N(),await A("Error de conexión. Inténtalo de nuevo.","bot")}finally{t.classList.remove("plane-flying"),t.disabled=!1,z(!1),e.value===""&&document.activeElement!==e&&T(),e.focus()}}},X=e=>{const t=w.current;if(!t)return;const o=t.querySelector("h2");o&&o.style.display!=="none"&&(o.style.display="none");const r=document.createElement("div");r.classList.add("message","user"),r.textContent=e,t.appendChild(r),t.scrollTop=t.scrollHeight},A=(e,t)=>new Promise(o=>{const r=w.current;if(!r){o();return}const s=document.createElement("div");s.classList.add("message",t),r.appendChild(s);const l=document.createElement("div");l.innerHTML=e.replace(/<script.*?>.*?<\/script>/gi,"");const c=Array.from(l.childNodes);function d(u,M,v){if(u.nodeType===Node.TEXT_NODE){let p=function(){q<g.length?(S.textContent+=g.charAt(q++),r.scrollTop=r.scrollHeight,setTimeout(p,12)):v()};const g=u.textContent||"";if(g.trim()===""){v();return}const S=document.createElement("span");M.appendChild(S);let q=0;p()}else if(u.nodeType===Node.ELEMENT_NODE){const p=document.createElement(u.tagName);for(let S of u.attributes)p.setAttribute(S.name,S.value);M.appendChild(p);const g=Array.from(u.childNodes);P(g,p,v)}else v()}function P(u,M,v){let p=0;function g(){p<u.length?d(u[p++],M,g):v()}g()}P(c,s,o)});return n.useRef(0),n.useEffect(()=>{const e=a.current;C.current;const t=_.current,o=F.current;B.current,e&&e.value===""&&T();const r=s=>{t&&o&&!t.contains(s.target)&&!o.contains(s.target)&&W(!1)};return document.addEventListener("click",r),y(),window.addEventListener("resize",y),()=>{console.log("ChatInterface: Limpiando efectos y listeners..."),k(),document.removeEventListener("click",r),window.removeEventListener("resize",y),N()}},[]),i.jsxs("div",{className:"chat-container",style:{width:"100%",height:"600px",margin:"0",background:"transparent",display:"flex",flexDirection:"column",justifyContent:"space-between",overflow:"hidden",position:"relative",border:"none",boxSizing:"border-box",paddingLeft:"10px",paddingRight:"10px"},children:[i.jsx("div",{className:"chat-messages",id:"chatMessages",ref:w,style:{flex:1,padding:"10px",overflowY:"auto",background:"transparent",display:"flex",flexDirection:"column",position:"relative",boxSizing:"border-box",paddingLeft:"5px",paddingRight:"5px"}}),i.jsx("div",{className:"chat-input-container",style:{display:"flex",flexDirection:"column",width:"calc(100% - 20px)",marginLeft:"18px",marginRight:"18px",marginBottom:"10px",position:"relative"},children:i.jsxs("div",{className:"textarea-container",style:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:"30px",boxShadow:"0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)",padding:"10px",position:"relative",display:"flex",alignItems:"center"},children:[i.jsx($,{content:"Iniciadores de conversación",children:i.jsxs("button",{className:"quick-button",ref:B,onClick:e=>{e.stopPropagation(),J()},"aria-label":"Iniciadores de conversación",style:{background:"#000",border:"none",borderRadius:"50%",padding:"8px",width:"34px",height:"34px",display:"flex",justifyContent:"center",alignItems:"center",fontSize:"14px",cursor:"pointer",transition:"all 0.2s ease",color:"#fff",marginRight:"8px",flexShrink:0,position:"relative",overflow:"hidden"},children:[i.jsx("div",{className:"bulb-container",style:{position:"relative",zIndex:2},children:i.jsx("span",{role:"img","aria-label":"light bulb",style:{fontSize:"16px",position:"relative",zIndex:2},className:"bulb-emoji",children:"💡"})}),i.jsx("div",{className:"glow-effect",style:{position:"absolute",top:"-10%",left:"-10%",width:"120%",height:"120%",background:"radial-gradient(circle, rgba(255,255,0,0.5) 0%, rgba(0,0,0,0) 70%)",opacity:0,transition:"opacity 0.3s ease",zIndex:1}})]})}),i.jsx("textarea",{id:"userInput",ref:a,rows:"1",placeholder:L,onInput:y,onKeyDown:e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),C.current.disabled||O())},onFocus:()=>k(),onBlur:()=>{a.current.value===""&&T()},style:{flex:"1 1 auto",border:"none",resize:"none",fontSize:"14px",outline:"none",background:"transparent",color:"#333",boxSizing:"border-box",padding:"6px",paddingRight:"44px",minHeight:"40px",height:"auto",overflowY:"auto",lineHeight:"1.4"}}),i.jsx("div",{style:{position:"absolute",right:"10px",width:"34px",height:"34px",cursor:"pointer",zIndex:1e4},children:i.jsx("button",{className:`send-icon-container ${j?"plane-flying":""}`,id:"sendBtn",ref:C,onClick:O,disabled:j,style:{width:"100%",height:"100%",background:"#000",border:"none",color:"#fff",borderRadius:"50%",display:"flex",justifyContent:"center",alignItems:"center",overflow:"hidden",padding:0,boxShadow:"0 2px 4px rgba(0,0,0,0.1)",cursor:"pointer !important"},children:i.jsx("svg",{className:"send-icon",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",style:{display:"block",transition:"transform 0.3s ease"},children:i.jsx("path",{d:"M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"})})})})]})}),i.jsx("style",{jsx:"true",children:`
        /* Estilos originales del chat - Mantenidos */
        .chat-container {
          /* width, height, margin, padding, etc. están en inline style */
        }
        /* Media queries para altura en pantallas grandes - Mover a CSS global o archivo .css */
        /* @media (min-width: 1024px) { .chat-container { height: 900px; } } */

        .chat-messages {
          /* flex, padding, overflow, etc. están en inline style */
        }

        .message {
          margin-bottom: 10px;
          padding: 10px 15px;
          border-radius: 8px;
          max-width: 100%;
          word-wrap: break-word;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          font-size: 0.95rem;
          line-height: 1.4;
          position: relative;
          box-sizing: border-box;
        }
        .message.user {
          background: #e1e1e1;
          color: #000;
          align-self: flex-end;
          border-bottom-right-radius: 5px;
        }
        .message.bot {
          background: transparent !important; /* Asegurar transparencia */
          box-shadow: none; /* Eliminar sombra */
          color: #000;
          align-self: flex-start;
          border-radius: 0; /* Eliminar border-radius por defecto */
        }
        .message.bot strong,
        .message.bot b {
          color: #007bff;
        }

        /* --- ESTILOS PLACEHOLDER DINÁMICO --- */
        #userInput::placeholder {
          color: #999;
          transition:
            color 0.2s ease-in-out,
            filter 0.25s ease-out;
          vertical-align: middle;
          filter: blur(0px);
        }
        #userInput.placeholder-blur-transition::placeholder {
          filter: blur(3px);
          transition:
            filter 0.15s ease-in,
            color 0.15s ease-in;
          color: rgba(153, 153, 153, 0.5);
        }
        #userInput {
          /* transition y filter controlados por JS/clase */
          transition: filter 0.25s ease-out;
          filter: blur(0px);
        }
        /* --- FIN ESTILOS PLACEHOLDER --- */

        /* Animación del avión de papel */
        @keyframes planeFlight {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-40deg);
          }
          50% {
            transform: rotate(10deg);
          }
          75% {
            transform: rotate(-40deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .plane-flying .send-icon {
          animation: planeFlight 1.2s infinite ease-in-out;
        }

        .chat-input {
          /* background, border, radius, shadow, etc. están en inline style */
        }
        .input-top {
          /* display, width están en inline style */
        }
        .input-top textarea {
          /* flex, border, resize, etc. están en inline style */
        }
        .input-bottom {
          /* display, justify, align, etc. están en inline style */
        }
        .left-buttons {
          /* display, gap, position están en inline style */
        }

        .quick-button {
          position: relative;
          overflow: hidden;
        }

        .quick-button:hover .glow-effect {
          opacity: 1;
        }

        /* Animación de brillo para la bombilla */
        @keyframes pulse-glow {
          0% {
            filter: drop-shadow(0 0 2px rgba(255, 255, 0, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 5px rgba(255, 255, 0, 0.9));
          }
          100% {
            filter: drop-shadow(0 0 2px rgba(255, 255, 0, 0.7));
          }
        }

        .quick-button:hover .bulb-emoji {
          animation: pulse-glow 2s infinite;
        }

        .send-icon-container {
          /* background, border, color, radius, etc. están en inline style */
          transition: background-color 0.2s ease; /* Mantener transición de hover */
          position: relative; /* Mantener position */
          overflow: hidden; /* Mantener overflow */
        }
        .send-icon-container:hover:not(:disabled) {
          background-color: #333;
        } /* Hover solo si no está deshabilitado */
        .send-icon-container:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        } /* Estilo para deshabilitado */

        .send-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
        }
        .send-icon-container:hover .send-icon {
          transform: scale(1.2);
          transform: rotate(-40deg);
        } /* Hover para icono de envío */

        /* Texto SEO oculto */
        .seo-text-container {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .seo-text-container p,
        .seo-text-container ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        /* Indicador de typing del bot */
        .bot-typing-indicator {
          display: inline-block;
          width: 1em;
          height: 1em;
          background-color: #007bff;
          border-radius: 50%;
          vertical-align: bottom;
          margin-left: 0.2em;
          animation: typingBlink 1s infinite ease-in-out;
        }
        @keyframes typingBlink {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
        }

        /* Contenedor para el indicador y texto de estado */
        .bot-typing-status-container {
          display: flex;
          align-items: center;
          min-height: 1.5em;
        }
        /* Clase para el texto de estado del bot (se le aplicará shimmer) */
        .bot-status-text {
          margin-left: 10px;
          /* El estilo shimmer se aplicará/quitará dinámicamente */
        }

        /* Animación shimmer - Debe estar en CSS */
        .shimmer-animation {
          font-style: italic;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.3) 30%,
            rgba(120, 120, 130, 0.6) 50%,
            rgba(0, 0, 0, 0.3) 70%
          );
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 2.4s linear infinite; /* Animación continua */
        }
        @keyframes shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
      `})]})};export{se as default};
