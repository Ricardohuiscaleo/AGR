-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: srv1438.hstgr.io    Database: u958525313_rag_database
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `gaby_contacts`
--

DROP TABLE IF EXISTS `gaby_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gaby_contacts` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `monthly_clients` int(11) DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gaby_contacts`
--

LOCK TABLES `gaby_contacts` WRITE;
/*!40000 ALTER TABLE `gaby_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `gaby_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gaby_email_log`
--

DROP TABLE IF EXISTS `gaby_email_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gaby_email_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `body` longtext DEFAULT NULL,
  `status` enum('sent','failed') DEFAULT 'sent',
  `sent_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gaby_email_log`
--

LOCK TABLES `gaby_email_log` WRITE;
/*!40000 ALTER TABLE `gaby_email_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `gaby_email_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gaby_meetings`
--

DROP TABLE IF EXISTS `gaby_meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gaby_meetings` (
  `id` varchar(50) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `google_event_id` varchar(255) DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gaby_meetings`
--

LOCK TABLES `gaby_meetings` WRITE;
/*!40000 ALTER TABLE `gaby_meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `gaby_meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gaby_reports`
--

DROP TABLE IF EXISTS `gaby_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gaby_reports` (
  `id` varchar(50) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `status` enum('generated','sent') DEFAULT 'generated',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gaby_reports`
--

LOCK TABLES `gaby_reports` WRITE;
/*!40000 ALTER TABLE `gaby_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `gaby_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rag_analytics`
--

DROP TABLE IF EXISTS `rag_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rag_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(32) DEFAULT NULL,
  `query_text` text DEFAULT NULL,
  `response_time_ms` int(11) DEFAULT NULL,
  `relevant_docs_found` int(11) DEFAULT NULL,
  `user_satisfaction` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rag_analytics`
--

LOCK TABLES `rag_analytics` WRITE;
/*!40000 ALTER TABLE `rag_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `rag_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rag_config`
--

DROP TABLE IF EXISTS `rag_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rag_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rag_config`
--

LOCK TABLES `rag_config` WRITE;
/*!40000 ALTER TABLE `rag_config` DISABLE KEYS */;
INSERT INTO `rag_config` VALUES (1,'system_prompt','Eres un agente especializado en automatización y ahorro de costos empresariales.','Prompt base del sistema','2025-07-12 01:27:20'),(2,'max_tokens','1024','Máximo de tokens en respuestas','2025-07-12 01:27:20'),(3,'temperature','0.5','Temperatura para generación de respuestas','2025-07-15 22:21:44'),(4,'session_timeout','864000','Tiempo de vida de sesión en segundos','2025-07-13 15:06:18');
/*!40000 ALTER TABLE `rag_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rag_conversations`
--

DROP TABLE IF EXISTS `rag_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rag_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(32) NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=573 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rag_conversations`
--

LOCK TABLES `rag_conversations` WRITE;
/*!40000 ALTER TABLE `rag_conversations` DISABLE KEYS */;
INSERT INTO `rag_conversations` VALUES (485,'c3140ceed00f43efb4166f62feee6272','user','hola','2025-07-15 22:50:13'),(486,'c3140ceed00f43efb4166f62feee6272','assistant','¡Qué tal! Soy Gaby de Agente RAG, ¡encantada de saludarte! ¿En qué puedo ayudarte hoy?\n','2025-07-15 22:50:14'),(487,'c3140ceed00f43efb4166f62feee6272','user','que puedes hacer?','2025-07-15 22:50:42'),(488,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Agente RAG te ayuda a mejorar la eficiencia de tus procesos, por ejemplo, reduciendo los tiempos de respuesta y automatizando tareas repetitivas. Además, aprende y mejora con el tiempo gracias al aprendizaje automático, y se actualiza continuamente para estar siempre optimizado. ¡Así te ayuda a ser más productivo!\n','2025-07-15 22:50:44'),(489,'c3140ceed00f43efb4166f62feee6272','user','como me ayuda a ser más productivo?','2025-07-15 22:51:20'),(490,'c3140ceed00f43efb4166f62feee6272','assistant','¡Entiendo! Agente RAG te ayuda a ser más productivo automatizando tareas repetitivas, liberándote para enfocarte en actividades más estratégicas. Por ejemplo, podemos automatizar la gestión de emails, la extracción de datos de documentos o la generación de informes.\n\nPara entender mejor cómo podemos ayudarte específicamente, ¿en qué área de tu empresa sientes que podrías ser más productivo? ¿Hay algún proceso en particular que te quite mucho tiempo?\n','2025-07-15 22:51:22'),(491,'c3140ceed00f43efb4166f62feee6272','user','no lo tengo muy claro pero tengo muchas dudas y por cierto su pagina es hermosa','2025-07-15 22:52:16'),(492,'c3140ceed00f43efb4166f62feee6272','assistant','Ah, sobre eso... Entiendo que tengas dudas. Agente RAG se basa en la técnica RAG, que asegura la precisión de la información al fundamentar cada respuesta en datos específicos. Esto reduce errores y \"alucinaciones\" comunes en otras IA. Además, podemos ayudarte a generar contenido para marketing y comunicación interna de forma automatizada.\n','2025-07-15 22:52:17'),(493,'c3140ceed00f43efb4166f62feee6272','user','que son las alucinaciones?','2025-07-15 22:52:43'),(494,'c3140ceed00f43efb4166f62feee6272','assistant','Ah, sobre eso... En el contexto de los modelos de lenguaje, las \"alucinaciones\" son respuestas o información inventada que el modelo presenta como si fueran hechos reales, pero que no tienen base en la información con la que fue entrenado. Agente RAG minimiza esto basándose en información verificada.\n','2025-07-15 22:52:45'),(495,'c3140ceed00f43efb4166f62feee6272','user','aah ya veo entiendo','2025-07-15 22:53:15'),(496,'c3140ceed00f43efb4166f62feee6272','assistant','Ah, sobre eso... Entiendo que ahora comprendes mejor cómo funciona Agente RAG y el concepto de alucinaciones en los modelos de lenguaje. ¿Hay algo más en lo que pueda ayudarte a profundizar o alguna otra pregunta que tengas? ¡Estoy aquí para aclarar cualquier duda!\n','2025-07-15 22:53:16'),(497,'c3140ceed00f43efb4166f62feee6272','user','que es RAG en si que aún no lo tengo claro me podrias dar algún ejemplo?','2025-07-15 22:54:02'),(498,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... RAG (Retrieval-Augmented Generation) es una técnica que mejora la precisión de las respuestas de la IA. Imagina que le preguntas algo a Agente RAG: primero busca información relevante en una base de datos específica y luego usa esa información para generar una respuesta precisa y fundamentada. Así evitamos las \"alucinaciones\" y te damos información confiable.\n','2025-07-15 22:54:03'),(499,'c3140ceed00f43efb4166f62feee6272','user','entiendo y que es retrieval-Augmented?','2025-07-15 22:54:36'),(500,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... \"Retrieval-Augmented\" se refiere a la parte de RAG que se encarga de buscar información relevante. Imagina que es como un investigador que busca en una base de datos para encontrar la información más precisa que necesita la IA para responder a tu pregunta. Esta información \"recuperada\" luego se usa para generar una respuesta mucho más informada y precisa.\n','2025-07-15 22:54:37'),(501,'c3140ceed00f43efb4166f62feee6272','user','super interesante, vi que tienen un blog y está automatizado también','2025-07-15 22:55:03'),(502,'c3140ceed00f43efb4166f62feee6272','assistant','Ah, sobre eso... Es posible automatizar la creación de contenido para blogs con IA. Se pueden automatizar procesos en marketing, como el análisis de datos para generar contenido relevante o incluso la redacción de borradores, aunque siempre es importante una revisión humana para asegurar la calidad y el tono deseado.\n','2025-07-15 22:55:05'),(503,'c3140ceed00f43efb4166f62feee6272','user','que es semantica?','2025-07-15 22:55:34'),(504,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... En el contexto del lenguaje, la semántica se refiere al significado de las palabras, frases y oraciones. Es decir, estudia cómo interpretamos el sentido de lo que se dice o escribe, analizando las relaciones entre los signos lingüísticos y los conceptos que representan.\n','2025-07-15 22:55:36'),(505,'c3140ceed00f43efb4166f62feee6272','user','vie un caso de uso en su pagina web que decía Por cada $10.000.000 en ventas, los agentes IA RAG permiten un ahorro de $1.620.000 mensuales, lo que equivale a $19.440.000 anuales.','2025-07-15 22:56:44'),(506,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Ese caso de uso destaca el potencial de ahorro que los agentes IA RAG pueden generar. Al automatizar procesos en atención al cliente, marketing y gestión administrativa, se optimizan tiempos de respuesta y se reduce la carga de trabajo, lo que impacta directamente en la rentabilidad del negocio. ¡Además, mejora la experiencia del cliente!\n','2025-07-15 22:56:46'),(507,'c3140ceed00f43efb4166f62feee6272','user','y de cuanto es la inversión?','2025-07-15 22:57:08'),(508,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... El costo de la inversión para implementar un chatbot con IA varía según las funcionalidades que necesites, el nivel de integración con tus sistemas y el tamaño de tu empresa. Lo ideal es solicitar una cotización personalizada para que podamos evaluar tus necesidades específicas y darte un precio preciso.\n','2025-07-15 22:57:10'),(509,'c3140ceed00f43efb4166f62feee6272','user','tu puedes gestionar eso?','2025-07-15 22:57:34'),(510,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Mi función como Agente RAG es ofrecerte información sobre cómo nuestra tecnología puede optimizar tus procesos. Si te refieres a gestionar la implementación, te cuento que podemos ayudarte a evaluar tus necesidades y diseñar una solución a medida. Con Agente RAG, puedes esperar mejoras significativas en eficiencia, como reducción de tiempos de respuesta, automatización de tareas repetitivas y optimización de procesos.\n','2025-07-15 22:57:35'),(511,'c3140ceed00f43efb4166f62feee6272','user','ya veo me interesa','2025-07-15 22:58:00'),(512,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Me alegra saber que te interesa. El siguiente paso sería agendar una reunión con uno de nuestros especialistas. En esta reunión, podremos analizar tus necesidades específicas y ofrecerte una solución personalizada con un presupuesto detallado. ¿Te parece bien si coordinamos esa llamada?\n','2025-07-15 22:58:01'),(513,'c3140ceed00f43efb4166f62feee6272','user','si','2025-07-15 22:58:15'),(514,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Me alegra que estés de acuerdo con agendar la reunión. En ella, podrás conocer más sobre cómo la IA puede automatizar procesos como la atención al cliente, el marketing y la gestión administrativa, y cómo Agente RAG facilita la creación de contenido para marketing y comunicación interna.\n','2025-07-15 22:58:17'),(515,'c3140ceed00f43efb4166f62feee6272','user','ok','2025-07-15 22:58:31'),(516,'c3140ceed00f43efb4166f62feee6272','assistant','¡Perfecto! ¿Te parece bien si te doy opciones de horarios para la reunión con el especialista? Así podemos avanzar con tu interés.\n','2025-07-15 22:58:33'),(517,'c3140ceed00f43efb4166f62feee6272','user','si','2025-07-15 22:58:39'),(518,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Para agendar la reunión, necesito saber tu disponibilidad. ¿Qué días y horarios te vendrían bien para conversar con el especialista y explorar cómo la IA puede automatizar tus procesos, como los de atención al cliente, marketing o gestión administrativa?\n','2025-07-15 22:58:40'),(519,'c3140ceed00f43efb4166f62feee6272','user','mañana','2025-07-15 22:58:49'),(520,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Para mañana, ¿qué rango de horarios te acomoda mejor? Así puedo verificar la disponibilidad del especialista y ofrecerte una opción concreta.\n','2025-07-15 22:58:50'),(521,'c3140ceed00f43efb4166f62feee6272','user','en al tarde','2025-07-15 22:58:59'),(522,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... En la tarde tengo varios horarios disponibles. ¿Te vendría bien entre las 2 PM y las 5 PM? Así puedo revisar la agenda del especialista y confirmarte una hora precisa para mañana.\n','2025-07-15 22:58:59'),(523,'c3140ceed00f43efb4166f62feee6272','user','a las 5 pm','2025-07-15 22:59:14'),(524,'c3140ceed00f43efb4166f62feee6272','assistant','Claro, te explico... Agendado para mañana a las 5 PM. Mientras tanto, ¿tienes alguna duda sobre cómo un chatbot con IA podría beneficiar a tu PYME? Por ejemplo, podría mejorar la atención al cliente ofreciendo respuestas rápidas y personalizadas las 24 horas.\n','2025-07-15 22:59:15'),(525,'e639e3b20e574d20a173dba60ca4e63b','user','hola tengo un problema','2025-07-15 23:12:12'),(526,'e639e3b20e574d20a173dba60ca4e63b','assistant','¡Hola! ¿En qué puedo ayudarte hoy? ¡Me encanta resolver problemas! Dime, ¿de qué se trata?\n','2025-07-15 23:12:13'),(527,'e639e3b20e574d20a173dba60ca4e63b','user','como me contacto con en area de ventas?','2025-07-15 23:12:40'),(528,'e639e3b20e574d20a173dba60ca4e63b','assistant','¡Hola! Para contactarte con el área de ventas, ¿me podrías proporcionar tu nombre y el nombre de tu empresa? Así podré dirigir tu consulta al ejecutivo comercial adecuado. 😊\n','2025-07-15 23:12:41'),(529,'e639e3b20e574d20a173dba60ca4e63b','user','ricardo, somos la ruta 11 foodtrucks','2025-07-15 23:13:32'),(530,'e639e3b20e574d20a173dba60ca4e63b','assistant','¡Perfecto! Ya tengo la información. Enseguida te pongo en contacto con el área de ventas, Ricardo de Ruta 11 Foodtrucks. ¡Un momento, por favor!\n','2025-07-15 23:13:33'),(531,'e639e3b20e574d20a173dba60ca4e63b','user','ok','2025-07-15 23:13:43'),(532,'e639e3b20e574d20a173dba60ca4e63b','assistant','¡Entendido! Ya estoy gestionando tu contacto con ventas, Ricardo. En breve te comunicarán. ¡Gracias por tu paciencia!\n','2025-07-15 23:13:44'),(533,'e639e3b20e574d20a173dba60ca4e63b','user','bueno y como se pondrán en contacto?','2025-07-15 23:14:04'),(534,'e639e3b20e574d20a173dba60ca4e63b','assistant','¡Hola Ricardo! El área de ventas se pondrá en contacto contigo por teléfono o correo electrónico, dependiendo de la información de contacto que tengamos registrada para Ruta 11 Foodtrucks. ¿Prefieres que te contacten de alguna forma en particular?\n','2025-07-15 23:14:05'),(535,'fcb319767ef54c73be1b38e4aedf0fff','user','hola','2025-07-15 23:23:13'),(536,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡Hola! ¡Qué gusto saludarte hoy! ¿En qué puedo ayudarte desde Agente RAG? ¡Dime, dime! 😊\n','2025-07-15 23:23:14'),(537,'fcb319767ef54c73be1b38e4aedf0fff','user','tengo una duda me gustaría automatizar las consultas de apoderados de un colegio','2025-07-15 23:24:08'),(538,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡Entiendo! Automatizar las consultas de apoderados suena genial. Para entender mejor tus necesidades, ¿podrías contarme un poco sobre el volumen de consultas que manejan actualmente en el colegio? 😊\n','2025-07-15 23:24:09'),(539,'fcb319767ef54c73be1b38e4aedf0fff','user','uff yo creo que en promedio unas 10 o 20 consultas diarias','2025-07-15 23:24:35'),(540,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡La cosa es así! Con un volumen de 10 a 20 consultas diarias de apoderados, un chatbot con IA sería súper útil. Fíjate que la IA puede automatizar la atención al cliente, respondiendo preguntas frecuentes y liberando tiempo de tu personal. Además, aprende de cada interacción, mejorando las respuestas con el tiempo. ¡Podrías optimizar mucho el proceso!\n','2025-07-15 23:24:36'),(541,'fcb319767ef54c73be1b38e4aedf0fff','user','enserio?','2025-07-15 23:24:57'),(542,'fcb319767ef54c73be1b38e4aedf0fff','assistant','Por cierto, ¿cómo te llamas? Me gusta personalizar la conversación 😊','2025-07-15 23:24:57'),(543,'fcb319767ef54c73be1b38e4aedf0fff','user','Ricardo','2025-07-15 23:25:07'),(544,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡Excelente, Ricardo! Es un gusto conocer tu nombre. Entonces, ¿te parece si exploramos cómo la IA puede facilitar esas consultas diarias de apoderados? 😉\n','2025-07-15 23:25:08'),(545,'a553316e65f244378ecdc0a0d027865d','user','Qué es retrival?','2025-07-21 12:46:34'),(546,'a553316e65f244378ecdc0a0d027865d','assistant','Lo que pasa es que no tengo información directa sobre qué es \"retrieval\" en mis documentos. Sin embargo, puedo contarte que Agente RAG, aprende y mejora con el tiempo, optimizando sus respuestas y adaptándose a las interacciones y datos. Quizás \"retrieval\" sea parte de ese proceso de aprendizaje o de la forma en que busca información para darte una mejor respuesta.\n','2025-07-21 12:46:35'),(547,'63fc11b0ee7643099a1f4b06582dae95','user','Hola','2025-07-30 01:55:30'),(548,'63fc11b0ee7643099a1f4b06582dae95','assistant','¡Hola! 😊 ¿En qué puedo ayudarte hoy? ¡Espero que estés teniendo un día genial!\n','2025-07-30 01:55:30'),(549,'fcb319767ef54c73be1b38e4aedf0fff','user','hola','2025-08-08 00:21:59'),(550,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡Qué bueno que sigues aquí, Ricardo! ¿En qué te puedo ayudar ahora? ¿Tienes alguna pregunta específica sobre la automatización de las consultas de apoderados?\n','2025-08-08 00:22:00'),(551,'fcb319767ef54c73be1b38e4aedf0fff','user','hoka','2025-08-28 19:35:18'),(552,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡Perfecto! Y dime, ¿cuál es tu nombre?','2025-08-28 19:35:18'),(553,'fcb319767ef54c73be1b38e4aedf0fff','user','Ricardo','2025-08-28 19:35:23'),(554,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡Perfecto, Ricardo! Ya sé que eres tú. ¿Qué te trae de vuelta por aquí? ¿Hay algo más en lo que te pueda ayudar hoy? 😊\n','2025-08-28 19:35:24'),(555,'fcb319767ef54c73be1b38e4aedf0fff','user','que es machine learning?','2025-08-28 19:35:37'),(556,'fcb319767ef54c73be1b38e4aedf0fff','assistant','¡Perfecto! Y dime, ¿cuál es tu nombre?','2025-08-28 19:35:37'),(557,'3a0c1289029240b8a1f14809ae26f915','user','Hola','2025-10-04 12:43:01'),(558,'3a0c1289029240b8a1f14809ae26f915','assistant','¡Hola! Qué gusto saludarte. ¿En qué puedo ayudarte hoy? ¡Estoy a tu disposición!\n','2025-10-04 12:43:03'),(559,'3a0c1289029240b8a1f14809ae26f915','user','Que servicios tienen?','2025-10-04 12:43:26'),(560,'3a0c1289029240b8a1f14809ae26f915','assistant','¡Excelente! Tenemos una variedad de servicios, desde marketing digital y gestión de redes sociales, hasta diseño web y consultoría. ¿Qué área te interesa más?\n','2025-10-04 12:43:27'),(561,'3a0c1289029240b8a1f14809ae26f915','user','diseño web','2025-10-04 12:43:40'),(562,'3a0c1289029240b8a1f14809ae26f915','assistant','Por cierto, ¿cómo te llamas? Me gusta personalizar la conversación 😊','2025-10-04 12:43:40'),(563,'3a0c1289029240b8a1f14809ae26f915','user','Ricardo','2025-10-04 12:43:48'),(564,'3a0c1289029240b8a1f14809ae26f915','assistant','¡Qué bueno, Ricardo! Entendido. En diseño web ofrecemos desde la creación de sitios web a medida hasta la optimización de los existentes. ¿Tienes alguna necesidad específica en mente?\n','2025-10-04 12:43:50'),(565,'b81d978a44ab4e698576bef9ff455236','user','que es rag','2025-11-17 16:10:56'),(566,'b81d978a44ab4e698576bef9ff455236','assistant','La cosa es así... RAG no aparece directamente en la información que tengo, pero por lo que veo, estamos hablando de chatbots con Inteligencia Artificial. Estos chatbots usan tecnologías como el procesamiento del lenguaje natural y el *machine learning* para entender y responder a las preguntas de los usuarios de manera más inteligente y contextual, a diferencia de los chatbots tradicionales.\n','2025-11-17 16:10:58'),(567,'b81d978a44ab4e698576bef9ff455236','user','ya veo gracias','2025-11-17 16:12:01'),(568,'b81d978a44ab4e698576bef9ff455236','assistant','La cosa es así... ahora que entendés de qué va RAG, te cuento que implementar chatbots con IA, como los que usamos, puede darte un retorno de inversión alto. Reducen costos y hacen que todo funcione más rápido, ahorrando recursos y dejando a tus clientes más contentos. ¡Una inversión inteligente!\n','2025-11-17 16:12:02'),(569,'3b3fde4d431c4193aac632cbf9057fb6','user','que servicios de Rag ofrecen','2025-12-30 12:08:41'),(570,'3b3fde4d431c4193aac632cbf9057fb6','assistant','hay un problema técnico en nuestro sistema. Ya he alertado al equipo de desarrollo. ¿Te parece si retomamos la conversación más tarde?','2025-12-30 12:08:49'),(571,'fdd8f9bd943942e4b2240d8de73c9cef','user','Hola','2026-01-30 01:54:30'),(572,'fdd8f9bd943942e4b2240d8de73c9cef','assistant','hay un problema técnico en nuestro sistema. Ya he alertado al equipo de desarrollo. ¿Te parece si retomamos la conversación más tarde?','2026-01-30 01:54:36');
/*!40000 ALTER TABLE `rag_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rag_knowledge_base`
--

DROP TABLE IF EXISTS `rag_knowledge_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rag_knowledge_base` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `keywords` text DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `relevance_score` decimal(3,2) DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_relevance` (`relevance_score`),
  FULLTEXT KEY `title` (`title`,`content`,`keywords`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rag_knowledge_base`
--

LOCK TABLES `rag_knowledge_base` WRITE;
/*!40000 ALTER TABLE `rag_knowledge_base` DISABLE KEYS */;
INSERT INTO `rag_knowledge_base` VALUES (1,'Automatización de Procesos Empresariales','La automatización de procesos empresariales puede reducir costos operativos hasta en un 40%. Incluye automatización de tareas repetitivas, workflows, y procesos de negocio. Los beneficios incluyen: reducción de errores humanos, mayor eficiencia, ahorro de tiempo, y mejor experiencia del cliente.','automatización, procesos, eficiencia, ahorro, costos, workflows, RPA','automatizacion',9.50,'2025-07-12 01:27:20','2025-07-12 01:27:20'),(2,'Ahorro de Costos con IA','La implementación de inteligencia artificial puede generar ahorros significativos: reducción de personal en tareas repetitivas, optimización de recursos, predicción de demanda, mantenimiento predictivo. ROI típico de 200-300% en el primer año.','IA, inteligencia artificial, ahorro, costos, ROI, optimización, predicción','ia-costos',9.80,'2025-07-12 01:27:20','2025-07-12 01:27:20'),(3,'Chatbots y Atención al Cliente','Los chatbots pueden manejar hasta 80% de consultas básicas, reduciendo costos de atención al cliente en 60%. Disponibilidad 24/7, respuestas instantáneas, escalamiento automático a agentes humanos cuando es necesario.','chatbots, atención cliente, automatización, ahorro, 24/7, escalamiento','chatbots',9.20,'2025-07-12 01:27:20','2025-07-12 01:27:20'),(4,'Sistemas RAG para Empresas','Los sistemas RAG (Retrieval-Augmented Generation) permiten crear asistentes inteligentes con conocimiento específico de la empresa. Reducen tiempo de búsqueda de información en 70%, mejoran la toma de decisiones y centralizan el conocimiento organizacional.','RAG, retrieval, generation, asistentes, conocimiento, información, decisiones','rag-sistemas',9.70,'2025-07-12 01:27:20','2025-07-12 01:27:20'),(5,'Automatización de Marketing Digital','La automatización de marketing puede aumentar leads en 50% y reducir costos de adquisición en 30%. Incluye: email marketing automatizado, segmentación inteligente, nurturing de leads, scoring automático.','marketing, automatización, leads, email, segmentación, nurturing, scoring','marketing',8.90,'2025-07-12 01:27:20','2025-07-12 01:27:20'),(6,'Optimización de Inventarios con IA','Los sistemas de IA para inventarios pueden reducir costos de almacenamiento en 25% y evitar roturas de stock. Predicción de demanda, optimización de compras, gestión automática de proveedores.','inventarios, IA, predicción, demanda, almacenamiento, proveedores, stock','inventarios',8.70,'2025-07-12 01:27:20','2025-07-12 01:27:20'),(7,'Consultoría en Transformación Digital','La transformación digital bien planificada puede generar ahorros del 20-40% en costos operativos. Incluye análisis de procesos, identificación de oportunidades de automatización, implementación gradual y medición de ROI.','transformación digital, consultoría, análisis, procesos, ROI, implementación','consultoria',9.30,'2025-07-12 01:27:20','2025-07-12 01:27:20'),(8,'Qué es un Framework','Un framework es una estructura de software que proporciona una base para desarrollar aplicaciones. Incluye bibliotecas, herramientas y convenciones que facilitan el desarrollo. Ejemplos populares: React, Angular, Laravel, Django. Los frameworks aceleran el desarrollo y mantienen código organizado.','framework, desarrollo, software, estructura, bibliotecas, herramientas, programación','tecnologia',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(9,'Langchain Framework','Langchain es un framework para desarrollar aplicaciones con modelos de lenguaje (LLMs). Facilita la creación de chatbots, sistemas RAG, y aplicaciones de IA conversacional. Permite conectar LLMs con bases de datos, APIs y otras fuentes de información.','langchain, llm, chatbot, rag, ia conversacional, modelos de lenguaje','ia-frameworks',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(10,'Sistemas RAG Explicados','RAG (Retrieval-Augmented Generation) combina búsqueda de información con generación de texto. Permite que los chatbots accedan a bases de datos específicas para dar respuestas precisas. Ideal para empresas que necesitan asistentes con conocimiento especializado.','rag, retrieval, generation, chatbot, base datos, conocimiento, asistente','rag-sistemas',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(11,'APIs y Integraciones','Una API (Application Programming Interface) permite que diferentes sistemas se comuniquen. Las empresas usan APIs para conectar sus sistemas internos, integrar servicios externos, y automatizar procesos. Ejemplos: API de Google Calendar, WhatsApp Business API.','api, integracion, sistemas, comunicacion, automatizacion, servicios','tecnologia',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(12,'Automatización de Procesos con IA','La automatización con IA puede reducir costos operativos hasta 60%. Incluye chatbots para atención al cliente, procesamiento automático de documentos, análisis predictivo, y optimización de inventarios. ROI típico: 200-400% en el primer año.','automatizacion, ia, costos, roi, chatbots, procesos, optimizacion','automatizacion',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(13,'Chatbots para Restaurantes y Food Trucks','Los chatbots pueden automatizar pedidos, gestionar inventario, y mejorar atención al cliente en restaurantes. Integración con WhatsApp, sistemas POS, y apps de delivery. Reducen tiempo de atención 70% y errores de pedidos 80%.','chatbot, restaurante, food truck, pedidos, whatsapp, pos, delivery','chatbots-restaurantes',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(14,'Transformación Digital para PyMEs','La transformación digital para pequeñas empresas incluye: automatización de procesos, CRM, sistemas de inventario, marketing digital, y análisis de datos. Inversión inicial: $5,000-$20,000. Ahorro anual: 20-40% en costos operativos.','transformacion digital, pyme, crm, inventario, marketing, analisis datos','transformacion-digital',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(15,'Inteligencia Artificial para Negocios','La IA empresarial incluye: chatbots, análisis predictivo, automatización de marketing, optimización de precios, y detección de fraudes. Sectores más beneficiados: retail, servicios, manufactura, y finanzas.','inteligencia artificial, negocios, predictivo, marketing, precios, fraudes','ia-negocios',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(16,'Desarrollo de Apps Móviles','Las apps móviles para negocios mejoran experiencia del cliente y operaciones internas. Incluyen: apps de pedidos, loyalty programs, notificaciones push, y analytics. Costo desarrollo: $10,000-$50,000. ROI promedio: 300%.','app movil, desarrollo, pedidos, loyalty, notificaciones, analytics','apps-moviles',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(17,'Sistemas de Inventario Inteligentes','Los sistemas de inventario con IA predicen demanda, optimizan stock, y reducen desperdicios. Incluyen alertas automáticas, análisis de tendencias, y integración con proveedores. Reducción de costos: 15-25%.','inventario, ia, prediccion, stock, desperdicios, proveedores, costos','inventario-ia',1.00,'2025-07-13 15:50:37','2025-07-15 00:24:07'),(18,'¿Qué es un chatbot con IA?','Un chatbot con IA es un programa que utiliza inteligencia artificial para simular conversaciones humanas, ofreciendo respuestas automatizadas y personalizadas.','chatbot, ia, conversaciones, respuestas automatizadas, personalizadas','faq-chatbots',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(19,'¿Qué es Agente RAG y cómo puede transformar mi PYME?','Agente RAG (Retrieval-Augmented Generation) es una solución de IA que combina la recuperación de información precisa con la generación de respuestas contextualizadas. Transforma la eficiencia operativa y la atención al cliente en PYMES.','agente rag, pyme, transformacion, eficiencia operativa, atencion cliente','faq-agente-rag',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(20,'¿Cómo mejora la atención al cliente multicanal Agente RAG?','Agente RAG integra múltiples canales de comunicación (Gmail, WhatsApp, etc.) para ofrecer una atención al cliente consistente, personalizada e inmediata, centralizando el historial y optimizando la experiencia del usuario.','multicanal, gmail, whatsapp, atencion cliente consistente, experiencia usuario','faq-atencion-cliente',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(21,'¿Qué procesos de mi empresa puedo automatizar con Agente RAG?','Agente RAG automatiza desde la atención al cliente y la gestión de tareas hasta la generación de contenido y el análisis de datos. Optimiza la eficiencia operativa y reduce errores en tu PYME.','automatizar procesos, gestion tareas, generacion contenido, analisis datos, eficiencia','faq-automatizacion',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(22,'¿Cuáles son los beneficios globales de implementar Agente RAG en mi PYME?','Agente RAG ofrece centralización y agilidad en la gestión, automatización integral de procesos, adaptabilidad y escalabilidad de servicios, y mejora en la toma de decisiones, impulsando la competitividad de tu PYME.','beneficios globales, centralizacion agilidad, automatizacion integral, competitividad pyme','faq-beneficios',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(23,'¿Cuál es el retorno de inversión de implementar chatbots con IA?','Reducen costos operativos y mejoran la eficiencia, lo que se traduce en un alto ROI gracias al ahorro de recursos y al incremento en la satisfacción del cliente.','roi, costos operativos, eficiencia, ahorro recursos, satisfaccion cliente','faq-roi',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(24,'¿Cómo se integra un chatbot con IA en sistemas existentes?','Mediante APIs y conectores, permitiendo su comunicación con CRM, ERP u otros sistemas para ofrecer una experiencia integrada.','apis, conectores, crm, erp, sistemas, experiencia integrada','faq-integracion',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(25,'¿Qué reducción de costos operativos puedo esperar con Agente RAG?','La implementación de Agente RAG puede reducir los costos operativos hasta en un 30%, automatizando tareas y optimizando procesos, generando un retorno de inversión significativo.','reduccion costos operativos, 30 por ciento, automatizar tareas, roi significativo','faq-costos',1.00,'2025-07-15 00:19:14','2025-07-15 00:24:07'),(26,'¿Cómo funciona un chatbot con inteligencia artificial?','Se basa en el procesamiento del lenguaje natural, aprendizaje automático y análisis de datos para interpretar consultas y proporcionar respuestas relevantes.','procesamiento lenguaje natural, aprendizaje automatico, analisis datos','faq-chatbots',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(27,'¿Qué beneficios ofrece un chatbot con IA para mi negocio?','Ofrece atención 24/7, reduce tiempos de respuesta, optimiza procesos y mejora la experiencia del cliente, lo que puede aumentar la fidelización y reducir costos.','atencion 24/7, tiempos respuesta, optimizacion procesos, experiencia cliente','faq-beneficios',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(28,'¿Cómo puede la IA automatizar procesos en mi empresa?','La IA identifica patrones en grandes volúmenes de datos y ejecuta tareas repetitivas de forma autónoma, mejorando la eficiencia operativa y reduciendo errores.','ia, automatizar procesos, patrones datos, eficiencia operativa','faq-automatizacion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(29,'¿Qué procesos se pueden automatizar con IA?','Se pueden automatizar procesos en atención al cliente, marketing, gestión administrativa, análisis de datos, entre otros.','automatizar, atencion cliente, marketing, gestion administrativa, analisis datos','faq-automatizacion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(30,'¿Cómo mejora la atención al cliente un chatbot con IA?','Permite respuestas rápidas, personalizadas y disponibles las 24 horas, mejorando la experiencia del usuario y aliviando la carga del equipo humano.','atencion cliente, respuestas rapidas, personalizadas, 24 horas','faq-atencion-cliente',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(31,'¿Qué diferencia hay entre un chatbot con IA y uno tradicional?','Mientras los chatbots tradicionales usan respuestas predefinidas, los chatbots con IA aprenden y se adaptan a las consultas para ofrecer respuestas más precisas y contextuales.','chatbot ia vs tradicional, respuestas predefinidas, aprendizaje, contextuales','faq-chatbots',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(32,'¿Qué tecnologías se utilizan en un chatbot con IA?','Se emplean técnicas de procesamiento del lenguaje natural, machine learning, deep learning y frameworks como TensorFlow o PyTorch.','procesamiento lenguaje natural, machine learning, deep learning, tensorflow, pytorch','faq-tecnologia',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(33,'¿Es seguro utilizar chatbots con IA en la atención al cliente?','Sí, siempre que se implementen protocolos de seguridad y protección de datos adecuados.','seguridad, chatbots ia, protocolos seguridad, proteccion datos','faq-seguridad',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(34,'¿Cómo se entrenan los chatbots con IA para mejorar su rendimiento?','Se entrenan con grandes conjuntos de datos y mediante algoritmos de aprendizaje automático, permitiéndoles adaptarse y mejorar con el tiempo.','entrenar chatbots, conjuntos datos, algoritmos aprendizaje, mejorar rendimiento','faq-entrenamiento',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(35,'¿Qué impacto tiene la automatización con IA en la productividad de una empresa?','La automatización reduce tareas manuales y errores, permitiendo que el equipo se enfoque en actividades de mayor valor y aumentando la productividad.','automatizacion ia, productividad empresa, tareas manuales, actividades valor','faq-productividad',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(36,'¿Cuánto cuesta implementar un chatbot con IA?','El costo varía según las funcionalidades, la integración y el tamaño de la empresa; se recomienda solicitar una cotización personalizada.','costo chatbot ia, funcionalidades, integracion, cotizacion personalizada','faq-costos',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(37,'¿Se pueden integrar chatbots con IA en plataformas de mensajería?','Sí, la mayoría de las soluciones permiten la integración con múltiples plataformas para ofrecer una experiencia omnicanal.','chatbots plataformas mensajeria, integracion, experiencia omnicanal','faq-integracion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(38,'¿Cómo ayuda Agente RAG en la generación de contenido asistida por IA?','Agente RAG facilita la creación de contenido para marketing y comunicación interna, generando textos, imágenes y videos de forma automatizada o asistida, personalizando el mensaje y aumentando la productividad.','generacion contenido, marketing, comunicacion interna, textos imagenes videos, productividad','faq-contenido',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(39,'¿Cómo se integra Agente RAG con mi CRM o ERP?','Agente RAG se integra fácilmente con sistemas CRM/ERP para optimizar la gestión de clientes, ventas y operaciones, sincronizando datos, automatizando registros y generando alertas, mejorando la toma de decisiones.','integracion crm erp, gestion clientes ventas, sincronizar datos, toma decisiones','faq-integracion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(40,'¿Qué medidas de seguridad y monitoreo ofrece Agente RAG?','Agente RAG incluye soluciones para la detección proactiva de amenazas, monitoreo continuo y cumplimiento normativo, alertando sobre actividades sospechosas y garantizando la seguridad de la información.','seguridad monitoreo, deteccion amenazas, cumplimiento normativo, actividades sospechosas','faq-seguridad',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(41,'¿Cómo personaliza Agente RAG los servicios para mi PYME?','Agente RAG ofrece servicios de integración y personalización que adaptan la solución a las necesidades específicas de cada PYME, creando flujos de trabajo personalizados y brindando capacitación y soporte continuo.','personalizar servicios pyme, flujos trabajo personalizados, capacitacion soporte','faq-personalizacion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(42,'¿Cómo mejora Agente RAG el tiempo de respuesta en la atención al cliente?','Agente RAG reduce drásticamente el tiempo de respuesta en la atención al cliente, ofreciendo respuestas casi instantáneas y resolviendo problemas de forma eficiente, mejorando la satisfacción del cliente.','tiempo respuesta, respuestas instantaneas, resolver problemas, satisfaccion cliente','faq-atencion-cliente',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(43,'¿Qué tipo de información puede recuperar Agente RAG?','Agente RAG puede recuperar información específica y actualizada de diversas fuentes internas de la empresa, como documentos, bases de datos, catálogos, reportes y registros históricos, optimizando la precisión de las respuestas.','recuperar informacion, fuentes internas, documentos bases datos, precision respuestas','faq-funcionalidad',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(44,'¿Cómo funciona el proceso de generación de respuestas de Agente RAG?','Agente RAG utiliza modelos avanzados de lenguaje natural para generar respuestas en lenguaje natural, combinando la información recuperada con conocimiento preentrenado, asegurando respuestas coherentes, precisas y basadas en datos verificados.','generacion respuestas, modelos lenguaje natural, conocimiento preentrenado, datos verificados','faq-funcionalidad',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(45,'¿Por qué es importante la técnica RAG para la precisión de la información?','La técnica RAG es esencial para escenarios donde la precisión de la información es crítica, ya que fundamenta cada respuesta en datos específicos, reduciendo errores y alucinaciones comunes en modelos generativos.','tecnica rag, precision informacion, datos especificos, reducir errores alucinaciones','faq-tecnica-rag',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(46,'¿Cuáles son los componentes principales de la arquitectura de Agente RAG?','La arquitectura de Agente RAG incluye módulos de captura de consultas, recuperación de información, generación de respuestas y acciones automatizadas, trabajando interconectados para automatizar procesos administrativos.','arquitectura agente rag, modulos captura consultas, recuperacion informacion, acciones automatizadas','faq-arquitectura',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(47,'¿Cómo se integra Agente RAG en el flujo de trabajo diario de mi empresa?','Agente RAG se integra en el flujo de trabajo a través de webhooks, APIs y conectores, automatizando tareas específicas y respondiendo a consultas en tiempo real, optimizando la eficiencia y la productividad.','flujo trabajo diario, webhooks apis conectores, tareas especificas, tiempo real','faq-integracion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(48,'¿Necesito conocimientos técnicos avanzados para implementar Agente RAG?','No necesitas conocimientos técnicos avanzados para empezar a usar Agente RAG. Ofrecemos servicios de consultoría e implementación para personalizar y orquestar flujos de trabajo, adaptándonos a las necesidades de tu PYME.','conocimientos tecnicos, consultoria implementacion, personalizar flujos trabajo, necesidades pyme','faq-implementacion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(49,'¿Qué tipo de soporte y capacitación ofrece Agente RAG?','Ofrecemos capacitación y soporte completo para el uso y optimización de Agente RAG, asegurando que tu equipo pueda aprovechar al máximo la herramienta y lograr los mejores resultados.','soporte capacitacion, uso optimizacion, aprovechar herramienta, mejores resultados','faq-soporte',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(50,'¿Cómo puedo empezar a utilizar Agente RAG en mi PYME?','Empezar a utilizar Agente RAG es fácil. Contáctanos para una consultoría personalizada y descubre cómo podemos transformar tu negocio con soluciones de IA a medida.','empezar utilizar, consultoria personalizada, transformar negocio, soluciones ia medida','faq-inicio',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(51,'¿Agente RAG funciona solo con Google Workspace?','No, aunque Agente RAG se integra fuertemente con Google Workspace (Gmail, Sheets, Calendar), también puede integrarse con otras plataformas y sistemas empresariales a través de APIs y conectores.','google workspace, gmail sheets calendar, otras plataformas, sistemas empresariales','faq-integracion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(52,'¿Puedo probar Agente RAG antes de implementarlo completamente?','Sí, recomendamos realizar pruebas piloto y ajustes antes del despliegue completo de Agente RAG, para evaluar la precisión de las respuestas y la integración con tus sistemas, asegurando una implementación exitosa.','probar agente rag, pruebas piloto, evaluar precision respuestas, implementacion exitosa','faq-pruebas',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(53,'¿Agente RAG es adecuado para empresas de cualquier tamaño?','Agente RAG es especialmente beneficioso para PYMES, ya que ofrece soluciones personalizadas y escalables que se adaptan a las necesidades y presupuesto de empresas de diferentes tamaños.','empresas cualquier tamano, beneficioso pymes, soluciones personalizadas escalables, presupuesto','faq-empresas',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(54,'¿Cómo se actualiza y mantiene Agente RAG?','El mantenimiento y la actualización de Agente RAG se realizan de forma continua, asegurando que la solución esté siempre optimizada y actualizada con las últimas tecnologías y mejoras.','actualizar mantener, forma continua, solucion optimizada, ultimas tecnologias mejoras','faq-mantenimiento',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(55,'¿Agente RAG aprende y mejora con el tiempo?','Sí, Agente RAG utiliza técnicas de aprendizaje automático que le permiten aprender y mejorar con el tiempo, optimizando sus respuestas y adaptándose a las interacciones y datos.','aprende mejora tiempo, tecnicas aprendizaje automatico, optimizar respuestas, adaptarse interacciones','faq-aprendizaje',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(56,'¿Qué tipo de resultados puedo esperar en términos de eficiencia con Agente RAG?','Con Agente RAG, puedes esperar mejoras significativas en eficiencia, como reducción de tiempos de respuesta, automatización de tareas repetitivas y optimización de procesos, liberando recursos y mejorando la productividad general.','resultados eficiencia, mejoras significativas, reduccion tiempos, automatizacion tareas repetitivas','faq-eficiencia',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(57,'¿Cómo se compara Agente RAG con otras soluciones de chatbot o IA?','Agente RAG se diferencia de otras soluciones por su enfoque en la precisión de la información, la personalización a medida y la integración integral de procesos, ofreciendo una solución más completa y efectiva para PYMES.','comparar otras soluciones, precision informacion, personalizacion medida, integracion integral','faq-comparacion',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07'),(58,'¿Cuál es el costo de implementar Agente RAG en mi PYME?','El costo de implementar Agente RAG varía según las necesidades específicas de cada PYME, el alcance de la implementación y los servicios personalizados requeridos. Solicita una cotización personalizada para conocer el costo exacto para tu empresa.','costo implementar, necesidades especificas pyme, alcance implementacion, cotizacion personalizada','faq-costos',1.00,'2025-07-15 00:24:07','2025-07-15 00:24:07');
/*!40000 ALTER TABLE `rag_knowledge_base` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `web_scraping_cache`
--

DROP TABLE IF EXISTS `web_scraping_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `web_scraping_cache` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(500) NOT NULL,
  `url_hash` varchar(64) NOT NULL,
  `title` varchar(500) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `scraped_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('success','error','pending') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_hash` (`url_hash`),
  KEY `idx_url_hash` (`url_hash`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `web_scraping_cache`
--

LOCK TABLES `web_scraping_cache` WRITE;
/*!40000 ALTER TABLE `web_scraping_cache` DISABLE KEYS */;
INSERT INTO `web_scraping_cache` VALUES (1,'https://agenterag.com/php-apis/estadisticas.php','a8e520c2d3669e6720d52c37657f25e1a6e2b4db65527600ba4b9e1243da2f73','','{\"success\":true,\"estadisticas\":{\"total_posts\":11,\"total_published\":11,\"total_views\":36,\"total_likes\":172,\"avg_reading_time\":7.363636363636363,\"avg_generation_time\":18430.818181818184}}','','success, true, estadisticas, total_posts, total_published, total_views, total_likes, avg_reading_time, 363636363636363, avg_generation_time','2025-07-15 20:29:24','2025-07-16 20:29:24','success',NULL),(2,'https://agenterag.com/php-apis/obtener-blogs.php','cb126f666d4ebcfdab9be4af0d34335648b5aee72ba905546d562914db5f508a','','{\"success\":true,\"blogs\":[{\"id\":\"8eba13ff-d9e0-40d2-aebf-45df4d34613f\",\"titulo\":\"IA Generativa: Aspectos T\\u00e9cnicos Avanzados y Casos de Uso en 2025\",\"slug\":\"-enerativa-spectos-cnicos-vanzados-y-aso-6887b253\",\"resumen\":\"Este art\\u00edculo explora los aspectos t\\u00e9cnicos de la IA generativa, sus aplicaciones en diversas industrias, los desaf\\u00edos que presenta y las estrategias para mitigar los riesgos asociados. Se incluyen ejemplos de c\\u00f3digo, estad\\u00edsticas de 2025 y perspectivas futuras.\",\"contenido\":\"## IA Generativa: Aspectos T\\u00e9cnicos Avanzados y Casos de Uso en 2025\\n\\n**Introducci\\u00f3n:**\\n\\nLa Inteligencia Artificial Generativa (IAG) ha experimentado un crecimiento exponencial en los \\u00faltimos a\\u00f1os, pasando de ser una tecnolog\\u00eda de nicho a una fuerza transformadora en m\\u00faltiples industrias. En 2025, se espera que la IAG alcance un nivel de madurez a\\u00fan mayor, con aplicaciones m\\u00e1s sofisticadas y una integraci\\u00f3n m\\u00e1s profunda en los sistemas existentes. Este documento profundiza en los aspectos t\\u00e9cnicos avanzados de la IAG, sus casos de uso, desaf\\u00edos y futuro, con un enfoque en datos y estad\\u00edsticas proyectadas para 2025.\\n\\n**Fundamentos:**\\n\\nLa IAG se basa en modelos de aprendizaje profundo, principalmente redes neuronales adversarias (GANs) y transformadores (Transformers). Los GANs consisten en dos redes neuronales, un generador y un discriminador, que compiten entre s\\u00ed para generar datos sint\\u00e9ticos indistinguibles de los datos reales. Los Transformers, por otro lado, son modelos basados en la atenci\\u00f3n que han demostrado un gran \\u00e9xito en tareas de procesamiento del lenguaje natural y generaci\\u00f3n de im\\u00e1genes.\\n\\n**Ejemplos de arquitecturas avanzadas:**\\n\\n* **Diffusion Models:** Estos modelos generan datos a partir de ruido, iterativamente refinando la muestra hasta obtener un resultado coherente. Son particularmente efectivos en la generaci\\u00f3n de im\\u00e','','2025, u00f3n, generativa, aspectos, u00e9cnicos, datos, avanzados, casos, modelos, este','2025-07-15 20:29:25','2025-07-16 20:29:25','success',NULL),(3,'https://agenterag.com/politica-de-privacidad/','39564de882c74b65df819886715ba17960d25e9a05e3866006f1e1e6a208a25a','Política de Privacidad | Agente RAG','Última actualización: 1 de junio de 2024 En Agente RAG (Soluciones en Inteligencia Artificial SPA), valoramos y respetamos su privacidad. Esta  explica cómo recopilamos, utilizamos, divulgamos y protegemos su información cuando utiliza nuestro sitio web y nuestros servicios de inteligencia artificial. 2. Información que recopilamos Podemos recopilar los siguientes tipos de información: 3. Cómo utilizamos su información Utilizamos la información recopilada para: 4. Compartir y divulgación No vendemos su información personal. Podemos compartir su información en las siguientes circunstancias: 5. Seguridad de datos Implementamos medidas de seguridad diseñadas para proteger su información personal. Sin embargo, ningún sistema es completamente seguro, y no podemos garantizar la seguridad absoluta de su información. Dependiendo de su ubicación, puede tener ciertos derechos relacionados con su información personal, incluyendo: 7. Retención de datos Conservamos su información personal mientras sea necesario para los fines establecidos en esta , a menos que la ley exija o permita un período de retención más largo. 8. Cambios a esta política Podemos actualizar esta  periódicamente. Le notificaremos cualquier cambio publicando la nueva  en esta página y actualizando la fecha de \"última actualización\". Si tiene preguntas sobre esta , contáctenos en: contacto@agenterag.com Soluciones en Inteligencia Artificial SPA 78.109.539-7 Patente Comercial: Rol N° 2-199837 Av. Santa Magdalena 75, Oficina 304, Providencia, Región Metropolitana Mostrar Mapa Aumentamos el valor agregado de tu servicio con Inteligencia Artificial RAG. ⚡ Powered by agenterag.com 2025','','informaci, inteligencia, artificial, podemos, personal, utilizamos, seguridad, tica, privacidad, agente','2025-07-15 22:15:48','2025-07-16 22:15:48','success',NULL);
/*!40000 ALTER TABLE `web_scraping_cache` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-04 12:22:05
