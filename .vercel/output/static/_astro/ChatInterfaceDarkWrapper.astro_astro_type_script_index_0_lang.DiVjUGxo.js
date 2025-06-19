import{r as i,R as X}from"./index.Bd8wGOW-.js";import{a as $}from"./client.Ctic5FTx.js";import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{S as V}from"./animated-tooltip.C9LK3Wtw.js";import"./_commonjsHelpers.D6-XlEtG.js";import"./index.c0qeY2gs.js";const Y=()=>{const p=i.useRef(null),a=i.useRef(null),R=i.useRef(null),[L,A]=i.useState(!1),[W,_]=i.useState(0),b=i.useRef(null),E=i.useRef(null),I=i.useRef(null),F="https://primary-production-33e8.up.railway.app/webhook/8e1404f9-1d5d-4126-b321-df21a22bc27c",B=["Hola, ¿cómo están? Me gustaría agendar una reunión con el área comercial. Mi nombre es:","Me gustaría conocer más sobre los servicios que ofrecen para mi empresa. Mi nombre es:","Estoy interesado en aprender más sobre Agente RAG para implementarlo en mi negocio. Mi nombre es:","Quisiera conocer los costos asociados con la implementación de sus soluciones. Mi nombre es:","Necesito automatizar procesos en mi empresa y estoy buscando asesoría. Mi nombre es:","Me interesa conocer qué tipos de integraciones ofrecen con sistemas existentes. Mi nombre es:","Estoy buscando mejorar la experiencia de mis clientes con herramientas de IA. Mi nombre es:"],G=()=>{a.current&&(C(),a.current.value=B[W],v(),a.current.focus(),_(e=>(e+1)%B.length))},j=["Pregunta sobre costos de RAG","Agenda una reunión comercial","Consulta por automatización","Necesito reducir costos","Quiero implementar IA RAG","Conversemos sobre tu negocio"],M="Escribe tu mensaje...",x=i.useRef(0),f=i.useRef(""),k=i.useRef(null),h=i.useRef(null),U=()=>{const e=a.current;if(e&&e.value===""&&document.activeElement!==e&&!e.classList.contains("placeholder-blur-transition")){const r=e.placeholder;e.placeholder=r.endsWith("|")?f.current:f.current+"|"}},K=()=>{const e=a.current;e&&(e.value===""&&document.activeElement!==e?(e.classList.add("placeholder-blur-transition"),h.current&&clearInterval(h.current),h.current=null,e.placeholder=f.current,setTimeout(()=>{x.current=(x.current+1)%j.length,f.current=j[x.current],e.placeholder=f.current,setTimeout(()=>{e.classList.remove("placeholder-blur-transition"),q()},250)},150)):(k.current&&clearInterval(k.current),k.current=null,e.value===""&&(e.placeholder=M)))},q=()=>{const e=a.current;e&&(h.current&&clearInterval(h.current),e.value===""&&document.activeElement!==e&&!e.classList.contains("placeholder-blur-transition")&&(f.current=j[x.current],e.placeholder=f.current+"|",h.current=setInterval(U,530)))},T=()=>{const e=a.current;e&&(C(),e.value===""&&document.activeElement!==e&&(x.current=Math.floor(Math.random()*j.length),f.current=j[x.current],q(),k.current=setInterval(K,3800)))},C=()=>{const e=a.current;e&&(clearInterval(h.current),clearInterval(k.current),h.current=null,k.current=null,e.classList.remove("placeholder-blur-transition"),e.value===""&&(e.placeholder=M))},v=()=>{const e=a.current;e&&(e.style.height="auto",e.style.height=e.scrollHeight+"px")},Q=()=>{const e=p.current;if(!e)return;const r=e.querySelector("h2");if(r&&(r.style.display="none"),I.current)return;const s=document.createElement("div");s.classList.add("message","bot"),e.appendChild(s),I.current=s;const n=document.createElement("div");n.classList.add("bot-typing-status-container"),s.appendChild(n);const o=document.createElement("span");o.classList.add("bot-typing-indicator"),n.appendChild(o);const c=document.createElement("span");c.classList.add("bot-status-text"),c.textContent="Consultando base de datos...",c.classList.add("shimmer-animation"),n.appendChild(c),E.current=c,e.scrollTop=e.scrollHeight;let l=0;b.current&&clearInterval(b.current),b.current=setInterval(()=>{if(!E.current){clearInterval(b.current);return}l++;let d="";l>=19?d="Finalizando respuesta...":l>=15?d="Procesando con Agentes RAG...":l>=10?d="Analizando información...":l>=4?d="Buscando datos relevantes...":d="Consultando base de datos...",E.current.textContent!==d&&(E.current.textContent=d)},1e3)},S=()=>{b.current&&clearInterval(b.current),b.current=null,I.current&&(I.current.remove(),I.current=null),E.current=null},H=async()=>{const e=a.current,r=R.current,s=p.current;if(!e||!r||!s||r.disabled||L)return;const n=e.value.trim();if(n){C(),J(n),e.value="",v(),e.placeholder=M,r.classList.add("plane-flying"),r.disabled=!0,A(!0),Q();try{let o=localStorage.getItem("session_id");o||(o=crypto.randomUUID().replace(/-/g,""),localStorage.setItem("session_id",o));const c=await fetch(F,{method:"POST",headers:{"Content-Type":"application/json","x-session-id":o},body:JSON.stringify({message:n})});if(S(),c.ok){const l=await c.json();let d=l.output||Array.isArray(l)&&l.length>0&&l[0].output||"";await z(d||"...","bot")}else console.error("Server error:",c.status),await z("Error al obtener respuesta del servidor.","bot")}catch(o){console.error("Fetch Error:",o),S(),await z("Error de conexión. Inténtalo de nuevo.","bot")}finally{r.classList.remove("plane-flying"),r.disabled=!1,A(!1),e.value===""&&document.activeElement!==e&&T(),e.focus()}}},J=e=>{const r=p.current;if(!r)return;const s=r.querySelector("h2");s&&s.style.display!=="none"&&(s.style.display="none");const n=document.createElement("div");n.classList.add("message","user"),n.textContent=e,r.appendChild(n),r.scrollTop=r.scrollHeight},z=(e,r)=>new Promise(s=>{const n=p.current;if(!n){s();return}const o=document.createElement("div");o.classList.add("message",r),o.style.color="#ffffff",n.appendChild(o);const c=document.createElement("div");c.innerHTML=e.replace(/<script.*?>.*?<\/script>/gi,"");const l=Array.from(c.childNodes);function d(m,N,y){if(m.nodeType===Node.TEXT_NODE){let u=function(){P<g.length?(w.textContent+=g.charAt(P++),n.scrollTop=n.scrollHeight,setTimeout(u,12)):y()};const g=m.textContent||"";if(g.trim()===""){y();return}const w=document.createElement("span");w.style.color="#ffffff",N.appendChild(w);let P=0;u()}else if(m.nodeType===Node.ELEMENT_NODE){const u=document.createElement(m.tagName);for(let w of m.attributes)u.setAttribute(w.name,w.value);u.style.color||(u.style.color="#ffffff"),N.appendChild(u);const g=Array.from(m.childNodes);D(g,u,y)}else y()}function D(m,N,y){let u=0;function g(){u<m.length?d(m[u++],N,g):y()}g()}D(l,o,s)});return i.useEffect(()=>{const e=a.current;return e&&e.value===""&&T(),v(),window.addEventListener("resize",v),()=>{C(),window.removeEventListener("resize",v),S()}},[]),t.jsxs("div",{className:"chat-dark-container",children:[t.jsxs("div",{className:"chat-header",children:[t.jsxs("div",{className:"chat-title",children:[t.jsx("div",{className:"chat-icon",children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"})})}),t.jsx("h3",{children:"Chat con Agente RAG"})]}),t.jsx("p",{className:"chat-subtitle",children:"Consulta sobre automatización y ahorro de costos en tiempo real"})]}),t.jsx("div",{className:"chat-messages-dark",ref:p,children:t.jsxs("h2",{className:"welcome-message",children:["👋 ¡Hola, si lo que has visto recién te genera dudas.",t.jsx("br",{}),"Hablemos sobre costos y cómo podemos ayudarte a ahorrar!"]})}),t.jsx("div",{className:"chat-input-dark-container",children:t.jsxs("div",{className:"textarea-dark-container",children:[t.jsx(V,{content:"Iniciadores de conversación sobre costos",children:t.jsxs("button",{className:"quick-button-dark",onClick:e=>{e.stopPropagation(),G()},"aria-label":"Iniciadores de conversación",children:[t.jsx("span",{role:"img","aria-label":"light bulb",className:"bulb-emoji",children:"💡"}),t.jsx("div",{className:"glow-effect-dark"})]})}),t.jsx("textarea",{ref:a,rows:"1",placeholder:M,onInput:v,onKeyDown:e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),R.current.disabled||H())},onFocus:()=>C(),onBlur:()=>{a.current.value===""&&T()},className:"textarea-dark"}),t.jsx("button",{className:`send-button-dark ${L?"plane-flying":""}`,ref:R,onClick:H,disabled:L,children:t.jsx("svg",{className:"send-icon-dark",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:t.jsx("path",{d:"M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"})})})]})}),t.jsx("style",{jsx:"true",children:`
        .chat-dark-container {
          background: #111827;
          border-radius: 12px;
          border: none; /* Eliminar el borde dorado */
          box-shadow: none; /* Eliminar también la sombra para que se vea más integrado */
          padding: 4px 30px; /* Añadir padding lateral de 32px */
          margin: 2px 0;
          color: #f3f4f6;
          position: relative;
          overflow: hidden;
        }

        .chat-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #374151;
          padding-bottom: 16px;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .chat-icon {
          color: #fbbf24;
          display: flex;
          align-items: center;
        }

        .chat-title h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #fbbf24;
        }

        .chat-subtitle {
          color: #d1d5db;
          font-size: 0.875rem;
          margin: 0;
          margin-left: 32px;
        }

        .chat-messages-dark {
          height: min(60vh, 600px);
          overflow-y: auto;
          margin-bottom: 20px;
          padding: 16px;
          background: transparent;
          border-radius: 8px;
          position: relative;
        }

        .welcome-message {
          color: #f3f4f6;
          font-size: 0.9rem;
          text-align: center;
          margin: 0;
          padding: 20px;
          line-height: 1.5;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 40px);
        }

        .message {
          margin-bottom: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 85%;
          word-wrap: break-word;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .message.user {
          background: #fbbf24;
          color: #111827;
          align-self: flex-end;
          margin-left: auto;
          border-bottom-right-radius: 4px;
          font-weight: 500;
        }

        .message.bot {
          background: #374151;
          color: #ffffff;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .message.bot strong,
        .message.bot b {
          color: #fbbf24;
        }

        .chat-input-dark-container {
          display: flex;
          flex-direction: column;
        }

        .textarea-dark-container {
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 24px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: border-color 0.2s ease;
        }

        .textarea-dark-container:focus-within {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .quick-button-dark {
          background: #fbbf24;
          border: none;
          border-radius: 50%;
          padding: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #111827;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .quick-button-dark:hover {
          background: #f59e0b;
          transform: scale(1.05);
        }

        .bulb-emoji {
          font-size: 16px;
          position: relative;
          z-index: 2;
        }

        .glow-effect-dark {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 120%;
          height: 120%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(0, 0, 0, 0) 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .quick-button-dark:hover .glow-effect-dark {
          opacity: 1;
        }

        .quick-button-dark:hover .bulb-emoji {
          animation: pulse-glow-dark 1.5s infinite;
        }

        @keyframes pulse-glow-dark {
          0% {
            filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.9));
          }
          100% {
            filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.7));
          }
        }

        .textarea-dark {
          flex: 1;
          border: none;
          resize: none;
          font-size: 14px;
          outline: none;
          background: transparent;
          color: #f3f4f6;
          padding: 8px 12px;
          min-height: 40px;
          max-height: 120px;
          overflow-y: auto;
          line-height: 1.4;
        }

        .textarea-dark::placeholder {
          color: #9ca3af;
          transition:
            color 0.2s ease-in-out,
            filter 0.25s ease-out;
          filter: blur(0px);
        }

        .textarea-dark.placeholder-blur-transition::placeholder {
          filter: blur(3px);
          color: rgba(156, 163, 175, 0.5);
        }

        .send-button-dark {
          background: #fbbf24;
          border: none;
          color: #111827;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-button-dark:hover:not(:disabled) {
          background: #f59e0b;
          transform: scale(1.05);
        }

        .send-button-dark:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .send-icon-dark {
          transition: transform 0.3s ease;
        }

        .send-button-dark:hover .send-icon-dark {
          transform: rotate(-15deg);
        }

        @keyframes planeFlight {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-30deg);
          }
          50% {
            transform: rotate(15deg);
          }
          75% {
            transform: rotate(-30deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .plane-flying .send-icon-dark {
          animation: planeFlight 1.2s infinite ease-in-out;
        }

        /* Indicador de typing del bot */
        .bot-typing-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #fbbf24;
          border-radius: 50%;
          vertical-align: middle;
          margin-right: 8px;
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
            transform: scale(1.3);
          }
        }

        .bot-typing-status-container {
          display: flex;
          align-items: center;
          min-height: 1.5em;
        }

        .bot-status-text {
          color: #d1d5db;
          font-style: italic;
          font-size: 0.85rem;
        }

        .shimmer-animation {
          background: linear-gradient(
            90deg,
            rgba(209, 213, 219, 0.4) 30%,
            rgba(251, 191, 36, 0.8) 50%,
            rgba(209, 213, 219, 0.4) 70%
          );
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }

        /* Scrollbar personalizado */
        .chat-messages-dark::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages-dark::-webkit-scrollbar-track {
          background: #1f2937;
        }

        .chat-messages-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }

        .chat-messages-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Responsividad */
        @media (max-width: 768px) {
          .chat-dark-container {
            padding: 16px 32px; /* Mantener padding lateral de 32px en tablets */
            margin: 16px 8px;
          }

          .chat-messages-dark {
            height: min(50vh, 400px); /* En móviles: 50% del viewport o máximo 400px */
            padding: 12px;
          }

          .chat-title h3 {
            font-size: 1.1rem;
          }

          .chat-subtitle {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .chat-dark-container {
            padding: 12px 32px; /* Mantener padding lateral de 32px en móviles */
            margin: 12px 4px;
            border-radius: 8px;
          }

          .chat-messages-dark {
            height: min(45vh, 350px); /* En móviles pequeños: 45% del viewport o máximo 350px */
            padding: 10px;
          }
        }
      `})]})};function O(){const p=document.getElementById("chat-interface-dark-container");p&&!p.hasAttribute("data-react-mounted")&&(p.setAttribute("data-react-mounted","true"),$.createRoot(p).render(X.createElement(Y)),console.log("ChatInterfaceDark montado correctamente"))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",O):O();
