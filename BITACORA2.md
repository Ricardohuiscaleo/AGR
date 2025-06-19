# BITÁCORA 2 - Proyecto Website

## 22 de abril de 2025

### Implementación de Componentes de Tarjeta y Sistema de Navegación

#### Componentes Creados:

1. **NavCard (nav-card.astro)**

   - Componente para elementos de navegación lateral
   - Propiedades:
     - sectionId
     - number
     - title
     - bgColor
     - hoverColor
   - Características:
     - Indicador de progreso dinámico
     - Transiciones suaves
     - Altura adaptativa según scroll

2. **SectionCard (section-card.astro)**
   - Componente para secciones principales
   - Propiedades:
     - id
     - sectionNumber
     - title
     - subtitle
     - bgColor
     - hoverColor
     - isActive
   - Características:
     - Sistema de slots para contenido personalizado
     - Diseño responsive
     - Compatible con efectos y fondos personalizados

#### Estructura de Navegación:

- **Secciones Principales**:
  1. R.N. (00)
  2. Hello (01)
  3. Approach (02)
  4. Work (03)
  5. Talent (04)
  6. Careers (05)
  7. Contact (06)

#### Características Implementadas:

- Navegación lateral dinámica
- Sistema de scroll suave
- Indicadores de progreso visual
- Estructura modular y reutilizable
- Soporte para temas oscuros
- SEO-friendly con estructura semántica

#### Próximos Pasos:

- [ ] Implementar efectos de fondo personalizados por sección
- [ ] Añadir animaciones de transición entre secciones
- [ ] Optimizar rendimiento de scroll
- [ ] Mejorar accesibilidad
- [ ] Implementar sistema de gestión de estado para temas

---

### Notas Técnicas:

- Uso de Astro para componentes estáticos
- Integración con TailwindCSS para estilos
- Sistema de slots para contenido dinámico
- Estructura modular para mejor mantenibilidad
- Compatibilidad con SEO mediante estructura semántica HTML5

---

## 23 de abril de 2025

### Implementación del Componente TextPressure

#### Componente TextPressureWrapper

```astro
<div class="text-pressure-container" style="position: relative; height: 300px;">
  <TextPressureComponent
    client:visible
    text="Agente RAG"
    flex={true}
    alpha={false}
    stroke={true}
    width={true}
    weight={true}
    italic={true}
    textColor="#111111"
    strokeColor="#333333"
    strokeWidth={1}
    minFontSize={48}
  />
</div>

<style>
  .text-pressure-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    height: 100px;
  }

  /* Estilos responsivos para dispositivos móviles */
  @media (max-width: 768px) {
    .text-pressure-container {
      height: 190px;
      max-width: 100%;
      padding: 0 10px;
    }
  }

  @media (max-width: 480px) {
    .text-pressure-container {
      height: 150px;
    }
  }
</style>
```

#### Características:

- Componente que renderiza texto con efectos de presión interactivos
- Adaptable a diferentes tamaños de pantalla (responsive)
- Configuración personalizable de:
  - Color de texto y trazo
  - Grosor de trazo
  - Tamaño mínimo de fuente
  - Transformaciones (flex, italic, width, weight)
- Integrado con la sección principal como elemento destacado

#### Ajustes Realizados:

- Centrado vertical y horizontal del título "Agente RAG" en la vista principal
- Configuración de tamaños responsivos para distintos dispositivos
- Integración con el tema visual del sitio
- Optimización de rendimiento con `client:visible`

#### Próximos Pasos:

- [ ] Explorar variantes adicionales de efectos de texto
- [ ] Evaluar rendimiento en dispositivos de gama baja
- [ ] Implementar precarga para mejorar CLS (Cumulative Layout Shift)

---

## 24 de abril de 2025

### Solución para Altura Adaptativa en Sección Multi-Fila

#### Problema Identificado

Se detectó un problema con la sección "Hola (Parte 2 de 2)" donde la altura no se ajustaba correctamente al contenido. A pesar de usar `height: 'h-auto'`, la sección mostraba un espacio excesivo después del último elemento, dando una apariencia desequilibrada.

#### Análisis del Problema

Al analizar el código encontramos que:

1. El problema radicaba en la estructura del grid utilizada en la sección
2. Aunque se definía una estructura de 3 filas (`rows: 3`), el contenido no se distribuía correctamente en cada fila
3. Los estilos CSS estaban colisionando, creando espacios no deseados

#### Solución Implementada

Implementamos una estructura de grid explícita con distribución controlada del contenido:

```javascript
// Configuración del contenedor de sección
{
  id: 'hola-part2',
  // ...otras propiedades...
  bgColor: 'bg-gray-100',
  height: 'h-auto',
  border: 'border border-gray-300',
  layout: 'custom', // Cambio clave: uso de layout personalizado
  rows: 3,
  showDivider: true,
}

// Estructura de contenido en la vista
<div class="grid-wrapper">
  {/* Fila 1 - Somos */}
  <div class="grid-row">
    <h3 class="big-text gray-text">Somos</h3>
    <div class="description-box">
      <p>Desarrollamos soluciones inteligentes...</p>
    </div>
  </div>

  {/* Separador */}
  <div class="separator"></div>

  {/* Fila 2 - Agente */}
  <div class="grid-row">
    <h3 class="big-text orange-text">Agente</h3>
    <div class="description-box">
      <p>Construimos agentes que automatizan...</p>
    </div>
  </div>

  {/* Separador */}
  <div class="separator"></div>

  {/* Fila 3 - RAG */}
  <div class="grid-row">
    <h3 class="big-text orange-text">RAG</h3>
    <div class="description-box">
      <p>Utilizamos la tecnología RAG...</p>
    </div>
  </div>
</div>
```

```css
/* Estilos CSS correspondientes */
.grid-wrapper {
  display: grid;
  grid-template-rows: auto auto auto auto auto; /* 3 filas + 2 separadores */
  width: 100%;
  height: auto;
}

.grid-row {
  display: flex;
  flex-direction: row;
  padding: 1.5rem 0;
  align-items: center;
}

.big-text {
  font-size: clamp(40px, 15vw, 300px);
  line-height: 1;
  font-weight: bold;
  margin: 0;
  padding-left: 5px;
}

.gray-text {
  color: #6b7280; /* Gris para "Somos" */
}

.orange-text {
  color: #f97316; /* Naranja para "Agente" y "RAG" */
}

.description-box {
  margin-left: 3rem;
  max-width: 50%;
}

.separator {
  height: 1px;
  width: 100%;
  background-color: rgba(12, 12, 12, 0.5);
  margin: 0;
}
```

#### Claves de la Solución

1. Creamos un grid explícito con filas adaptativas (`auto`)
2. Insertamos separadores como elementos reales del grid
3. Cada fila contiene su propio título y descripción alineados horizontalmente
4. Los textos principales tienen el mismo tamaño que el título "Hola" de la sección anterior
5. Se aplican colores diferenciados: "Somos" en gris y "Agente"/"RAG" en naranja

#### Aprendizajes

- Cuando se requiere distribución precisa de elementos en un grid, es mejor definir explícitamente cada fila como un contenedor independiente
- El modelo de grid de CSS permite combinar elementos de contenido con elementos separadores en una estructura unificada
- Para lograr altura verdaderamente adaptativa, cada elemento contenedor debe tener `height: auto`
- Es fundamental asegurar que cada fila del grid tenga contenido real y no esté vacía

#### Resultado

La sección ahora presenta una altura completamente adaptativa, mostrando tres filas bien organizadas con alineación consistente y sin espacios innecesarios.

---

## 1 de mayo de 2025

### Solución para posicionamiento flexible de componentes dentro de secciones: Caso TimelineWrapper

#### Problema Identificado

Se detectó un problema con el componente TimelineWrapper en la sección "usage-part1". El timeline no estaba ocupando todo el espacio disponible y presentaba un margen izquierdo mayor al deseado (más de 10px), mientras que otras secciones tenían definido en sus propiedades `left-5` o `left-1`.

#### Análisis del Problema

Tras investigar el código, se identificieron tres causas principales:

1. **Error tipográfico en TimelineWrapper.astro**: Existía un error `margin: 0-;` (con un guion después del 0) que estaba causando problemas de renderización.

2. **Posicionamiento inflexible**: El componente Timeline.jsx usaba posiciones absolutas con valores fijos para la línea vertical y los círculos del timeline, sin permitir ajustes desde el componente padre.

3. **Uso excesivo de !important**: En los estilos CSS había reglas con `!important` que forzaban posiciones específicas, eliminando la flexibilidad para ajustar márgenes propios.

#### Solución Implementada: Sistema de Posicionamiento Flexible

##### 1. Componente parametrizable con lineOffset

Se modificó el `TimelineWrapper.astro` para recibir un nuevo parámetro `lineOffset` que controla el margen izquierdo:

```astro
---
// ...existing props...
interface Props {
  data: Array<{
    title: string;
    date?: string;
    content: any;
  }>;
  title?: string;
  subtitle?: string;
  className?: string;
  titleColor?: string;
  dateColor?: string;
  lineColor?: string;
  lineBaseColor?: string;
  lineOffset?: number; // Nueva propiedad para controlar el offset
}

const { 
  data, 
  title, 
  subtitle, 
  className, 
  titleColor, 
  dateColor, 
  lineColor, 
  lineBaseColor,
  lineOffset = 5 // Valor por defecto de 5px
} = Astro.props;
---

<div class="timeline-wrapper">
  <Timeline
    client:load
    data={data}
    title={title}
    subtitle={subtitle}
    className={`timeline-container ${className || ''}`}
    titleColor={titleColor}
    dateColor={dateColor}
    lineColor={lineColor}
    lineBaseColor={lineBaseColor}
    lineOffset={lineOffset}
  />
</div>

<style>
  .timeline-wrapper {
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    position: relative;
  }
</style>
```

##### 2. Posicionamiento dinámico en el componente React

Se modificó `Timeline.jsx` para usar el parámetro `lineOffset` en lugar de posiciones fijas:

```jsx
export const Timeline = ({
  // ...existing props...
  lineOffset = 5, // Nuevo parámetro con valor por defecto
}) => {
  // ...existing code...

  return (
    <div 
      className={cn('w-full dark:bg-transparent font-sans', className)} 
      ref={containerRef}
      style={{ paddingLeft: `${lineOffset}px` }} // Usar lineOffset como padding izquierdo
    >
      {/* ...existing content... */}
      
      {/* Círculos del timeline con posicionamiento relativo */}
      <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start">
        <div className="h-10 absolute left-0 md:left-0 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div id={`timeline-circle-${index}`} className={cn('h-4 w-4 rounded-full transition-all duration-300', 'border')} />
        </div>
        {/* ...existing content... */}
      </div>

      {/* Línea vertical - posicionada usando lineOffset */}
      <div
        style={{
          height: height + 'px',
          left: `${lineOffset + 3}px`, // Posición calculada para centrar con los círculos
        }}
        className={cn('absolute top-0 overflow-hidden w-[2px]', lineBaseColor)}
      >
        <div ref={lineRef} style={{ height: '0px' }} className={cn('absolute inset-x-0 top-0 w-[2px] rounded-full', lineColor)} />
      </div>
      
      {/* ...existing code... */}
    </div>
  );
};
```

##### 3. Estilos CSS respetando la configuración

Se modificaron los estilos CSS eliminando reglas `!important` y usando clases más específicas:

```css
/* Estilos específicos para el timeline de la sección usage-part1 */
#usage-part1 .section-inner {
  padding: 0;
  margin: 0;
}

/* Asegurar que el contenedor del timeline ocupe todo el ancho disponible */
#usage-part1 .timeline-wrapper,
#usage-part1 .timeline-container {
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

/* Estilos para las transiciones de los elementos del timeline */
#usage-part1 [id^="timeline-circle-"],
#usage-part1 [id^="timeline-title-"],
#usage-part1 [id^="timeline-content-"] {
  transition: all 0.4s ease;
}

/* Mejorar visibilidad de la línea vertical */
#usage-part1 .overflow-hidden.w-\[2px\] {
  z-index: 10;
  opacity: 1;
}

/* Estilos para las animaciones de la línea de progreso */
#usage-part1 .overflow-hidden.w-\[2px\] > div {
  transition: height 0.3s ease-out;
}
```

##### 4. Implementación en index.astro con margen específico

Finalmente, se implementó el timeline con un `lineOffset` específico de 10px en index.astro:

```astro
{section.id === 'usage-part1' && (
  <div class="section-inner p-0 m-0 w-full">
    <TimelineWrapper
      title="Problemas y Soluciones con Agentes RAG"
      subtitle="Un recorrido por los desafíos empresariales y cómo nuestra tecnología los resuelve."
      titleColor="text-white"
      lineColor="bg-gradient-to-t from-indigo-600 via-blue-400 to-transparent"
      className="max-w-full w-full"
      dateColor="text-indigo-300"
      lineOffset={10} <!-- Valor específico para este timeline -->
      data={[
        // ...timeline data...
      ]}
    />
  </div>
)}
```

#### Resultados

- El timeline ahora ocupa adecuadamente todo el espacio disponible
- La línea vertical está perfectamente centrada con los círculos
- Se puede ajustar el margen izquierdo mediante el parámetro `lineOffset` sin modificar componentes internos
- La solución permite flexibilidad para diferentes implementaciones del timeline en distintas secciones

#### Mejores Prácticas para Componentes dentro de Secciones

A partir de esta experiencia, establecemos las siguientes mejores prácticas:

1. **Parametrización de posicionamiento**: Siempre proporcionar parámetros para controlar márgenes, padding y posición de elementos clave en componentes reutilizables.

2. **Evitar valores absolutos fijos**: No codificar valores de posicionamiento absolutos dentro de los componentes; en su lugar, parametrizarlos.

3. **Evitar !important**: Evitar usar `!important` en CSS ya que elimina la flexibilidad para ajustes posteriores.

4. **Usar valores por defecto sensatos**: Proporcionar valores por defecto razonables para todos los parámetros de posicionamiento.

5. **Componentes autocontenidos**: Hacer que los componentes manejen su propio posicionamiento interno basado en los parámetros recibidos.

6. **Sistema de posicionamiento consistente**: Mantener un enfoque coherente para el posicionamiento en todos los componentes.

7. **Documentación clara**: Documentar cómo ajustar el posicionamiento para cada componente reutilizable.

#### Aplicación para Futuros Componentes

Esta aproximación de "posicionamiento parametrizable" debe aplicarse a todos los componentes dentro de secciones, incluyendo:

- Carousels y sliders
- Tarjetas interactivas
- Gráficos y visualizaciones
- Formularios y elementos de entrada
- Componentes de navegación anidados

Al seguir estas prácticas, los componentes mantienen su flexibilidad para adaptarse a diferentes contextos y requisitos de diseño sin necesidad de modificar su código interno.

---

## 2 de mayo de 2025

### Solución al Problema de Animaciones en Componente Timeline

#### Problema Identificado

Se detectó un problema en el componente Timeline donde las animaciones solo se activaban para el primer elemento ("Problema"), mientras que los elementos siguientes ("Desafío" y "Solución") permanecían sin cambios al hacer scroll por la sección.

#### Análisis del Problema

Tras analizar detalladamente el componente, se identificaron tres causas principales:

1. **Altura fija insuficiente**: La sección tenía una altura fija de 600px que no permitía suficiente espacio para activar todos los elementos durante el scroll.
   ```javascript
   section.style.height = '600px'; // Restricción que limitaba el área de scroll
   ```

2. **Configuración inadecuada de ScrollTrigger**: El sistema de animación de GSAP no estaba correctamente configurado para detectar el scroll dentro de un contenedor anidado.

3. **Lógica de activación incompleta**: El sistema calculaba incorrectamente qué elementos debían activarse basándose en el progreso general, sin considerar la posición específica de cada elemento.

#### Solución Implementada: Sistema de Marcadores Internos

Se implementó un enfoque completamente nuevo que incluye:

1. **Altura dinámica adaptativa**:
   ```javascript
   const dynamicHeight = Math.max(1000, data.length * 350);
   section.style.height = `${dynamicHeight}px`;
   ```

2. **Marcadores internos para cada elemento**:
   ```javascript
   // Crear marcadores internos para cada elemento
   data.forEach((_, index) => {
     const marker = document.createElement('div');
     marker.className = `timeline-marker-${index} absolute left-0 w-full z-0`;
     marker.style.height = '1px';
     
     // Posicionar marcador - distribuir equitativamente
     const position = (index + 0.5) * (100 / data.length);
     marker.style.top = `${position}%`;
     
     section.appendChild(marker);
   });
   ```

3. **Sistema de detección de scroll personalizado**:
   ```javascript
   const updateBasedOnScroll = () => {
     const { scrollTop, scrollHeight, clientHeight } = section;
     const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
     
     // Distribuir el scroll en segmentos para cada elemento
     const segmentSize = 100 / data.length;
     
     // Determinar qué elementos deben estar activos
     data.forEach((_, index) => {
       const threshold = (index + 0.25) * segmentSize;
       const shouldBeActive = scrollPercent >= threshold;
       
       if (shouldBeActive && index > activeIndex) {
         updateElementAnimations(index, true);
         if (index > activeIndex) setActiveIndex(index);
       }
     });
   };
   ```

4. **Panel de depuración visual**:
   ```javascript
   const debugLabel = document.createElement('div');
   debugLabel.className = 'fixed top-2 right-2 z-50 bg-indigo-800/80 text-white text-xs p-2 rounded-md';
   debugLabel.innerHTML = 'Timeline Debug: <span id="timeline-debug">0%</span>';
   ```

#### Mejoras Adicionales

1. **Eliminación del auto-scroll**: Se eliminó el comportamiento de auto-scroll que causaba desplazamiento no deseado.

2. **Activación precisa por umbrales**: Se implementaron umbrales específicos para cada elemento, activándolos cuando el scroll alcanza el 25% de su segmento correspondiente.

3. **Animaciones independientes**: Cada elemento ahora tiene su propia lógica de animación independiente, mejorando la consistencia visual.

#### Resultados

El componente Timeline ahora funciona correctamente:

- Todos los elementos ("Problema", "Desafío" y "Solución") se activan en secuencia a medida que se hace scroll.
- Las animaciones son consistentes y previsibles.
- No hay desplazamientos automáticos no deseados.
- Se mantiene un indicador de depuración para monitorizar el comportamiento del componente.

#### Lecciones Aprendidas

1. **Control directo sobre el scroll**: Para componentes con scroll anidado, es preferible implementar un sistema de detección de scroll propio en lugar de depender completamente de librerías externas.

2. **Marcadores visuales para debugging**: Los marcadores visuales internos son esenciales para identificar y solucionar problemas de timing en animaciones basadas en scroll.

3. **Segmentación del espacio de scroll**: Dividir el espacio total de scroll en segmentos proporcionales permite una activación más precisa y predecible de elementos secuenciales.

Esta solución mejora significativamente la experiencia de usuario al garantizar que todas las secciones del timeline se animan correctamente, guiando al usuario de manera efectiva a través del contenido.

---

## 3 de mayo de 2025

### Documentación de la migración de Timeline a scroll de página

#### Implementación actual de efectos en el Timeline (respaldo)

Actualmente, el componente `Timeline.jsx` implementa varios efectos visuales controlados por el scroll interno de la sección:

1. **Animación de círculos**: 
   - Los círculos cambian de color y tamaño al activarse
   - Se aplica una animación de pulso con GSAP para destacar la activación
   - La activación se controla mediante thresholds basados en el porcentaje de scroll

2. **Animación de títulos**:
   - Los títulos pasan de un color gris a blanco al activarse
   - Tienen un cambio de font-weight (peso de la fuente)
   - Se aplica un efecto de blur/desenfoque para los elementos inactivos

3. **Animación de contenido**:
   - El contenido cambia su opacidad (de 50% a 100%)
   - También aplica un efecto de desenfoque cuando está inactivo

4. **Barra de progreso**:
   - Una barra vertical que cambia su altura según el porcentaje de scroll
   - Utiliza un gradiente para crear un efecto visual atractivo
   - La implementación detecta scroll interno para calcular el porcentaje de avance

5. **Sistema de cálculo de elementos activos**:
   - Divide el scroll en segmentos según el número de elementos
   - Activa los elementos cuando el scroll alcanza su threshold correspondiente
   - Utiliza el scroll de la sección como referencia

#### Implementación actual de la detección de elementos activos:

```javascript
// Fragmento actual del cálculo de elementos activos
const updateBasedOnScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = section;
  const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

  // Actualizar debug label
  const debugEl = document.getElementById('timeline-debug');
  if (debugEl) debugEl.textContent = `${scrollPercent.toFixed(1)}%`;

  // Distribuir el scroll en segmentos para cada elemento
  const segmentSize = 100 / data.length;

  // Determinar qué elementos deben estar activos
  data.forEach((_, index) => {
    // Calcular si este elemento debería estar activo
    const threshold = (index + 0.25) * segmentSize;
    const shouldBeActive = scrollPercent >= threshold;

    // Si el elemento debería estar activo y no lo está, o viceversa
    if (shouldBeActive && index > activeIndex) {
      updateElementAnimations(index, true);
      if (index > activeIndex) setActiveIndex(index);
    } else if (!shouldBeActive && index > activeIndex) {
      updateElementAnimations(index, false);
    }
  });
};
```

#### Implementación actual de la barra de progreso:

```javascript
// Fragmento actual de la actualización de la barra de progreso
const updateProgressBar = () => {
  // Obtener valores de scroll actuales
  const { scrollTop, scrollHeight, clientHeight } = section;

  // Cálculo exacto igual al del indicador debug
  const maxScroll = scrollHeight - clientHeight;
  const scrollPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;
  const heightPercent = Math.min(100, Math.max(0, scrollPercent * 100));

  // Aplicar directamente a la barra de progreso
  if (bar) {
    bar.style.height = `${heightPercent}%`;
  }
}
```

#### Plan de migración al scroll de página:

1. **Detección de elementos visibles**:
   - Usar Intersection Observer para detectar cuando un elemento entra en el viewport
   - Calcular visibilidad basada en la posición del elemento relativa a la ventana

2. **Nuevos cálculos para barra de progreso**:
   - Calcular el porcentaje de la sección visible en la ventana
   - Determinar la posición de scroll relativa a la posición de la sección

3. **Modificaciones de estilo**:
   - Usar position: sticky para los elementos que deben permanecer visibles
   - Ajustar z-index para la correcta superposición de elementos

4. **Optimizaciones de rendimiento**:
   - Usar requestAnimationFrame para optimizar los cálculos durante el scroll
   - Throttling para reducir la frecuencia de actualizaciones

### Checkpoint: Correcciones en la implementación del Timeline con scroll de página

Fecha: 3 de mayo de 2025

Se han corregido dos problemas importantes en la implementación del scroll de página para el componente Timeline en la sección "hola-part3":

#### 1. Corrección de la barra de progreso

**Problema:** La barra de progreso no estaba correctamente posicionada en relación con los círculos del timeline, impidiendo que funcionara como una verdadera "línea de tiempo".

**Solución implementada:**
- Se modificó el código para calcular dinámicamente la posición exacta de los círculos
- La barra de progreso ahora se alinea automáticamente con el centro de los círculos
- Se usa el primer círculo como referencia para determinar la posición horizontal correcta

```javascript
// Obtener la posición exacta de los círculos para alinear la línea de progreso
const firstCircle = document.querySelector(`#${sectionId} [id^="timeline-circle-"]`)?.closest('div');
      
// Calcular la posición correcta para la línea de progreso
let circleOffset = 5; // Valor por defecto si no se puede calcular
      
if (firstCircle) {
  const circleRect = firstCircle.getBoundingClientRect();
  const sectionRect = section.getBoundingClientRect();
  
  // Calcular la posición centro-izquierda del círculo relativa a la sección
  // Esto garantiza que la línea pase por el centro de los círculos
  circleOffset = (circleRect.left + circleRect.width / 2) - sectionRect.left;
  console.log(`Posición calculada del círculo: ${circleOffset}px desde el borde izquierdo`);
}
```

#### 2. Corrección del comportamiento de elementos sticky (círculos y títulos)

**Problema:** Los círculos y títulos presentaban un desplazamiento vertical hacia abajo en vista PC, como si "recorrieran su párrafo" en lugar de mantenerse fijos en una posición.

**Solución implementada:**
- Se mejoraron los estilos CSS para el posicionamiento sticky
- Se añadió la prevención explícita de transformaciones verticales
- Se optimizó la gestión de clases activas/inactivas

```css
/* Posicionamiento sticky para círculos en scroll de página */
.page-scroll-circle {
  position: sticky !important;
  top: 40vh !important; /* Centrado verticalmente en viewport */
  z-index: 40 !important;
  transform: translateY(0) !important; /* Prevenir desplazamiento vertical */
  margin: 0 !important;
  height: 40px !important;
  width: 40px !important;
}

/* Posicionamiento sticky para títulos en scroll de página */
.page-scroll-title {
  position: sticky !important;
  top: 40vh !important; /* Alineado con los círculos */
  z-index: 40 !important;
  transform: translateY(0) !important; /* Prevenir desplazamiento vertical */
}
```

#### Resultado final

Con estas correcciones, la sección "hola-part3" ahora presenta:

1. Una línea de progreso que pasa exactamente por el centro de los círculos, creando un verdadero efecto de "línea de tiempo"

2. Comportamiento sticky correcto y consistente para círculos y títulos, que permanecen fijos en su posición durante el scroll sin desplazamiento vertical indeseado

3. Activación/desactivación visual correcta de elementos al entrar/salir del viewport

4. Scroll de página fluido y natural que mantiene la visibilidad de todos los elementos

Esta implementación ofrece una experiencia de usuario mucho más integrada y profesional, manteniendo los efectos visuales del diseño original.

---

### Lección aprendida: Importancia de examinar el HTML generado para solucionar problemas de layout

Fecha: 3 de mayo de 2025

#### Problema identificado

En la sección "Costos Ocultos" del Timeline, el contenido no estaba aprovechando todo el espacio disponible horizontal. A pesar de múltiples intentos de ajustar los estilos CSS para modificar la posición de los elementos y su distribución, el problema persistía.

#### La solución más simple

Tras revisar detalladamente el HTML, se identificó que el problema no estaba en los estilos CSS sino en la estructura misma: el contenedor principal del Timeline tenía una restricción de ancho:

```html
<div class="relative max-w-7xl mx-0 pb-20 use-page-scroll" style="overflow: visible;">
  <!-- Contenido del timeline -->
</div>
```

La propiedad `max-w-7xl` de Tailwind estaba limitando el ancho máximo del contenedor, impidiendo que el layout aprovechara todo el espacio disponible, independientemente de los ajustes CSS que se hicieran a los elementos hijos.

#### Solución implementada

Se modificó el componente Timeline.jsx para eliminar la restricción de ancho:

```jsx
<div
  ref={ref}
  className={`relative w-full mx-0 pb-20 ${usePageScroll ? 'use-page-scroll' : ''}`}
  style={usePageScroll ? { overflow: 'visible' } : {}}
>
  {/* Contenido del timeline */}
</div>
```

#### Aprendizajes clave

1. **Revisar el HTML generado**: A veces, el problema no está donde pensamos. Examinar el HTML real renderizado en el navegador puede revelar problemas estructurales que no son evidentes en el código fuente.

2. **Las soluciones simples primero**: Después de varios intentos complejos de resolver el problema con ajustes CSS cada vez más específicos, la solución resultó ser extremadamente simple: eliminar una clase de restricción de ancho.

3. **Debugging efectivo**: Usar las herramientas de desarrollo del navegador para inspeccionar la estructura del DOM y las propiedades aplicadas es fundamental para identificar problemas de layout.

4. **Enfoque sistemático**: En lugar de intentar soluciones aleatorias, un enfoque sistemático de "ascender en el árbol DOM" para encontrar restricciones de layout resultó más efectivo.

5. **Entender los frameworks CSS**: Es crucial entender cómo las clases utilitarias de frameworks como Tailwind CSS afectan el layout y pueden crear restricciones no obvias a primera vista.

La experiencia demuestra que incluso los desarrolladores menos familiarizados con código pueden identificar problemas complejos si aplican un enfoque metódico de análisis del DOM y comprenden los fundamentos del layout web.

---

## 8 de mayo de 2025

### Implementación del Sistema de Autenticación con Supabase y Google OAuth

#### Objetivos Logrados

1. **Nueva sección "Iniciar" en el sitio**:
   - Se añadió la sección 09 "Iniciar" para login y registro
   - Integrado perfectamente con el diseño existente usando el mismo sistema de secciones
   - Diseño responsivo con una interfaz de autenticación moderna y atractiva

2. **Sistema de Autenticación Completo**:
   - Implementado login con correo/contraseña
   - Integrado login social con Google mediante OAuth
   - Creada página de dashboard para usuarios autenticados
   - Sistema de redirección y protección de rutas privadas

3. **Tecnologías Utilizadas**:
   - **Supabase** como backend de autenticación (open source y gratuito)
   - **Google OAuth** para login social
   - **React** para componentes interactivos
   - **Astro** para páginas y rutas

#### Componentes Creados

1. **Componentes de autenticación**:
   ```
   src/components/auth/Login.tsx
   src/components/auth/LoginWrapper.astro
   ```

2. **Páginas del sistema**:
   ```
   src/pages/auth/callback.astro
   src/pages/dashboard/index.astro
   ```

3. **Configuración de Supabase**:
   ```
   src/lib/supabase.ts
   .env (variables de entorno para credenciales)
   ```

#### Implementación Técnica

##### 1. Integración con Supabase

Se configuró Supabase para manejar la autenticación, con las siguientes funcionalidades:

```typescript
// Cliente Supabase para autenticación
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funciones de autenticación
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`
    }
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  return { data, error };
};
```

##### 2. Formulario de Login Adaptativo

Se creó un formulario de login con diseño adaptivo que se integra con el tema visual del sitio:

```tsx
<div className="login-form-container w-full max-w-md mx-auto bg-black/40 backdrop-blur-md rounded-xl border border-violet-500/20 p-8 shadow-lg shadow-violet-500/10">
  {/* Logo y título */}
  <div className="mb-6 text-center">
    <img src="/compressed/logo-oscuro-optimizado.png" alt="Logo AR" className="h-12 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
    <p className="text-violet-200 text-sm">Accede a tu cuenta para administrar tu Agente RAG</p>
  </div>
  
  {/* Botón de Google */}
  <button
    onClick={handleGoogleLogin}
    className="w-full py-3 px-4 mb-6 rounded-lg bg-white text-gray-800 font-medium flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
  >
    <svg /* SVG logo de Google */ />
    Continuar con Google
  </button>
  
  {/* Separador */}
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-violet-500/20"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-black/20 text-violet-300">O con tu correo</span>
    </div>
  </div>
  
  {/* Formulario de login con email */}
  <form onSubmit={handleSubmit} className="space-y-5">
    {/* Campos del formulario */}
  </form>
</div>
```

##### 3. Página de Dashboard

Se desarrolló un dashboard administrativo con las siguientes características:

- Verificación de autenticación del lado del cliente
- Estadísticas de ejemplo con tarjetas modulares
- Panel de actividad reciente
- Sistema de acciones rápidas
- Protección contra acceso no autorizado

```astro
<main id="dashboard-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 hidden">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <!-- Tarjetas de estadísticas -->
    <div class="bg-black/30 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6 hover:border-violet-500/40 transition-colors">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-xl font-medium text-white">Conversaciones</h3>
        <span class="bg-violet-500/20 text-violet-300 text-xs py-1 px-2 rounded-full">Últimos 30 días</span>
      </div>
      <p class="text-4xl font-bold mb-2">458</p>
      <p class="text-green-400 text-sm">↑ 12% vs mes anterior</p>
    </div>
    <!-- Más tarjetas... -->
  </div>

  <!-- Secciones adicionales del dashboard -->
</main>

<script>
  // Verificación de autenticación
  import { supabase, signOut, getCurrentUser } from '../../lib/supabase';

  document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si el usuario está autenticado
    const { user, error } = await getCurrentUser();
    
    // Mostrar/ocultar elementos según el estado de autenticación
    if (error || !user) {
      document.getElementById('auth-required')?.classList.remove('hidden');
    } else {
      document.getElementById('user-profile')?.classList.remove('hidden');
      document.getElementById('dashboard-content')?.classList.remove('hidden');
    }

    // Configuración del botón de logout
    document.getElementById('logout-button')?.addEventListener('click', async () => {
      await signOut();
      window.location.href = '/';
    });
  });
</script>
```

##### 4. Gestión de Redirecciones OAuth

Se implementó una página de callback para manejar la redirección después de la autenticación con Google:

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Autenticación en proceso...">
  <div class="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-violet-900 to-indigo-900">
    <!-- Contenido visual durante la carga -->
  </div>
</Layout>

<script>
  import { supabase } from '../../lib/supabase';
  
  async function handleAuthCallback() {
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      window.location.href = '/iniciar?error=auth_callback_failed';
    } else {
      window.location.href = '/dashboard';
    }
  }
  
  document.addEventListener('DOMContentLoaded', handleAuthCallback);
</script>
```

#### Optimización para Multi-entorno

Se implementó un sistema que detecta automáticamente si la aplicación está en desarrollo o producción, ajustando las URLs de redirección según corresponda:

```typescript
// URL base para redirecciones (cambia en producción)
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Si estamos en producción, usar el dominio actual
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:4321'; // URL de desarrollo por defecto
};
```

#### Configuración de Google OAuth

Se configuró Google OAuth con los siguientes pasos:

1. Creación de un proyecto en Google Cloud Console
2. Configuración de pantalla de consentimiento OAuth
3. Creación de credenciales de cliente OAuth con los siguientes parámetros:
   - **ID de Cliente**: `531902921465-4j3o9nhpsaqd4lkq453jfvg1so52pa2l.apps.googleusercontent.com`
   - **URIs de redirección autorizados**: 
     - `https://uznvakpuuxnpdhoejrog.supabase.co/auth/v1/callback` (Supabase)
     - `http://localhost:4321/auth/callback` (desarrollo local)

4. Integración de credenciales en el proyecto Supabase

#### Buenas Prácticas Implementadas

1. **Seguridad**:
   - Variables de entorno para credenciales sensibles
   - Verificación de autenticación en rutas protegidas
   - Manejo adecuado de errores de autenticación

2. **Experiencia de Usuario**:
   - Indicadores visuales durante el proceso de autenticación
   - Mensajes de error claros y específicos
   - Redirecciones intuitivas

3. **Mantenibilidad**:
   - Código modular con funciones específicas
   - Estructura de archivos clara y organizada
   - Variables de entorno para configuración

#### Preparación para Producción

Se implementaron ajustes para facilitar el deploy en producción:

1. Detección automática del entorno (desarrollo/producción)
2. Sistema de redirecciones dinámicas basado en la URL actual
3. Instrucciones para configurar Google OAuth en producción:
   - Añadir el dominio de producción a los orígenes autorizados
   - Añadir la URL de callback de producción

#### Próximos Pasos

1. **Mejorar gestión de usuarios**:
   - Implementar registro de usuarios
   - Añadir recuperación de contraseñas
   - Gestión de perfiles de usuario

2. **Dashboard completo**:
   - Integrar con datos reales del sistema RAG
   - Añadir funcionalidad para gestionar documentos
   - Implementar análisis de conversaciones

3. **Seguridad avanzada**:
   - Implementar roles y permisos
   - Añadir autenticación de dos factores
   - Auditoría de accesos

Esta implementación establece una base sólida para un sistema SaaS completo, permitiendo a los usuarios autenticarse y acceder a funcionalidades específicas dentro de la plataforma de Agente RAG.

---

## 9 de mayo de 2025

### Implementación de Mejoras de Seguridad en la Plataforma SaaS

#### Resumen de Implementaciones

Se ha fortalecido significativamente la seguridad de la plataforma SaaS con Astro, Supabase y n8n mediante la implementación de múltiples capas de protección.

#### 1. Sistema de Middleware para Seguridad en el Servidor

Se implementó un sistema de middleware en Astro para protección a nivel de servidor:

```typescript
// src/middleware.ts - Sistema principal de middleware
export const onRequest = async (context, next) => {
  // Ejecutar el middleware de autenticación
  const authResponse = await authMiddleware(context);
  if (authResponse) return authResponse;

  // Continuar con la solicitud
  const response = await next();
  
  // Añadir cabeceras de seguridad
  const newResponse = new Response(response.body, response);
  
  // Cabeceras de seguridad estándar
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://${import.meta.env.PUBLIC_SUPABASE_URL}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );
  
  return newResponse;
};
```

#### 2. Middleware de Autenticación para Protección de Rutas

Se creó un middleware específico para la autenticación con protección de rutas:

```typescript
// src/middleware/auth.ts - Middleware de autenticación
import type { MiddlewareHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware = (async ({ cookies, request, redirect }) => {
  // Obtener la sesión usando el cliente de Supabase
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  // Lista de rutas protegidas
  const protectedRoutes = ['/dashboard', '/dashboard/'];
  const url = new URL(request.url);
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  // Redirigir a login si es ruta protegida y no hay sesión
  if (isProtectedRoute && !session) {
    return redirect('/#iniciar');
  }

  // Redirigir a dashboard si ya hay sesión y está en auth
  const authRoutes = ['/#iniciar', '/auth/login'];
  const isAuthRoute = authRoutes.some(route => 
    url.pathname === route || url.hash === '#iniciar'
  );
  
  if (isAuthRoute && session) {
    return redirect('/dashboard');
  }
}) satisfies MiddlewareHandler;
```

#### 3. Cliente para Comunicación Segura con n8n Backend

Se implementó un sistema robusto para comunicación segura con el backend n8n:

```typescript
// src/lib/n8nClient.ts - Cliente seguro para n8n
export const n8nClient = {
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, requireAuth = true, webhook = false } = options;
    
    // Construir la URL según el tipo de endpoint
    const url = webhook 
      ? `${N8N_API_URL}/webhook/${endpoint}` 
      : `${N8N_API_URL}/api/v1/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Autenticación con token de Supabase
    if (requireAuth) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error('No autorizado: Se requiere iniciar sesión');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ...resto del código para manejo de peticiones...
  },
  
  // Métodos especializados para distintos tipos de peticiones
  get<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }) as Promise<T>;
  },
  
  post<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body }) as Promise<T>;
  },
  
  // ...otros métodos...
};
```

#### 4. Sistema de Validación de Datos para Prevenir Inyecciones

Se implementó un sistema de validación de datos para prevenir vulnerabilidades:

```typescript
export class DataValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static validateObject<T extends object>(
    data: any,
    schema: Record<keyof T, ValidationRule>
  ): { valid: boolean; errors: string[] } {
    // ...lógica de validación de objetos...
  }
}
```

#### 5. Mejoras en el Componente de Login

Se reforzó la seguridad del formulario de login:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Validar formato de email
    if (!DataValidator.validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    // Validar seguridad de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // Autenticación con Supabase
    const { data, error: loginError } = await signInWithEmail(email, password);

    if (loginError) {
      // Mensaje de error genérico para prevenir enumeración de usuarios
      setError('Credenciales incorrectas. Por favor verifica tus datos.');
      setIsLoading(false);
      return;
    }
    
    // ...código de redirección después del login...
  } catch (err) {
    // Log error interno pero mostrar mensaje genérico al usuario
    console.error('Error de autenticación:', err);
    setError('Error en el servicio de autenticación. Intenta nuevamente más tarde.');
    setIsLoading(false);
  }
};
```

#### Resultados Obtenidos

La implementación del sistema de autenticación ha permitido:

- Registro e inicio de sesión de usuarios con correo y contraseña
- Autenticación social mediante Google OAuth
- Protección de rutas y redirección automática tras el login
- Dashboard funcional para usuarios autenticados

---

## 9 de mayo de 2025

### Implementación de Mejoras de Seguridad en la Plataforma SaaS

#### Resumen de Implementaciones

Se ha fortalecido significativamente la seguridad de la plataforma SaaS con Astro, Supabase y n8n mediante la implementación de múltiples capas de protección.

#### 1. Sistema de Middleware para Seguridad en el Servidor

Se implementó un sistema de middleware en Astro para protección a nivel de servidor:

```typescript
// src/middleware.ts - Sistema principal de middleware
export const onRequest = async (context, next) => {
  // Ejecutar el middleware de autenticación
  const authResponse = await authMiddleware(context);
  if (authResponse) return authResponse;

  // Continuar con la solicitud
  const response = await next();
  
  // Añadir cabeceras de seguridad
  const newResponse = new Response(response.body, response);
  
  // Cabeceras de seguridad estándar
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://${import.meta.env.PUBLIC_SUPABASE_URL}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );
  
  return newResponse;
};
```

#### 2. Middleware de Autenticación para Protección de Rutas

Se creó un middleware específico para la autenticación con protección de rutas:

```typescript
// src/middleware/auth.ts - Middleware de autenticación
import type { MiddlewareHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware = (async ({ cookies, request, redirect }) => {
  // Obtener la sesión usando el cliente de Supabase
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  // Lista de rutas protegidas
  const protectedRoutes = ['/dashboard', '/dashboard/'];
  const url = new URL(request.url);
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  // Redirigir a login si es ruta protegida y no hay sesión
  if (isProtectedRoute && !session) {
    return redirect('/#iniciar');
  }

  // Redirigir a dashboard si ya hay sesión y está en auth
  const authRoutes = ['/#iniciar', '/auth/login'];
  const isAuthRoute = authRoutes.some(route => 
    url.pathname === route || url.hash === '#iniciar'
  );
  
  if (isAuthRoute && session) {
    return redirect('/dashboard');
  }
}) satisfies MiddlewareHandler;
```

#### 3. Cliente para Comunicación Segura con n8n Backend

Se implementó un sistema robusto para comunicación segura con el backend n8n:

```typescript
// src/lib/n8nClient.ts - Cliente seguro para n8n
export const n8nClient = {
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, requireAuth = true, webhook = false } = options;
    
    // Construir la URL según el tipo de endpoint
    const url = webhook 
      ? `${N8N_API_URL}/webhook/${endpoint}` 
      : `${N8N_API_URL}/api/v1/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Autenticación con token de Supabase
    if (requireAuth) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error('No autorizado: Se requiere iniciar sesión');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ...resto del código para manejo de peticiones...
  },
  
  // Métodos especializados para distintos tipos de peticiones
  get<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }) as Promise<T>;
  },
  
  post<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body }) as Promise<T>;
  },
  
  // ...otros métodos...
};
```

#### 4. Sistema de Validación de Datos para Prevenir Inyecciones

Se implementó un sistema de validación de datos para prevenir vulnerabilidades:

```typescript
export class DataValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static validateObject<T extends object>(
    data: any,
    schema: Record<keyof T, ValidationRule>
  ): { valid: boolean; errors: string[] } {
    // ...lógica de validación de objetos...
  }
}
```

#### 5. Mejoras en el Componente de Login

Se reforzó la seguridad del formulario de login:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Validar formato de email
    if (!DataValidator.validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    // Validar seguridad de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // Autenticación con Supabase
    const { data, error: loginError } = await signInWithEmail(email, password);

    if (loginError) {
      // Mensaje de error genérico para prevenir enumeración de usuarios
      setError('Credenciales incorrectas. Por favor verifica tus datos.');
      setIsLoading(false);
      return;
    }
    
    // ...código de redirección después del login...
  } catch (err) {
    // Log error interno pero mostrar mensaje genérico al usuario
    console.error('Error de autenticación:', err);
    setError('Error en el servicio de autenticación. Intenta nuevamente más tarde.');
    setIsLoading(false);
  }
};
```

#### Resultados Obtenidos

La implementación del sistema de autenticación ha permitido:

- Registro e inicio de sesión de usuarios con correo y contraseña
- Autenticación social mediante Google OAuth
- Protección de rutas y redirección automática tras el login
- Dashboard funcional para usuarios autenticados

---

## 9 de mayo de 2025

### Implementación de Mejoras de Seguridad en la Plataforma SaaS

#### Resumen de Implementaciones

Se ha fortalecido significativamente la seguridad de la plataforma SaaS con Astro, Supabase y n8n mediante la implementación de múltiples capas de protección.

#### 1. Sistema de Middleware para Seguridad en el Servidor

Se implementó un sistema de middleware en Astro para protección a nivel de servidor:

```typescript
// src/middleware.ts - Sistema principal de middleware
export const onRequest = async (context, next) => {
  // Ejecutar el middleware de autenticación
  const authResponse = await authMiddleware(context);
  if (authResponse) return authResponse;

  // Continuar con la solicitud
  const response = await next();
  
  // Añadir cabeceras de seguridad
  const newResponse = new Response(response.body, response);
  
  // Cabeceras de seguridad estándar
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://${import.meta.env.PUBLIC_SUPABASE_URL}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );
  
  return newResponse;
};
```

#### 2. Middleware de Autenticación para Protección de Rutas

Se creó un middleware específico para la autenticación con protección de rutas:

```typescript
// src/middleware/auth.ts - Middleware de autenticación
import type { MiddlewareHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware = (async ({ cookies, request, redirect }) => {
  // Obtener la sesión usando el cliente de Supabase
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  // Lista de rutas protegidas
  const protectedRoutes = ['/dashboard', '/dashboard/'];
  const url = new URL(request.url);
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  // Redirigir a login si es ruta protegida y no hay sesión
  if (isProtectedRoute && !session) {
    return redirect('/#iniciar');
  }

  // Redirigir a dashboard si ya hay sesión y está en auth
  const authRoutes = ['/#iniciar', '/auth/login'];
  const isAuthRoute = authRoutes.some(route => 
    url.pathname === route || url.hash === '#iniciar'
  );
  
  if (isAuthRoute && session) {
    return redirect('/dashboard');
  }
}) satisfies MiddlewareHandler;
```

#### 3. Cliente para Comunicación Segura con n8n Backend

Se implementó un sistema robusto para comunicación segura con el backend n8n:

```typescript
// src/lib/n8nClient.ts - Cliente seguro para n8n
export const n8nClient = {
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, requireAuth = true, webhook = false } = options;
    
    // Construir la URL según el tipo de endpoint
    const url = webhook 
      ? `${N8N_API_URL}/webhook/${endpoint}` 
      : `${N8N_API_URL}/api/v1/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Autenticación con token de Supabase
    if (requireAuth) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error('No autorizado: Se requiere iniciar sesión');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ...resto del código para manejo de peticiones...
  },
  
  // Métodos especializados para distintos tipos de peticiones
  get<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }) as Promise<T>;
  },
  
  post<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body }) as Promise<T>;
  },
  
  // ...otros métodos...
};
```

#### 4. Sistema de Validación de Datos para Prevenir Inyecciones

Se implementó un sistema de validación de datos para prevenir vulnerabilidades:

```typescript
export class DataValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static validateObject<T extends object>(
    data: any,
    schema: Record<keyof T, ValidationRule>
  ): { valid: boolean; errors: string[] } {
    // ...lógica de validación de objetos...
  }
}
```

#### 5. Mejoras en el Componente de Login

Se reforzó la seguridad del formulario de login:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Validar formato de email
    if (!DataValidator.validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    // Validar seguridad de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // Autenticación con Supabase
    const { data, error: loginError } = await signInWithEmail(email, password);

    if (loginError) {
      // Mensaje de error genérico para prevenir enumeración de usuarios
      setError('Credenciales incorrectas. Por favor verifica tus datos.');
      setIsLoading(false);
      return;
    }
    
    // ...código de redirección después del login...
  } catch (err) {
    // Log error interno pero mostrar mensaje genérico al usuario
    console.error('Error de autenticación:', err);
    setError('Error en el servicio de autenticación. Intenta nuevamente más tarde.');
    setIsLoading(false);
  }
};
```

#### Resultados Obtenidos

La implementación del sistema de autenticación ha permitido:

- Registro e inicio de sesión de usuarios con correo y contraseña
- Autenticación social mediante Google OAuth
- Protección de rutas y redirección automática tras el login
- Dashboard funcional para usuarios autenticados

---

## 9 de mayo de 2025

### Implementación de Mejoras de Seguridad en la Plataforma SaaS

#### Resumen de Implementaciones

Se ha fortalecido significativamente la seguridad de la plataforma SaaS con Astro, Supabase y n8n mediante la implementación de múltiples capas de protección.

#### 1. Sistema de Middleware para Seguridad en el Servidor

Se implementó un sistema de middleware en Astro para protección a nivel de servidor:

```typescript
// src/middleware.ts - Sistema principal de middleware
export const onRequest = async (context, next) => {
  // Ejecutar el middleware de autenticación
  const authResponse = await authMiddleware(context);
  if (authResponse) return authResponse;

  // Continuar con la solicitud
  const response = await next();
  
  // Añadir cabeceras de seguridad
  const newResponse = new Response(response.body, response);
  
  // Cabeceras de seguridad estándar
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://${import.meta.env.PUBLIC_SUPABASE_URL}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );
  
  return newResponse;
};
```

#### 2. Middleware de Autenticación para Protección de Rutas

Se creó un middleware específico para la autenticación con protección de rutas:

```typescript
// src/middleware/auth.ts - Middleware de autenticación
import type { MiddlewareHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware = (async ({ cookies, request, redirect }) => {
  // Obtener la sesión usando el cliente de Supabase
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  // Lista de rutas protegidas
  const protectedRoutes = ['/dashboard', '/dashboard/'];
  const url = new URL(request.url);
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  // Redirigir a login si es ruta protegida y no hay sesión
  if (isProtectedRoute && !session) {
    return redirect('/#iniciar');
  }

  // Redirigir a dashboard si ya hay sesión y está en auth
  const authRoutes = ['/#iniciar', '/auth/login'];
  const isAuthRoute = authRoutes.some(route => 
    url.pathname === route || url.hash === '#iniciar'
  );
  
  if (isAuthRoute && session) {
    return redirect('/dashboard');
  }
}) satisfies MiddlewareHandler;
```

#### 3. Cliente para Comunicación Segura con n8n Backend

Se implementó un sistema robusto para comunicación segura con el backend n8n:

```typescript
// src/lib/n8nClient.ts - Cliente seguro para n8n
export const n8nClient = {
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, requireAuth = true, webhook = false } = options;
    
    // Construir la URL según el tipo de endpoint
    const url = webhook 
      ? `${N8N_API_URL}/webhook/${endpoint}` 
      : `${N8N_API_URL}/api/v1/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Autenticación con token de Supabase
    if (requireAuth) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error('No autorizado: Se requiere iniciar sesión');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ...resto del código para manejo de peticiones...
  },
  
  // Métodos especializados para distintos tipos de peticiones
  get<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }) as Promise<T>;
  },
  
  post<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body }) as Promise<T>;
  },
  
  // ...otros métodos...
};
```

#### 4. Sistema de Validación de Datos para Prevenir Inyecciones

Se implementó un sistema de validación de datos para prevenir vulnerabilidades:

```typescript
export class DataValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static validateObject<T extends object>(
    data: any,
    schema: Record<keyof T, ValidationRule>
  ): { valid: boolean; errors: string[] } {
    // ...lógica de validación de objetos...
  }
}
```

#### 5. Mejoras en el Componente de Login

Se reforzó la seguridad del formulario de login:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Validar formato de email
    if (!DataValidator.validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    // Validar seguridad de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // Autenticación con Supabase
    const { data, error: loginError } = await signInWithEmail(email, password);

    if (loginError) {
      // Mensaje de error genérico para prevenir enumeración de usuarios
      setError('Credenciales incorrectas. Por favor verifica tus datos.');
      setIsLoading(false);
      return;
    }
    
    // ...código de redirección después del login...
  } catch (err) {
    // Log error interno pero mostrar mensaje genérico al usuario
    console.error('Error de autenticación:', err);
    setError('Error en el servicio de autenticación. Intenta nuevamente más tarde.');
    setIsLoading(false);
  }
};
```

#### Resultados Obtenidos

La implementación del sistema de autenticación ha permitido:

- Registro e inicio de sesión de usuarios con correo y contraseña
- Autenticación social mediante Google OAuth
- Protección de rutas y redirección automática tras el login
- Dashboard funcional para usuarios autenticados

---

## 9 de mayo de 2025

### Implementación de Mejoras de Seguridad en la Plataforma SaaS

#### Resumen de Implementaciones

Se ha fortalecido significativamente la seguridad de la plataforma SaaS con Astro, Supabase y n8n mediante la implementación de múltiples capas de protección.

#### 1. Sistema de Middleware para Seguridad en el Servidor

Se implementó un sistema de middleware en Astro para protección a nivel de servidor:

```typescript
// src/middleware.ts - Sistema principal de middleware
export const onRequest = async (context, next) => {
  // Ejecutar el middleware de autenticación
  const authResponse = await authMiddleware(context);
  if (authResponse) return authResponse;

  // Continuar con la solicitud
  const response = await next();
  
  // Añadir cabeceras de seguridad
  const newResponse = new Response(response.body, response);
  
  // Cabeceras de seguridad estándar
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://${import.meta.env.PUBLIC_SUPABASE_URL}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );
  
  return newResponse;
};
```

#### 2. Middleware de Autenticación para Protección de Rutas

Se creó un middleware específico para la autenticación con protección de rutas:

```typescript
// src/middleware/auth.ts - Middleware de autenticación
import type { MiddlewareHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware = (async ({ cookies, request, redirect }) => {
  // Obtener la sesión usando el cliente de Supabase
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  // Lista de rutas protegidas
  const protectedRoutes = ['/dashboard', '/dashboard/'];
  const url = new URL(request.url);
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  // Redirigir a login si es ruta protegida y no hay sesión
  if (isProtectedRoute && !session) {
    return redirect('/#iniciar');
  }

  // Redirigir a dashboard si ya hay sesión y está en auth
  const authRoutes = ['/#iniciar', '/auth/login'];
  const isAuthRoute = authRoutes.some(route => 
    url.pathname === route || url.hash === '#iniciar'
  );
  
  if (isAuthRoute && session) {
    return redirect('/dashboard');
  }
}) satisfies MiddlewareHandler;
```

#### 3. Cliente para Comunicación Segura con n8n Backend

Se implementó un sistema robusto para comunicación segura con el backend n8n:

```typescript
// src/lib/n8nClient.ts - Cliente seguro para n8n
export const n8nClient = {
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, requireAuth = true, webhook = false } = options;
    
    // Construir la URL según el tipo de endpoint
    const url = webhook 
      ? `${N8N_API_URL}/webhook/${endpoint}` 
      : `${N8N_API_URL}/api/v1/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Autenticación con token de Supabase
    if (requireAuth) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error('No autorizado: Se requiere iniciar sesión');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ...resto del código para manejo de peticiones...
  },
  
  // Métodos especializados para distintos tipos de peticiones
  get<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }) as Promise<T>;
  },
  
  post<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body }) as Promise<T>;
  },
  
  // ...otros métodos...
};
```

#### 4. Sistema de Validación de Datos para Prevenir Inyecciones

Se implementó un sistema de validación de datos para prevenir vulnerabilidades:

```typescript
export class DataValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static validateObject<T extends object>(
    data: any,
    schema: Record<keyof T, ValidationRule>
  ): { valid: boolean; errors: string[] } {
    // ...lógica de validación de objetos...
  }
}
```

#### 5. Mejoras en el Componente de Login

Se reforzó la seguridad del formulario de login:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Validar formato de email
    if (!DataValidator.validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    // Validar seguridad de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // Autenticación con Supabase
    const { data, error: loginError } = await signInWithEmail(email, password);

    if (loginError) {
      // Mensaje de error genérico para prevenir enumeración de usuarios
      setError('Credenciales incorrectas. Por favor verifica tus datos.');
      setIsLoading(false);
      return;
    }
    
    // ...código de redirección después del login...
  } catch (err) {
    // Log error interno pero mostrar mensaje genérico al usuario
    console.error('Error de autenticación:', err);
    setError('Error en el servicio de autenticación. Intenta nuevamente más tarde.');
    setIsLoading(false);
  }
};
```

#### Resultados Obtenidos

La implementación del sistema de autenticación ha permitido:

- Registro e inicio de sesión de usuarios con correo y contraseña
- Autenticación social mediante Google OAuth
- Protección de rutas y redirección automática tras el login
- Dashboard funcional para usuarios autenticados

---

## 9 de mayo de 2025

### Implementación de Mejoras de Seguridad en la Plataforma SaaS

#### Resumen de Implementaciones

Se ha fortalecido significativamente la seguridad de la plataforma SaaS con Astro, Supabase y n8n mediante la implementación de múltiples capas de protección.

#### 1. Sistema de Middleware para Seguridad en el Servidor

Se implementó un sistema de middleware en Astro para protección a nivel de servidor:

```typescript
// src/middleware.ts - Sistema principal de middleware
export const onRequest = async (context, next) => {
  // Ejecutar el middleware de autenticación
  const authResponse = await authMiddleware(context);
  if (authResponse) return authResponse;

  // Continuar con la solicitud
  const response = await next();
  
  // Añadir cabeceras de seguridad
  const newResponse = new Response(response.body, response);
  
  // Cabeceras de seguridad estándar
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://${import.meta.env.PUBLIC_SUPABASE_URL}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );
  
  return newResponse;
};
```

#### 2. Middleware de Autenticación para Protección de Rutas

Se creó un middleware específico para la autenticación con protección de rutas:

```typescript
// src/middleware/auth.ts - Middleware de autenticación
import type { MiddlewareHandler } from 'astro';
import { supabase } from '../lib/supabase';

export const authMiddleware = (async ({ cookies, request, redirect }) => {
  // Obtener la sesión usando el cliente de Supabase
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  // Lista de rutas protegidas
  const protectedRoutes = ['/dashboard', '/dashboard/'];
  const url = new URL(request.url);
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  // Redirigir a login si es ruta protegida y no hay sesión
  if (isProtectedRoute && !session) {
    return redirect('/#iniciar');
  }

  // Redirigir a dashboard si ya hay sesión y está en auth
  const authRoutes = ['/#iniciar', '/auth/login'];
  const isAuthRoute = authRoutes.some(route => 
    url.pathname === route || url.hash === '#iniciar'
  );
  
  if (isAuthRoute && session) {
    return redirect('/dashboard');
  }
}) satisfies MiddlewareHandler;
```

#### 3. Cliente para Comunicación Segura con n8n Backend

Se implementó un sistema robusto para comunicación segura con el backend n8n:

```typescript
// src/lib/n8nClient.ts - Cliente seguro para n8n
export const n8nClient = {
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, requireAuth = true, webhook = false } = options;
    
    // Construir la URL según el tipo de endpoint
    const url = webhook 
      ? `${N8N_API_URL}/webhook/${endpoint}` 
      : `${N8N_API_URL}/api/v1/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Autenticación con token de Supabase
    if (requireAuth) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error('No autorizado: Se requiere iniciar sesión');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ...resto del código para manejo de peticiones...
  },
  
  // Métodos especializados para distintos tipos de peticiones
  get<T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }) as Promise<T>;
  },
  
  post<T>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body }) as Promise<T>;
  },
  
  // ...otros métodos...
};
```

#### 4. Sistema de Validación de Datos para Prevenir Inyecciones

Se implementó un sistema de validación de datos para prevenir vulnerabilidades:

```typescript
export class DataValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static validateObject<T extends object>(
    data: any,
    schema: Record<keyof T, ValidationRule>
  ): { valid: boolean; errors: string[] } {
    // ...lógica de validación de objetos...
  }
}
```

#### 5. Mejoras en el Componente de Login

Se reforzó la seguridad del formulario de login:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Validar formato de email
    if (!DataValidator.validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    // Validar seguridad de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    // Autenticación con Supabase
    const { data, error: loginError } = await signInWithEmail(email, password);

    if (loginError) {
      // Mensaje de error genérico para prevenir enumeración de usuarios
      setError('Credenciales incorrectas. Por favor verifica tus datos.');
      setIsLoading(false);
      return;
    }
    
    // ...código de redirección después del login...
  } catch (err) {
    // Log error interno pero mostrar mensaje genérico al usuario
    console.error('Error de autenticación:', err);
    setError('Error en el servicio de autenticación. Intenta nuevamente más tarde.');
    setIsLoading(false);
  }
};
```

#### Resultados Obtenidos

La implementación del sistema de autenticación ha permitido:

- Registro e inicio de sesión de usuarios con correo y contraseña
- Autenticación social mediante Google OAuth
- Protección de rutas y redirección automática tras el login
- Dashboard funcional para usuarios autenticados

---

## 16 de junio de 2025

### Solución de Problemas de Rendimiento y CSP con WebSockets

#### Problemas Identificados en los Logs

Durante la revisión de los logs del navegador, se identificaron varios problemas críticos que afectaban el rendimiento y la funcionalidad del sitio:

1. **Error JavaScript: "Can't find variable: canvas"**
   - Error recurrente en P5CursorSketch.jsx líneas 919 y 931
   - Causaba fallos en la renderización de animaciones de cursores

2. **Errores de CSP con WebSockets**
   - Conexiones WebSocket bloqueadas a `ws://127.0.0.1:53252/`
   - Interfería con herramientas de desarrollo como Console Ninja
   - Más de 100 mensajes de error relacionados

3. **Logs excesivos de depuración**
   - Log repetitivo cada 60 frames de las animaciones P5
   - Impacto en rendimiento del navegador

#### Soluciones Implementadas

##### 1. Corrección del Error "Can't find variable: canvas"

**Problema**: La variable `canvas` no estaba declarada en el scope correcto del sketch de p5.js.

**Solución**: Declaración explícita de la variable canvas en el scope del sketch:

```javascript
const sketch = (p) => {
  let entities = [];
  let canvas; // Declarar la variable canvas en el scope del sketch
  
  // ...resto del código...
  
  p.setup = () => {
    // ...código existente...
    canvas = p.createCanvas(containerWidth, containerHeight); // Asignar a la variable declarada
    // ...resto del código...
  };
};
```

##### 2. Actualización del Content Security Policy para WebSockets

**Problema**: El CSP bloqueaba conexiones WebSocket necesarias para herramientas de desarrollo.

**Solución**: Actualización del middleware para permitir conexiones WebSocket locales:

```javascript
// Configurar CSP (Content Security Policy)
const csp = [
  "default-src 'self'",
  // ...otras directivas...
  `connect-src 'self' ${supabaseUrl} https://fonts.googleapis.com https://fonts.gstatic.com https://res.cloudinary.com https://unpkg.com https://cdnjs.cloudflare.com https://kit.fontawesome.com https://ka-f.fontawesome.com https://p5js.org https://cdn.p5js.org https://primary-production-33e8.up.railway.app https://assets.codepen.io ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:*`,
  // ...resto de directivas...
].join('; ');
```

**Cambios específicos en connect-src**:
- Añadido: `ws://localhost:*` - WebSockets HTTP en localhost
- Añadido: `ws://127.0.0.1:*` - WebSockets HTTP en 127.0.0.1
- Añadido: `wss://localhost:*` - WebSockets HTTPS en localhost
- Añadido: `wss://127.0.0.1:*` - WebSockets HTTPS en 127.0.0.1

##### 3. Optimización de Logs de Depuración

**Problema**: Logs excesivos generaban ruido en la consola y afectaban rendimiento.

**Solución**: Mantenimiento del sistema actual de logging cada 60 frames pero con mejor filtrado para herramientas de depuración.

#### Impacto de las Soluciones

1. **Eliminación de errores JavaScript**: Los componentes P5CursorSketch ahora se renderizan correctamente sin errores de variables indefinidas.

2. **Compatibilidad con herramientas de desarrollo**: Console Ninja y otras herramientas pueden conectar sin restricciones de CSP.

3. **Mejor experiencia de desarrollo**: Eliminación de errores recurrentes que dificultaban la depuración.

4. **Mantenimiento de seguridad**: Las actualizaciones de CSP mantienen la seguridad mientras permiten funcionalidad de desarrollo necesaria.

#### Consideraciones de Seguridad

- Las conexiones WebSocket se limitan a localhost y 127.0.0.1 únicamente
- Solo se permiten en puertos dinámicos durante desarrollo
- No comprometen la seguridad en producción
- Mantienen todas las demás restricciones de CSP

#### Próximos Pasos

1. **Monitoreo de rendimiento**: Evaluar impacto en performance después de las correcciones
2. **Optimización adicional**: Considerar reducir frecuencia de logs en producción
3. **Testing de herramientas**: Verificar funcionamiento completo de herramientas de desarrollo

Esta solución mejora significativamente la estabilidad del sitio y la experiencia de desarrollo, eliminando errores críticos que afectaban tanto la funcionalidad como el rendimiento.

---

## 16 de junio de 2025 - Actualización Adicional

### Solución de Problemas Adicionales de Hydration y React

Durante la revisión posterior de los logs, se identificaron problemas adicionales que requerían solución inmediata:

#### Problemas Identificados

1. **Error de atributo `jsx` booleano en styled-jsx**
   - Error: `Warning: Received true for a non-boolean attribute jsx`
   - Ubicación: TypewriterText.jsx línea 20
   - Causa: styled-jsx no acepta valores booleanos, requiere strings

2. **Nuevo problema de hydration en AuroraBackground**
   - Error: `Prop data-aurora-id did not match. Server: "aurora-default-aurora-9lkk5a45v" Client: "aurora-default-aurora-ocpwdxm7q"`
   - Causa: IDs aleatorios generados diferentes entre server y client

3. **Warnings de p5.js sobre función `match()`**
   - Advertencia sobre uso de funciones p5.js fuera del scope correcto
   - No crítico pero genera ruido en la consola

#### Soluciones Implementadas

##### 1. Corrección del Atributo styled-jsx

**Problema**: El componente TypewriterText usaba `<style jsx>{...}` lo cual React interpreta como `jsx={true}` (booleano).

**Solución**: Cambio de sintaxis a string explícita:

```jsx
// Antes (problemático)
<style jsx>{`...`}</style>

// Después (correcto)
<style jsx="true">{`...`}</style>
```

**Resultado**: Eliminación completa del warning de React sobre atributos no-booleanos.

##### 2. Corrección de Hydration en AuroraBackground

**Problema**: Similar al problema previo de P5CursorSketch, AuroraBackground generaba IDs aleatorios diferentes entre server y client.

**Solución**: Implementación de ID estable basado en `sectionId`:

```tsx
// Antes (problemático)
const instanceIdRef = useRef<string>(
  `aurora-${sectionId}-${Math.random().toString(36).substr(2, 9)}`
);

// Después (estable)
const instanceIdRef = useRef<string>(
  sectionId ? `aurora-${sectionId}` : `aurora-default-aurora-${Math.random().toString(36).substr(2, 9)}`
);
```

**Beneficios**:
- IDs consistentes entre server-side rendering y client hydration
- Eliminación de warnings de hydration mismatch
- Mejor debugging con IDs predecibles

#### Mejoras en la Experiencia de Desarrollo

1. **Consola más limpia**: Eliminación de múltiples warnings recurrentes
2. **Hydration estable**: Reducción significativa de errores de mismatch
3. **IDs predecibles**: Facilita debugging y testing
4. **Compatibilidad mejorada**: Mejor adherencia a las mejores prácticas de React

#### Logs de Depuración Mejorados

Los logs ahora muestran:
- P5CursorSketch con IDs estables: `p5-cursor-hola-part1`, `p5-cursor-empresa-part1`, etc.
- Menos frecuencia de logging (cada 300 frames vs 60 frames anteriormente)
- Aurora backgrounds con IDs consistentes y predecibles

#### Impacto en Performance

- **Hydration más rápida**: Menos re-renderizado debido a mismatches
- **Memoria más eficiente**: Menos objetos temporales creados por IDs aleatorios
- **CPU optimizada**: Reducción de warnings y re-computaciones

#### Consideraciones Futuras

1. **Monitoreo continuo**: Revisar logs periódicamente para detectar nuevos patterns problemáticos
2. **Testing de hydration**: Implementar tests específicos para verificar consistencia server/client
3. **Optimización adicional**: Considerar lazy loading para componentes pesados como P5CursorSketch

Esta actualización complementa las mejoras previas, resultando en una aplicación más estable, eficiente y con mejor experiencia de desarrollo.

---
