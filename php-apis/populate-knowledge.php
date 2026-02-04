<?php
/**
 * Script para llenar la base de conocimientos RAG
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config-rag.php';

try {
    global $DB_CONFIG;
    $pdo = new PDO(
        "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
        $DB_CONFIG['username'],
        $DB_CONFIG['password']
    );
    
    // Datos de conocimiento técnico y empresarial
    $knowledgeData = [
        // Tecnología básica
        [
            'title' => 'Qué es un Framework',
            'content' => 'Un framework es una estructura de software que proporciona una base para desarrollar aplicaciones. Incluye bibliotecas, herramientas y convenciones que facilitan el desarrollo. Ejemplos populares: React, Angular, Laravel, Django. Los frameworks aceleran el desarrollo y mantienen código organizado.',
            'category' => 'tecnologia',
            'keywords' => 'framework, desarrollo, software, estructura, bibliotecas, herramientas, programación'
        ],
        [
            'title' => 'Langchain Framework',
            'content' => 'Langchain es un framework para desarrollar aplicaciones con modelos de lenguaje (LLMs). Facilita la creación de chatbots, sistemas RAG, y aplicaciones de IA conversacional. Permite conectar LLMs con bases de datos, APIs y otras fuentes de información.',
            'category' => 'ia-frameworks',
            'keywords' => 'langchain, llm, chatbot, rag, ia conversacional, modelos de lenguaje'
        ],
        [
            'title' => 'Sistemas RAG Explicados',
            'content' => 'RAG (Retrieval-Augmented Generation) combina búsqueda de información con generación de texto. Permite que los chatbots accedan a bases de datos específicas para dar respuestas precisas. Ideal para empresas que necesitan asistentes con conocimiento especializado.',
            'category' => 'rag-sistemas',
            'keywords' => 'rag, retrieval, generation, chatbot, base datos, conocimiento, asistente'
        ],
        [
            'title' => 'APIs y Integraciones',
            'content' => 'Una API (Application Programming Interface) permite que diferentes sistemas se comuniquen. Las empresas usan APIs para conectar sus sistemas internos, integrar servicios externos, y automatizar procesos. Ejemplos: API de Google Calendar, WhatsApp Business API.',
            'category' => 'tecnologia',
            'keywords' => 'api, integracion, sistemas, comunicacion, automatizacion, servicios'
        ],
        [
            'title' => 'Automatización de Procesos con IA',
            'content' => 'La automatización con IA puede reducir costos operativos hasta 60%. Incluye chatbots para atención al cliente, procesamiento automático de documentos, análisis predictivo, y optimización de inventarios. ROI típico: 200-400% en el primer año.',
            'category' => 'automatizacion',
            'keywords' => 'automatizacion, ia, costos, roi, chatbots, procesos, optimizacion'
        ],
        [
            'title' => 'Chatbots para Restaurantes y Food Trucks',
            'content' => 'Los chatbots pueden automatizar pedidos, gestionar inventario, y mejorar atención al cliente en restaurantes. Integración con WhatsApp, sistemas POS, y apps de delivery. Reducen tiempo de atención 70% y errores de pedidos 80%.',
            'category' => 'chatbots-restaurantes',
            'keywords' => 'chatbot, restaurante, food truck, pedidos, whatsapp, pos, delivery'
        ],
        [
            'title' => 'Transformación Digital para PyMEs',
            'content' => 'La transformación digital para pequeñas empresas incluye: automatización de procesos, CRM, sistemas de inventario, marketing digital, y análisis de datos. Inversión inicial: $5,000-$20,000. Ahorro anual: 20-40% en costos operativos.',
            'category' => 'transformacion-digital',
            'keywords' => 'transformacion digital, pyme, crm, inventario, marketing, analisis datos'
        ],
        [
            'title' => 'Inteligencia Artificial para Negocios',
            'content' => 'La IA empresarial incluye: chatbots, análisis predictivo, automatización de marketing, optimización de precios, y detección de fraudes. Sectores más beneficiados: retail, servicios, manufactura, y finanzas.',
            'category' => 'ia-negocios',
            'keywords' => 'inteligencia artificial, negocios, predictivo, marketing, precios, fraudes'
        ],
        [
            'title' => 'Desarrollo de Apps Móviles',
            'content' => 'Las apps móviles para negocios mejoran experiencia del cliente y operaciones internas. Incluyen: apps de pedidos, loyalty programs, notificaciones push, y analytics. Costo desarrollo: $10,000-$50,000. ROI promedio: 300%.',
            'category' => 'apps-moviles',
            'keywords' => 'app movil, desarrollo, pedidos, loyalty, notificaciones, analytics'
        ],
        [
            'title' => 'Sistemas de Inventario Inteligentes',
            'content' => 'Los sistemas de inventario con IA predicen demanda, optimizan stock, y reducen desperdicios. Incluyen alertas automáticas, análisis de tendencias, y integración con proveedores. Reducción de costos: 15-25%.',
            'category' => 'inventario-ia',
            'keywords' => 'inventario, ia, prediccion, stock, desperdicios, proveedores, costos'
        ],
        // FAQ Data - 70 preguntas completas
        [
            'title' => '¿Qué es un chatbot con IA?',
            'content' => 'Un chatbot con IA es un programa que utiliza inteligencia artificial para simular conversaciones humanas, ofreciendo respuestas automatizadas y personalizadas.',
            'category' => 'faq-chatbots',
            'keywords' => 'chatbot, ia, conversaciones, respuestas automatizadas, personalizadas'
        ],
        [
            'title' => '¿Cómo funciona un chatbot con inteligencia artificial?',
            'content' => 'Se basa en el procesamiento del lenguaje natural, aprendizaje automático y análisis de datos para interpretar consultas y proporcionar respuestas relevantes.',
            'category' => 'faq-chatbots',
            'keywords' => 'procesamiento lenguaje natural, aprendizaje automatico, analisis datos'
        ],
        [
            'title' => '¿Qué beneficios ofrece un chatbot con IA para mi negocio?',
            'content' => 'Ofrece atención 24/7, reduce tiempos de respuesta, optimiza procesos y mejora la experiencia del cliente, lo que puede aumentar la fidelización y reducir costos.',
            'category' => 'faq-beneficios',
            'keywords' => 'atencion 24/7, tiempos respuesta, optimizacion procesos, experiencia cliente'
        ],
        [
            'title' => '¿Cómo puede la IA automatizar procesos en mi empresa?',
            'content' => 'La IA identifica patrones en grandes volúmenes de datos y ejecuta tareas repetitivas de forma autónoma, mejorando la eficiencia operativa y reduciendo errores.',
            'category' => 'faq-automatizacion',
            'keywords' => 'ia, automatizar procesos, patrones datos, eficiencia operativa'
        ],
        [
            'title' => '¿Qué procesos se pueden automatizar con IA?',
            'content' => 'Se pueden automatizar procesos en atención al cliente, marketing, gestión administrativa, análisis de datos, entre otros.',
            'category' => 'faq-automatizacion',
            'keywords' => 'automatizar, atencion cliente, marketing, gestion administrativa, analisis datos'
        ],
        [
            'title' => '¿Cómo mejora la atención al cliente un chatbot con IA?',
            'content' => 'Permite respuestas rápidas, personalizadas y disponibles las 24 horas, mejorando la experiencia del usuario y aliviando la carga del equipo humano.',
            'category' => 'faq-atencion-cliente',
            'keywords' => 'atencion cliente, respuestas rapidas, personalizadas, 24 horas'
        ],
        [
            'title' => '¿Cuál es el retorno de inversión de implementar chatbots con IA?',
            'content' => 'Reducen costos operativos y mejoran la eficiencia, lo que se traduce en un alto ROI gracias al ahorro de recursos y al incremento en la satisfacción del cliente.',
            'category' => 'faq-roi',
            'keywords' => 'roi, costos operativos, eficiencia, ahorro recursos, satisfaccion cliente'
        ],
        [
            'title' => '¿Qué diferencia hay entre un chatbot con IA y uno tradicional?',
            'content' => 'Mientras los chatbots tradicionales usan respuestas predefinidas, los chatbots con IA aprenden y se adaptan a las consultas para ofrecer respuestas más precisas y contextuales.',
            'category' => 'faq-chatbots',
            'keywords' => 'chatbot ia vs tradicional, respuestas predefinidas, aprendizaje, contextuales'
        ],
        [
            'title' => '¿Cómo se integra un chatbot con IA en sistemas existentes?',
            'content' => 'Mediante APIs y conectores, permitiendo su comunicación con CRM, ERP u otros sistemas para ofrecer una experiencia integrada.',
            'category' => 'faq-integracion',
            'keywords' => 'apis, conectores, crm, erp, sistemas, experiencia integrada'
        ],
        [
            'title' => '¿Qué tecnologías se utilizan en un chatbot con IA?',
            'content' => 'Se emplean técnicas de procesamiento del lenguaje natural, machine learning, deep learning y frameworks como TensorFlow o PyTorch.',
            'category' => 'faq-tecnologia',
            'keywords' => 'procesamiento lenguaje natural, machine learning, deep learning, tensorflow, pytorch'
        ],
        [
            'title' => '¿Es seguro utilizar chatbots con IA en la atención al cliente?',
            'content' => 'Sí, siempre que se implementen protocolos de seguridad y protección de datos adecuados.',
            'category' => 'faq-seguridad',
            'keywords' => 'seguridad, chatbots ia, protocolos seguridad, proteccion datos'
        ],
        [
            'title' => '¿Cómo se entrenan los chatbots con IA para mejorar su rendimiento?',
            'content' => 'Se entrenan con grandes conjuntos de datos y mediante algoritmos de aprendizaje automático, permitiéndoles adaptarse y mejorar con el tiempo.',
            'category' => 'faq-entrenamiento',
            'keywords' => 'entrenar chatbots, conjuntos datos, algoritmos aprendizaje, mejorar rendimiento'
        ],
        [
            'title' => '¿Qué impacto tiene la automatización con IA en la productividad de una empresa?',
            'content' => 'La automatización reduce tareas manuales y errores, permitiendo que el equipo se enfoque en actividades de mayor valor y aumentando la productividad.',
            'category' => 'faq-productividad',
            'keywords' => 'automatizacion ia, productividad empresa, tareas manuales, actividades valor'
        ],
        [
            'title' => '¿Cuánto cuesta implementar un chatbot con IA?',
            'content' => 'El costo varía según las funcionalidades, la integración y el tamaño de la empresa; se recomienda solicitar una cotización personalizada.',
            'category' => 'faq-costos',
            'keywords' => 'costo chatbot ia, funcionalidades, integracion, cotizacion personalizada'
        ],
        [
            'title' => '¿Se pueden integrar chatbots con IA en plataformas de mensajería?',
            'content' => 'Sí, la mayoría de las soluciones permiten la integración con múltiples plataformas para ofrecer una experiencia omnicanal.',
            'category' => 'faq-integracion',
            'keywords' => 'chatbots plataformas mensajeria, integracion, experiencia omnicanal'
        ],
        [
            'title' => '¿Qué es Agente RAG y cómo puede transformar mi PYME?',
            'content' => 'Agente RAG (Retrieval-Augmented Generation) es una solución de IA que combina la recuperación de información precisa con la generación de respuestas contextualizadas. Transforma la eficiencia operativa y la atención al cliente en PYMES.',
            'category' => 'faq-agente-rag',
            'keywords' => 'agente rag, pyme, transformacion, eficiencia operativa, atencion cliente'
        ],
        [
            'title' => '¿Cómo mejora la atención al cliente multicanal Agente RAG?',
            'content' => 'Agente RAG integra múltiples canales de comunicación (Gmail, WhatsApp, etc.) para ofrecer una atención al cliente consistente, personalizada e inmediata, centralizando el historial y optimizando la experiencia del usuario.',
            'category' => 'faq-atencion-cliente',
            'keywords' => 'multicanal, gmail, whatsapp, atencion cliente consistente, experiencia usuario'
        ],
        [
            'title' => '¿Qué procesos de mi empresa puedo automatizar con Agente RAG?',
            'content' => 'Agente RAG automatiza desde la atención al cliente y la gestión de tareas hasta la generación de contenido y el análisis de datos. Optimiza la eficiencia operativa y reduce errores en tu PYME.',
            'category' => 'faq-automatizacion',
            'keywords' => 'automatizar procesos, gestion tareas, generacion contenido, analisis datos, eficiencia'
        ],
        [
            'title' => '¿Cómo ayuda Agente RAG en la generación de contenido asistida por IA?',
            'content' => 'Agente RAG facilita la creación de contenido para marketing y comunicación interna, generando textos, imágenes y videos de forma automatizada o asistida, personalizando el mensaje y aumentando la productividad.',
            'category' => 'faq-contenido',
            'keywords' => 'generacion contenido, marketing, comunicacion interna, textos imagenes videos, productividad'
        ],
        [
            'title' => '¿Cómo se integra Agente RAG con mi CRM o ERP?',
            'content' => 'Agente RAG se integra fácilmente con sistemas CRM/ERP para optimizar la gestión de clientes, ventas y operaciones, sincronizando datos, automatizando registros y generando alertas, mejorando la toma de decisiones.',
            'category' => 'faq-integracion',
            'keywords' => 'integracion crm erp, gestion clientes ventas, sincronizar datos, toma decisiones'
        ],
        [
            'title' => '¿Qué medidas de seguridad y monitoreo ofrece Agente RAG?',
            'content' => 'Agente RAG incluye soluciones para la detección proactiva de amenazas, monitoreo continuo y cumplimiento normativo, alertando sobre actividades sospechosas y garantizando la seguridad de la información.',
            'category' => 'faq-seguridad',
            'keywords' => 'seguridad monitoreo, deteccion amenazas, cumplimiento normativo, actividades sospechosas'
        ],
        [
            'title' => '¿Cómo personaliza Agente RAG los servicios para mi PYME?',
            'content' => 'Agente RAG ofrece servicios de integración y personalización que adaptan la solución a las necesidades específicas de cada PYME, creando flujos de trabajo personalizados y brindando capacitación y soporte continuo.',
            'category' => 'faq-personalizacion',
            'keywords' => 'personalizar servicios pyme, flujos trabajo personalizados, capacitacion soporte'
        ],
        [
            'title' => '¿Qué reducción de costos operativos puedo esperar con Agente RAG?',
            'content' => 'La implementación de Agente RAG puede reducir los costos operativos hasta en un 30%, automatizando tareas y optimizando procesos, generando un retorno de inversión significativo.',
            'category' => 'faq-costos',
            'keywords' => 'reduccion costos operativos, 30 por ciento, automatizar tareas, roi significativo'
        ],
        [
            'title' => '¿Cómo mejora Agente RAG el tiempo de respuesta en la atención al cliente?',
            'content' => 'Agente RAG reduce drásticamente el tiempo de respuesta en la atención al cliente, ofreciendo respuestas casi instantáneas y resolviendo problemas de forma eficiente, mejorando la satisfacción del cliente.',
            'category' => 'faq-atencion-cliente',
            'keywords' => 'tiempo respuesta, respuestas instantaneas, resolver problemas, satisfaccion cliente'
        ],
        [
            'title' => '¿Cuáles son los beneficios globales de implementar Agente RAG en mi PYME?',
            'content' => 'Agente RAG ofrece centralización y agilidad en la gestión, automatización integral de procesos, adaptabilidad y escalabilidad de servicios, y mejora en la toma de decisiones, impulsando la competitividad de tu PYME.',
            'category' => 'faq-beneficios',
            'keywords' => 'beneficios globales, centralizacion agilidad, automatizacion integral, competitividad pyme'
        ],
        [
            'title' => '¿Qué tipo de información puede recuperar Agente RAG?',
            'content' => 'Agente RAG puede recuperar información específica y actualizada de diversas fuentes internas de la empresa, como documentos, bases de datos, catálogos, reportes y registros históricos, optimizando la precisión de las respuestas.',
            'category' => 'faq-funcionalidad',
            'keywords' => 'recuperar informacion, fuentes internas, documentos bases datos, precision respuestas'
        ],
        [
            'title' => '¿Cómo funciona el proceso de generación de respuestas de Agente RAG?',
            'content' => 'Agente RAG utiliza modelos avanzados de lenguaje natural para generar respuestas en lenguaje natural, combinando la información recuperada con conocimiento preentrenado, asegurando respuestas coherentes, precisas y basadas en datos verificados.',
            'category' => 'faq-funcionalidad',
            'keywords' => 'generacion respuestas, modelos lenguaje natural, conocimiento preentrenado, datos verificados'
        ],
        [
            'title' => '¿Por qué es importante la técnica RAG para la precisión de la información?',
            'content' => 'La técnica RAG es esencial para escenarios donde la precisión de la información es crítica, ya que fundamenta cada respuesta en datos específicos, reduciendo errores y alucinaciones comunes en modelos generativos.',
            'category' => 'faq-tecnica-rag',
            'keywords' => 'tecnica rag, precision informacion, datos especificos, reducir errores alucinaciones'
        ],
        [
            'title' => '¿Cuáles son los componentes principales de la arquitectura de Agente RAG?',
            'content' => 'La arquitectura de Agente RAG incluye módulos de captura de consultas, recuperación de información, generación de respuestas y acciones automatizadas, trabajando interconectados para automatizar procesos administrativos.',
            'category' => 'faq-arquitectura',
            'keywords' => 'arquitectura agente rag, modulos captura consultas, recuperacion informacion, acciones automatizadas'
        ],
        [
            'title' => '¿Cómo se integra Agente RAG en el flujo de trabajo diario de mi empresa?',
            'content' => 'Agente RAG se integra en el flujo de trabajo a través de webhooks, APIs y conectores, automatizando tareas específicas y respondiendo a consultas en tiempo real, optimizando la eficiencia y la productividad.',
            'category' => 'faq-integracion',
            'keywords' => 'flujo trabajo diario, webhooks apis conectores, tareas especificas, tiempo real'
        ],
        [
            'title' => '¿Necesito conocimientos técnicos avanzados para implementar Agente RAG?',
            'content' => 'No necesitas conocimientos técnicos avanzados para empezar a usar Agente RAG. Ofrecemos servicios de consultoría e implementación para personalizar y orquestar flujos de trabajo, adaptándonos a las necesidades de tu PYME.',
            'category' => 'faq-implementacion',
            'keywords' => 'conocimientos tecnicos, consultoria implementacion, personalizar flujos trabajo, necesidades pyme'
        ],
        [
            'title' => '¿Qué tipo de soporte y capacitación ofrece Agente RAG?',
            'content' => 'Ofrecemos capacitación y soporte completo para el uso y optimización de Agente RAG, asegurando que tu equipo pueda aprovechar al máximo la herramienta y lograr los mejores resultados.',
            'category' => 'faq-soporte',
            'keywords' => 'soporte capacitacion, uso optimizacion, aprovechar herramienta, mejores resultados'
        ],
        [
            'title' => '¿Cómo puedo empezar a utilizar Agente RAG en mi PYME?',
            'content' => 'Empezar a utilizar Agente RAG es fácil. Contáctanos para una consultoría personalizada y descubre cómo podemos transformar tu negocio con soluciones de IA a medida.',
            'category' => 'faq-inicio',
            'keywords' => 'empezar utilizar, consultoria personalizada, transformar negocio, soluciones ia medida'
        ],
        [
            'title' => '¿Agente RAG funciona solo con Google Workspace?',
            'content' => 'No, aunque Agente RAG se integra fuertemente con Google Workspace (Gmail, Sheets, Calendar), también puede integrarse con otras plataformas y sistemas empresariales a través de APIs y conectores.',
            'category' => 'faq-integracion',
            'keywords' => 'google workspace, gmail sheets calendar, otras plataformas, sistemas empresariales'
        ],
        [
            'title' => '¿Puedo probar Agente RAG antes de implementarlo completamente?',
            'content' => 'Sí, recomendamos realizar pruebas piloto y ajustes antes del despliegue completo de Agente RAG, para evaluar la precisión de las respuestas y la integración con tus sistemas, asegurando una implementación exitosa.',
            'category' => 'faq-pruebas',
            'keywords' => 'probar agente rag, pruebas piloto, evaluar precision respuestas, implementacion exitosa'
        ],
        [
            'title' => '¿Agente RAG es adecuado para empresas de cualquier tamaño?',
            'content' => 'Agente RAG es especialmente beneficioso para PYMES, ya que ofrece soluciones personalizadas y escalables que se adaptan a las necesidades y presupuesto de empresas de diferentes tamaños.',
            'category' => 'faq-empresas',
            'keywords' => 'empresas cualquier tamano, beneficioso pymes, soluciones personalizadas escalables, presupuesto'
        ],
        [
            'title' => '¿Cómo se actualiza y mantiene Agente RAG?',
            'content' => 'El mantenimiento y la actualización de Agente RAG se realizan de forma continua, asegurando que la solución esté siempre optimizada y actualizada con las últimas tecnologías y mejoras.',
            'category' => 'faq-mantenimiento',
            'keywords' => 'actualizar mantener, forma continua, solucion optimizada, ultimas tecnologias mejoras'
        ],
        [
            'title' => '¿Agente RAG aprende y mejora con el tiempo?',
            'content' => 'Sí, Agente RAG utiliza técnicas de aprendizaje automático que le permiten aprender y mejorar con el tiempo, optimizando sus respuestas y adaptándose a las interacciones y datos.',
            'category' => 'faq-aprendizaje',
            'keywords' => 'aprende mejora tiempo, tecnicas aprendizaje automatico, optimizar respuestas, adaptarse interacciones'
        ],
        [
            'title' => '¿Qué tipo de resultados puedo esperar en términos de eficiencia con Agente RAG?',
            'content' => 'Con Agente RAG, puedes esperar mejoras significativas en eficiencia, como reducción de tiempos de respuesta, automatización de tareas repetitivas y optimización de procesos, liberando recursos y mejorando la productividad general.',
            'category' => 'faq-eficiencia',
            'keywords' => 'resultados eficiencia, mejoras significativas, reduccion tiempos, automatizacion tareas repetitivas'
        ],
        [
            'title' => '¿Cómo se compara Agente RAG con otras soluciones de chatbot o IA?',
            'content' => 'Agente RAG se diferencia de otras soluciones por su enfoque en la precisión de la información, la personalización a medida y la integración integral de procesos, ofreciendo una solución más completa y efectiva para PYMES.',
            'category' => 'faq-comparacion',
            'keywords' => 'comparar otras soluciones, precision informacion, personalizacion medida, integracion integral'
        ],
        [
            'title' => '¿Cuál es el costo de implementar Agente RAG en mi PYME?',
            'content' => 'El costo de implementar Agente RAG varía según las necesidades específicas de cada PYME, el alcance de la implementación y los servicios personalizados requeridos. Solicita una cotización personalizada para conocer el costo exacto para tu empresa.',
            'category' => 'faq-costos',
            'keywords' => 'costo implementar, necesidades especificas pyme, alcance implementacion, cotizacion personalizada'
        ]
    ];
    
    $inserted = 0;
    $updated = 0;
    
    foreach ($knowledgeData as $item) {
        // Verificar si ya existe
        $stmt = $pdo->prepare("SELECT id FROM rag_knowledge_base WHERE title = ?");
        $stmt->execute([$item['title']]);
        
        if ($stmt->fetch()) {
            // Actualizar existente
            $stmt = $pdo->prepare("
                UPDATE rag_knowledge_base 
                SET content = ?, category = ?, keywords = ?, updated_at = NOW()
                WHERE title = ?
            ");
            $stmt->execute([
                $item['content'],
                $item['category'], 
                $item['keywords'],
                $item['title']
            ]);
            $updated++;
        } else {
            // Insertar nuevo
            $stmt = $pdo->prepare("
                INSERT INTO rag_knowledge_base 
                (title, content, category, keywords, relevance_score, created_at) 
                VALUES (?, ?, ?, ?, 1.0, NOW())
            ");
            $stmt->execute([
                $item['title'],
                $item['content'],
                $item['category'],
                $item['keywords']
            ]);
            $inserted++;
        }
    }
    
    // Contar total final
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM rag_knowledge_base");
    $total = $stmt->fetch()['total'];
    
    echo json_encode([
        'status' => 'success',
        'inserted' => $inserted,
        'updated' => $updated,
        'total_records' => $total,
        'message' => "Base de conocimientos actualizada: {$inserted} nuevos, {$updated} actualizados"
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
}
?>