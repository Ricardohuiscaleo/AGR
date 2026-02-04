-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: srv1438.hstgr.io    Database: u958525313_booking
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
-- Table structure for table `booking_sessions`
--

DROP TABLE IF EXISTS `booking_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_sessions` (
  `id` varchar(50) NOT NULL,
  `user_ip` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `selected_date` date DEFAULT NULL,
  `selected_time` time DEFAULT NULL,
  `form_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`form_data`)),
  `step` int(11) DEFAULT 1,
  `temp_booking_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','completed','expired') DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_sessions`
--

LOCK TABLES `booking_sessions` WRITE;
/*!40000 ALTER TABLE `booking_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(100) NOT NULL,
  `google_event_id` varchar(255) DEFAULT NULL,
  `calendar_id` varchar(255) DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `client_phone` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('confirmed','cancelled','completed') DEFAULT 'confirmed',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES ('booking_6871727289437_1752265330','fallback_dd77e03f086c80b9_1752265330','ricardo.huiscaleo@gmail.com','2025-07-11 23:00:00','2025-07-11 23:30:00','ricardo','ricardo.huiscaleo@gmail.com','+56 922504275','hola este es un test\n','confirmed','2025-07-11 20:22:10','2025-07-11 20:22:10'),('booking_687172e0b6683_1752265440','fallback_0bdfdb077f8ada5c_1752265440','ricardo.huiscaleo@gmail.com','2025-07-11 23:00:00','2025-07-11 23:30:00','ricardo ','ricardo.huiscaleo@gmail.com','+56 922504275','hola este es un test','confirmed','2025-07-11 20:24:00','2025-07-11 20:24:00'),('booking_68718a0f26ea3_1752271375','0et2u8o0ao1qbnjc2lvi60d0ps','ricardo.huiscaleo@gmail.com','2025-07-14 20:00:00','2025-07-14 20:30:00','ricardo','ricardo.huiscaleo@gmail.com','+56 922504275','holax11','confirmed','2025-07-11 22:02:55','2025-07-11 22:02:55'),('booking_68e116e230a62_1759581922','bg828j92po9oetr2g1ipt06s78','ricardo.huiscaleo@gmail.com','2025-10-06 19:00:00','2025-10-06 19:30:00','Ricardo Huiscaleo','ricardo.huiscaleo@gmail.com','+56 922504275','Esto es un test','confirmed','2025-10-04 12:45:22','2025-10-04 12:45:22');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_bookings`
--

DROP TABLE IF EXISTS `temp_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_bookings` (
  `id` varchar(100) NOT NULL,
  `session_id` varchar(50) DEFAULT NULL,
  `google_event_id` varchar(200) DEFAULT NULL,
  `calendar_id` varchar(200) DEFAULT NULL,
  `start_datetime` datetime DEFAULT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `client_name` varchar(200) DEFAULT NULL,
  `client_email` varchar(200) DEFAULT NULL,
  `client_phone` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('temp','confirmed','expired','cancelled') DEFAULT 'temp',
  PRIMARY KEY (`id`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_session` (`session_id`),
  KEY `idx_google_event` (`google_event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_bookings`
--

LOCK TABLES `temp_bookings` WRITE;
/*!40000 ALTER TABLE `temp_bookings` DISABLE KEYS */;
INSERT INTO `temp_bookings` VALUES ('temp_687186122ec05_1752270354','plvlv2q3ubok017oh4qmccmkjp',NULL,'ricardo.huiscaleo@gmail.com','2025-07-12 01:00:00','2025-07-12 01:30:00','ricardo','ricardo.huiscaleo@gmai.com','+56 922504275','hola hola hola','2025-07-11 21:45:54','2025-07-11 21:55:54','temp'),('temp_687189881ff6c_1752271240','plvlv2q3ubok017oh4qmccmkjp',NULL,'ricardo.huiscaleo@gmail.com','2025-07-14 14:00:00','2025-07-14 14:30:00','ricardo','ricardo.huiscaleo@gmail.com','+56 922504275','hola x10','2025-07-11 22:00:40','2025-07-11 22:10:40','temp'),('temp_687189ef070f8_1752271343','plvlv2q3ubok017oh4qmccmkjp',NULL,'ricardo.huiscaleo@gmail.com','2025-07-14 20:00:00','2025-07-14 20:30:00','ricardo','ricardo.huiscaleo@gmail.com','+56 922504275','holax11','2025-07-11 22:02:23','2025-07-11 22:12:23','temp'),('temp_68d88ce714660_1759022311','bqr68s8k53793svq85qiidvpht',NULL,'ricardo.huiscaleo@gmail.com','2025-09-29 13:00:00','2025-09-29 13:30:00','Reserva Temporal - Usuario Pendiente',NULL,NULL,NULL,'2025-09-28 01:18:31','2025-09-28 01:28:31','temp'),('temp_68d88cf2500cf_1759022322','bqr68s8k53793svq85qiidvpht',NULL,'ricardo.huiscaleo@gmail.com','2025-09-29 19:00:00','2025-09-29 19:30:00','Reserva Temporal - Usuario Pendiente',NULL,NULL,NULL,'2025-09-28 01:18:42','2025-09-28 01:28:42','temp'),('temp_68e116b7d0784_1759581879','rbv7jt241t9v8ea74cr4kprurh',NULL,'ricardo.huiscaleo@gmail.com','2025-10-06 19:00:00','2025-10-06 19:30:00','Ricardo Huiscaleo','ricardo.huiscaleo@gmail.com','+56 922504275','Esto es un test','2025-10-04 12:44:39','2025-10-04 12:54:39','temp');
/*!40000 ALTER TABLE `temp_bookings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-04 12:21:53
