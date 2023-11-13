-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Nov 13, 2023 alle 12:38
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
(1, 'BATERY TRASPORTI SRL', 'MI - 2630747', '842340340234', 'società a responsabilità limitata', 'via delle bombe, 12', 'piazza la bomba, 33', '3891323232', 'mail@gmail.com', 'pec1@pec.it', 'www.google.com', 'aomsdaosdmaodmsaosdoamdaomsdoasdm', 1, 5, '2023-11-10 22:46:45', '2023-11-12 13:39:12'),
(2, 'Anthony SRL', 'MI - 2630750', '96723403402', 'società a responsabilità limitata', 'via da li, 12', 'piazza il box, 33', '3891323232', 'mail2@gmail.com', 'pec2@pec.it', 'www.google2.com', 'aomsdaosdmaodmsaosdoamdaomsdoasdm', 1, 6, '2023-11-10 22:46:45', '2023-11-12 13:41:18'),
(5, 'azienda di test', 'MI-123123', '12312323', NULL, '30016 Jesolo VE, Italia', 'Venezia VE, Italia', '023123', 'EMAI@GME.COM', 'PEC@PEC.IT', 'www.site.it', 'descrizione', 1, 6, '2023-11-12 18:47:21', '2023-11-12 18:47:21'),
(6, 'Azie', 'MI-123123', '923423942934', NULL, '20018 Sedriano MI, Italia', '55049 Viareggio LU, Italia', '123123', 'AZIENDA@GMAIL.COM', 'EPEC@PEC.IT', 'WWW.SITE.COM', 'EVENTUALI', 1, 5, '2023-11-12 18:51:09', '2023-11-12 18:51:09'),
(7, 'bianca', 'MI-12324', '41231231', 'Società a responsabilità limitata', 'Via Sdrucciola, 06122 Perugia PG, Italia', '46019 Viadana MN, Italia', '02312323', 'pec@cgm.com', 'asde@pec.it', '', '', 1, 5, '2023-11-12 18:54:17', '2023-11-12 18:54:17'),
(8, 'MyPlayBuddy', 'MI-12323', 'request', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', '', '', 1, 5, '2023-11-12 19:44:06', '2023-11-12 19:44:06'),
(9, 'MyPlayBuddy', 'MI-12323', '84234034023', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', '', '', 1, 5, '2023-11-12 19:52:34', '2023-11-12 19:52:34'),
(10, 'MyPlayBuddy', 'MI-12323', '84234034022', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', '', '', 1, 5, '2023-11-12 19:55:11', '2023-11-12 19:55:11'),
(11, 'MyPlayBuddy', 'MI-12323', '842340340233', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', '', '', 1, 5, '2023-11-12 19:57:34', '2023-11-12 19:57:34'),
(12, 'MyPlayBuddy', 'MI-12323', '842340340212', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', 'sdasd', '', 1, 5, '2023-11-12 19:58:47', '2023-11-12 19:58:47'),
(13, 'MyPlayBuddy', 'MI-12323', '842340340123', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', 'sdasd', '', 1, 5, '2023-11-12 19:59:54', '2023-11-12 19:59:54'),
(14, 'MyPlayBuddy', 'MI-12323', '8423403412', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', '', '', 1, 6, '2023-11-12 20:00:54', '2023-11-12 20:00:54'),
(15, 'MyPlayBuddy', 'MI-12323', '8423403401222', 'Società a responsabilità limitata', 'ASD Passirana, 20017 Rho MI, Italia', 'ASD Passirana, 20017 Rho MI, Italia', '3891733185', 'georgeavila94@gmail.com', 'ASDAS@PEC.IT', 'sdasd', '', 1, 5, '2023-11-12 20:05:23', '2023-11-12 20:05:23');

-- --------------------------------------------------------

--
-- Struttura della tabella `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `roles`
--

INSERT INTO `roles` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'worker', '2023-11-04 18:30:05', '2023-11-04 18:30:05'),
(2, 'moderator', '2023-11-04 18:30:26', '2023-11-04 18:30:26'),
(3, 'admin', '2023-11-04 18:30:36', '2023-11-04 18:30:36'),
(4, 'ceo', '2023-11-11 09:03:32', '2023-11-11 09:03:32');

-- --------------------------------------------------------

--
-- Struttura della tabella `useroles`
--

CREATE TABLE `useroles` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `surname`, `email`, `password`, `createdAt`, `updatedAt`) VALUES
(1, 'jordanavila', 'Jordan', 'Avila', 'jordanavila1394@gmail.com', '$2a$08$DlamsgRXrcukFgjxZm8LFeFLOdGW2IDTqYSnx5LLXvoxY2DEB.ps6', '2023-11-04 17:34:44', '2023-11-04 17:34:44'),
(2, 'mariagutierrez', 'Maria', 'Gutierrez', 'mariagutierrez@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', '2023-11-04 19:50:02', '2023-11-04 19:50:02'),
(3, 'luisalfonso', 'Luis Alfonso', 'Rodriguez Ramirez', 'autista@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', '2023-11-04 19:50:02', '2023-11-04 19:50:02'),
(5, 'marcocarta94', 'Marco', 'Carta', 'marcocarta@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', '2023-11-04 19:50:02', '2023-11-04 19:50:02'),
(6, 'lucaRossi94', 'Luca', 'Rossi', 'lucarossi@gmail.com', '$2a$12$CIDOlpha.7vdTPlOclS5EeyVRH8oiMcWsy5YyhnW2WfU13vDOb40y', '2023-11-04 19:50:02', '2023-11-04 19:50:02');

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
-- Indici per le tabelle `useroles`
--
ALTER TABLE `useroles`
  ADD PRIMARY KEY (`userId`,`roleId`),
  ADD KEY `roleId` (`roleId`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `useroles`
--
ALTER TABLE `useroles`
  ADD CONSTRAINT `useroles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `useroles_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
