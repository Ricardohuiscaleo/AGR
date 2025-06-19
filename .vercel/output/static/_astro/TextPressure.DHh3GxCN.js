import{j as y}from"./jsx-runtime.D_zvdyIk.js";import{r as i}from"./index.Bd8wGOW-.js";import"./_commonjsHelpers.D6-XlEtG.js";import"./index.c0qeY2gs.js";const fe=({text:b="Compressa",fontFamily:d="Compressa VF",fontUrl:C="https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",width:k=!0,weight:F=!0,italic:M=!0,alpha:I=!1,flex:J=!0,stroke:T=!1,scale:z=!1,textColor:K="#FFFFFF",strokeColor:Q="#FF0000",strokeWidth:Z=2,className:_="",minFontSize:j=24,id:m})=>{const f=i.useRef(null),g=i.useRef(null),P=i.useRef([]),u=i.useRef({x:0,y:0}),a=i.useRef({x:0,y:0}),U=i.useRef(0),B=i.useRef(!1),[ee,H]=i.useState(j),[te,Y]=i.useState(1),[ne,A]=i.useState(1),[V,X]=i.useState(K),[re,N]=i.useState(Q),[p,W]=i.useState(!0),[q,v]=i.useState(!1),[ce,h]=i.useState({fontLoaded:!1,isLoading:!0}),E=b.split(""),D=()=>{B.current=window.innerWidth<=768},oe=(t,r)=>{const o=r.x-t.x,s=r.y-t.y;return Math.sqrt(o*o+s*s)};i.useEffect(()=>{if(typeof window<"u")try{if(document.fonts.check(`1em "${d}"`)){console.log(`Fuente ${d} ya está disponible`),v(!0),h(o=>({...o,fontLoaded:!0}));return}const t=document.createElement("style");t.textContent=`
          @font-face {
            font-family: "${d}";
            src: url("${C}") format("woff2");
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
        `,document.head.appendChild(t),new FontFace(d,`url(${C})`).load().then(o=>{document.fonts.add(o),console.log(`Fuente ${d} cargada correctamente`),v(!0),h(s=>({...s,fontLoaded:!0}))}).catch(o=>{console.error("Error al cargar la fuente con FontFace API:",o),setTimeout(()=>{v(!0),h(s=>({...s,fontLoaded:!0}))},1e3)})}catch(t){console.error("Error general al cargar la fuente:",t),v(!0),h(r=>({...r,fontLoaded:!0}))}},[d,C]),i.useEffect(()=>{D();const t=e=>{a.current.x=e.clientX,a.current.y=e.clientY},r=e=>{e.preventDefault();const n=e.touches[0];a.current.x=n.clientX,a.current.y=n.clientY},o=e=>{const n=e.touches[0];a.current.x=n.clientX,a.current.y=n.clientY,u.current.x=n.clientX,u.current.y=n.clientY},s=()=>{if(B.current&&(U.current=window.scrollY,f.current)){const e=f.current.getBoundingClientRect();if(e.top<window.innerHeight&&e.bottom>0){const l=Math.min((window.innerHeight-e.top)/e.height,e.bottom/window.innerHeight),x=window.scrollY/(document.body.scrollHeight-window.innerHeight),L=window.innerWidth*x,S=e.top+e.height*l;a.current.x=L,a.current.y=S}}},c=()=>{D()},w=e=>{const{textColor:n,strokeColor:l}=e.detail;n&&X(n),l&&N(l)},$=()=>{if(m){const e=document.getElementById(m);if(e){const n=e.dataset.textColor,l=e.dataset.strokeColor;n&&X(n),l&&N(l)}}};if(window.addEventListener("mousemove",t),window.addEventListener("touchmove",r,{passive:!1}),window.addEventListener("touchstart",o,{passive:!1}),window.addEventListener("scroll",s,{passive:!0}),window.addEventListener("resize",c),m){const e=document.getElementById(m);if(e){e.addEventListener("updatePressureColors",w);const n=setInterval($,100);return()=>{clearInterval(n),e.removeEventListener("updatePressureColors",w)}}}if(f.current){const{left:e,top:n,width:l,height:x}=f.current.getBoundingClientRect();u.current.x=e+l/2,u.current.y=n+x/2,a.current.x=u.current.x,a.current.y=u.current.y}return s(),()=>{window.removeEventListener("mousemove",t),window.removeEventListener("touchmove",r),window.removeEventListener("touchstart",o),window.removeEventListener("scroll",s),window.removeEventListener("resize",c)}},[m]);const R=()=>{if(!f.current){console.warn("Container ref no disponible");return}const{width:t,height:r}=f.current.getBoundingClientRect();let o=t*.9/(E.length*.5);o=Math.max(o,j),o=Math.min(o,t/2),H(o),Y(1),A(1),W(!1),h(s=>({...s,isLoading:!1})),g.current&&requestAnimationFrame(()=>{if(!g.current)return;const s=g.current.getBoundingClientRect();if(s.width>t*.95&&H(c=>c*(t*.95)/s.width),z&&s.height>0&&s.height<r){const c=r/s.height;Y(c),A(c)}})};return i.useEffect(()=>{if(q)return console.log("Fuente cargada, configurando tamaño..."),R(),window.addEventListener("resize",R),()=>window.removeEventListener("resize",R)},[q,z,b]),i.useEffect(()=>{if(p){const t=setTimeout(()=>{console.log("Timeout de seguridad activado para mostrar el texto"),W(!1),h(r=>({...r,isLoading:!1})),v(!0),h(r=>({...r,fontLoaded:!0}))},2e3);return()=>clearTimeout(t)}},[p]),i.useEffect(()=>{if(p)return;let t;const r=()=>{if(u.current.x+=(a.current.x-u.current.x)/15,u.current.y+=(a.current.y-u.current.y)/15,g.current){const s=g.current.getBoundingClientRect().width/2;P.current.forEach(c=>{if(!c)return;const w=c.getBoundingClientRect(),$={x:w.x+w.width/2,y:w.y+w.height/2},e=oe(u.current,$),n=(se,O,G)=>{const ie=G-Math.abs(G*se/s);return Math.max(O,ie+O)},l=k?Math.floor(n(e,30,150)):100,x=F?Math.floor(n(e,200,700)):400,L=M?n(e,0,.8).toFixed(2):"0",S=I?n(e,0,1).toFixed(2):"1";c.style.opacity=S,c.style.fontVariationSettings=`'wght' ${x}, 'wdth' ${l}, 'ital' ${L}`,c.textContent==="T"&&(c.style.fontVariationSettings=`'wght' ${Math.min(x,600)}, 'wdth' ${Math.max(l,50)}, 'ital' ${L}`)})}t=requestAnimationFrame(r)};return r(),()=>cancelAnimationFrame(t)},[k,F,M,I,E.length,p]),y.jsxs("div",{ref:f,className:"relative w-full h-full overflow-hidden bg-transparent",id:m,children:[y.jsx("style",{children:`
        @font-face {
          font-family: '${d}';
          src: url('${C}');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
        .stroke span {
          position: relative;
          color: ${V};
          transition: color 0.3s ease;
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${Z}px;
          -webkit-text-stroke-color: ${re};
          transition: -webkit-text-stroke-color 0.3s ease;
        }
      `}),p?y.jsx("div",{className:"w-full h-full flex items-center justify-center","aria-hidden":"true"}):y.jsx("h1",{ref:g,className:`text-pressure-title ${_} ${J?"flex justify-between":""} ${T?"stroke":""} uppercase text-center`,style:{fontFamily:d,fontSize:ee,lineHeight:ne,transform:`scale(1, ${te})`,transformOrigin:"center top",margin:0,fontWeight:100,color:T?void 0:V,transition:"color 0.3s ease",opacity:1},children:E.map((t,r)=>y.jsx("span",{ref:o=>(P.current[r]=o,null),"data-char":t,className:"inline-block",children:t},r))})]})};export{fe as default};
