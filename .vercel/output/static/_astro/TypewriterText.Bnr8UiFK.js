import{j as a}from"./jsx-runtime.D_zvdyIk.js";import{r as t}from"./index.Bd8wGOW-.js";import"./_commonjsHelpers.D6-XlEtG.js";import"./index.c0qeY2gs.js";function G({text:x,speed:b=50,startDelay:v=0,cursor:M=!0,className:p="",loop:S=!1,loopDelay:C=2e3,blinkCursor:P=!0,deleteSpeed:T=30,staticText:R=""}){const[j,E]=t.useState(""),[$,F]=t.useState(0),[h,I]=t.useState(0),[H,W]=t.useState(0),m=t.useRef(null),L=t.useRef(null),l=Array.isArray(x)?x:[x],d=t.useRef(null),k=t.useRef(0),y=t.useRef(!1),w=t.useRef(!1),g=t.useRef(!1),c=typeof window<"u";t.useEffect(()=>{if(!c)return;g.current=!0,y.current=window.innerWidth<=768,w.current=p.includes("mobile-centered")||d.current?.closest(".mobile-centered")!==null;const n=()=>{g.current&&(y.current=window.innerWidth<=768,w.current=p.includes("mobile-centered")||d.current?.closest(".mobile-centered")!==null)};return window.addEventListener("resize",n),()=>{g.current=!1,window.removeEventListener("resize",n)}},[p,c]),t.useEffect(()=>{if(!c||!d.current)return;const n=window.getComputedStyle(d.current),f=o=>{const e=document.createElement("span");e.style.visibility="hidden",e.style.position="absolute",e.style.whiteSpace="nowrap",e.style.fontFamily=n.fontFamily,e.style.fontSize=n.fontSize,e.style.fontWeight=n.fontWeight,e.style.lineHeight=n.lineHeight,e.style.letterSpacing=n.letterSpacing,e.innerText=o,document.body.appendChild(e);const u=e.offsetWidth;return document.body.removeChild(e),u};let i=0;l.forEach(o=>{const e=f(o);e>i&&(i=e)}),I(i+5)},[l,c]),t.useEffect(()=>{if(!c||!m.current||h===0||l.length===0)return;let n=0,f=!0,i=0,o="",e=null;const u=()=>{e&&clearTimeout(e);const r=l[n];if(f){if(i++,i>r.length)if(S||n<l.length-1){e=setTimeout(()=>{f=!1,u()},C);return}else return;o=r.substring(0,i),E(o),k.current=i,A(),e=setTimeout(u,b)}else{if(i--,i<=0){i=0,f=!0,n=(n+1)%l.length,e=setTimeout(u,b);return}o=r.substring(0,i),E(o),k.current=i,A(),e=setTimeout(u,T)}},A=()=>{if(!m.current)return;if(y.current&&w.current){W(0);return}const r=document.createElement("span");r.style.visibility="hidden",r.style.position="absolute",r.style.whiteSpace="nowrap",r.style.font=window.getComputedStyle(m.current).font,r.innerText=j,document.body.appendChild(r);const z=r.offsetWidth;document.body.removeChild(r),W(z)};return e=setTimeout(u,v),()=>{e&&clearTimeout(e)}},[l,b,T,C,S,v,h,c]);const s=c&&y.current&&w.current;return a.jsxs("span",{ref:d,className:`typewriter-wrapper ${p}`,style:{position:"relative",display:s?"flex":"inline-flex",justifyContent:s?"center":"flex-start",whiteSpace:"nowrap",width:s?"100%":"auto"},children:[R&&a.jsx("span",{className:"static-text",style:{marginRight:0},children:R}),a.jsxs("span",{className:"typewriter-container",style:{position:"relative",display:"inline-block",width:s?"auto":h?`${h}px`:"auto",height:"100%",verticalAlign:"bottom",marginLeft:0,marginRight:0,padding:0,textAlign:s?"center":"left"},children:[a.jsx("span",{ref:m,className:"typewriter-visible-text",style:{display:"inline-block",whiteSpace:"nowrap",textAlign:s?"center":"left",verticalAlign:"bottom",marginLeft:0},children:j}),a.jsx("span",{ref:L,"aria-hidden":"true",style:{position:"absolute",visibility:"hidden",height:0,overflow:"hidden",whiteSpace:"nowrap",pointerEvents:"none",userSelect:"none"},children:" "}),M&&a.jsx("span",{className:`typewriter-cursor ${P?"blinking-cursor":""}`,style:{position:"relative",display:"inline-block",left:"auto",marginLeft:"-2px",top:0},children:"|"})]}),a.jsx("style",{jsx:"true",children:`
        .blinking-cursor {
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          from,
          to {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        /* Ajustes específicos para mejorar el cursor en PC */
        @media (min-width: 769px) {
          .typewriter-cursor {
            display: inline-block;
            position: relative;
            margin-left: -2px;
            vertical-align: baseline;
          }
        }
      `})]})}export{G as default};
