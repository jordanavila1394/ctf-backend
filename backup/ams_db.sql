-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Nov 15, 2023 alle 00:23
-- Versione del server: 10.4.28-MariaDB
-- Versione PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ams_db`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `reaNumber` varchar(255) DEFAULT NULL,
  `vat` varchar(100) DEFAULT NULL,
  `legalForm` varchar(255) DEFAULT NULL,
  `registeredOffice` varchar(255) DEFAULT NULL,
  `headOffice` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `pec` varchar(100) DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `companies`
--

INSERT INTO `companies` (`id`, `name`, `reaNumber`, `vat`, `legalForm`, `registeredOffice`, `headOffice`, `phone`, `email`, `pec`, `website`, `description`, `status`, `userId`, `createdAt`, `updatedAt`) VALUES
(9, 'Societa 1', 'MI-12323', '842340340231', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733182', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', '', '', 1, 5, '2023-11-12 19:52:34', '2023-11-14 19:41:00'),
(11, 'Unoms SRL', 'MI-12323', '842340340232', 'Società per azioni', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', 'www.google.it', 'descrizione', 1, 5, '2023-11-12 19:57:34', '2023-11-14 19:29:30'),
(12, 'Societa2', 'MI-12323', '842340340212', 'Società per azioni', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', 'sdasd', '', 1, 6, '2023-11-12 19:58:47', '2023-11-13 22:04:13'),
(13, 'Azienda fatturona', 'MI-12323', '842340340123', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', 'sdasd', '', 1, 5, '2023-11-12 19:59:54', '2023-11-14 19:28:59'),
(14, 'Trasporti SRL', 'MI-12323', '8423403412', 'Società per azioni', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', '', '', 1, 6, '2023-11-12 20:00:54', '2023-11-14 19:29:11');

-- --------------------------------------------------------

--
-- Struttura della tabella `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(100) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `roles`
--

INSERT INTO `roles` (`id`, `name`, `label`, `createdAt`, `updatedAt`) VALUES
(1, 'worker', 'Autista', '2023-11-04 18:30:05', '2023-11-04 18:30:05'),
(2, 'moderator', 'CTF', '2023-11-04 18:30:26', '2023-11-04 18:30:26'),
(3, 'admin', 'Admin', '2023-11-04 18:30:36', '2023-11-04 18:30:36'),
(4, 'ceo', 'CEO Azienda', '2023-11-11 09:03:32', '2023-11-11 09:03:32');

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT 'Nome',
  `surname` varchar(255) DEFAULT 'Cognome',
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `surname`, `email`, `password`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'jordanavila94', 'Jordan', 'Avilas', 'jordanavila1394@gmail.com', '$2a$08$DlamsgRXrcukFgjxZm8LFeFLOdGW2IDTqYSnx5LLXvoxY2DEB.ps6', 1, '2023-11-04 17:34:44', '2023-11-14 22:22:57'),
(2, 'mariagutierrez', 'Maria', 'Gutierrez', 'mariagutierrez@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', 1, '2023-11-04 19:50:02', '2023-11-04 19:50:02'),
(3, 'luisalfonso', 'Luis Alfonso', 'Rodriguez Ramirez', 'autista@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', 1, '2023-11-04 19:50:02', '2023-11-04 19:50:02'),
(5, 'marcocarta94', 'Marco', 'Carta', 'marcocarta@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', 1, '2023-11-04 19:50:02', '2023-11-04 19:50:02'),
(6, 'lucaRossi94', 'Luca', 'Rossi', 'lucarossi@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', 1, '2023-11-04 19:50:02', '2023-11-04 19:50:02'),
(9, 'asd123', 'nome', 'cognome', 'email@gmail.com', NULL, 1, '2023-11-14 22:15:16', '2023-11-14 22:16:30');

-- --------------------------------------------------------

--
-- Struttura della tabella `user_roles`
--

CREATE TABLE `user_roles` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `roleId` int(11) NOT NULL,
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `user_roles`
--

INSERT INTO `user_roles` (`createdAt`, `updatedAt`, `roleId`, `userId`) VALUES
('2023-11-04 17:34:46', '2023-11-04 17:34:46', 1, 3),
('2023-11-04 19:50:04', '2023-11-04 19:50:04', 2, 2),
('2023-11-04 19:50:04', '2023-11-04 19:50:04', 3, 1),
('2023-11-04 19:50:04', '2023-11-04 19:50:04', 4, 5),
('2023-11-04 19:50:04', '2023-11-04 19:50:04', 4, 6);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`roleId`,`userId`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
