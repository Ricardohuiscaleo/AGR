import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function ScrollRevealSection() {
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const items = itemsRef.current;

    // Asegurarnos que el contenedor tenga scroll
    if (scrollContainer) {
      scrollContainer.style.height = '100%';
      scrollContainer.style.overflowY = 'auto';
    }

    // Crear contexto de ScrollTrigger para este contenedor de scroll
    const ctx = gsap.context(() => {
      // Animar cada elemento de texto
      items.forEach((item, index) => {
        if (!item) return;

        // Animar rotación
        gsap.fromTo(
          item,
          { 
            rotation: index % 2 === 0 ? 5 : -5,
            opacity: 0,
            filter: 'blur(10px)',
            y: 50
          },
          {
            rotation: 0,
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: item,
              scroller: scrollContainer,
              start: 'top bottom-=100',
              end: 'bottom center',
              scrub: true,
              markers: false,
            }
          }
        );

        // Animar las palabras con un efecto escalonado
        const words = item.querySelectorAll('.word');
        if (words.length) {
          gsap.fromTo(
            words,
            { 
              opacity: 0,
              filter: 'blur(8px)'
            },
            {
              opacity: 1,
              filter: 'blur(0px)',
              stagger: 0.05,
              duration: 0.5,
              scrollTrigger: {
                trigger: item,
                scroller: scrollContainer,
                start: 'top bottom-=50',
                end: 'bottom center-=100',
                scrub: true,
                markers: false,
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert(); // Limpiar animaciones cuando el componente se desmonte
  }, []);

  // Función para dividir texto en palabras con span
  const splitTextIntoWords = (text) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className="word" style={{ display: 'inline-block', margin: '0 3px' }}>
        {word}
      </span>
    ));
  };

  return (
    <div 
      ref={sectionRef} 
      className="w-full h-full relative"
      style={{
        background: 'var(--orange-500, #F97316)',
        color: 'white'
      }}
    >
      <div className="absolute top-0 right-0 p-2 text-[16px] z-40">
        /Hola (Parte 3 de 4)
      </div>
      
      <div
        ref={scrollContainerRef}
        className="scroll-container w-full h-full overflow-y-auto"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div className="min-h-[200vh] py-16 flex flex-col">
          <div className="h-[20vh]" />
          
          <div 
            className="mx-auto max-w-4xl p-6 my-12"
            ref={el => (itemsRef.current[0] = el)}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold">
              {splitTextIntoWords("Estás perdiendo clientes y recursos valiosos")}
            </h2>
          </div>
          
          <div className="h-[30vh]" />
          
          <div 
            className="mx-auto max-w-4xl p-6 my-12"
            ref={el => (itemsRef.current[1] = el)}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold">
              {splitTextIntoWords("¿Cómo mantener la calidad mientras reduces costos?")}
            </h2>
          </div>
          
          <div className="h-[30vh]" />
          
          <div 
            className="mx-auto max-w-4xl p-6 my-12"
            ref={el => (itemsRef.current[2] = el)}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              {splitTextIntoWords("Implementa Agentes IA RAG y reduce hasta 70% de costos operativos")}
            </h2>
          </div>
          
          <div className="h-[40vh]" />
        </div>
      </div>
    </div>
  );
}

export default ScrollRevealSection;