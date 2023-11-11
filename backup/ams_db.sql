-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Nov 11, 2023 alle 13:45
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
  `vat` varchar(100) DEFAULT NULL,
  `registered_office` varchar(255) DEFAULT NULL,
  `head_office` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `companies`
--

INSERT INTO `companies` (`id`, `name`, `vat`, `registered_office`, `head_office`, `phone`, `email`, `website`, `description`, `id_user`, `created_at`, `updated_at`) VALUES
(1, 'Azienda Jordan SRL', '842340340234', 'via delle bombe, 12', 'piazza la bomba, 33', '3891323232', 'mail@gmail.com', 'www.google.com', 'aomsdaosdmaodmsaosdoamdaomsdoasdm', 5, '2023-11-10 22:46:45', '2023-11-11 08:21:13'),
(2, 'Anthony SRL', '96723403402', 'via da li, 12', 'piazza il box, 33', '3891323232', 'mail2@gmail.com', 'www.google2.com', 'aomsdaosdmaodmsaosdoamdaomsdoasdm', 6, '2023-11-10 22:46:45', '2023-11-11 10:22:06');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
