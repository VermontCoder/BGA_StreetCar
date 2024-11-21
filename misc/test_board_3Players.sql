-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Sep 24, 2024 at 08:27 PM
-- Server version: 5.7.44-log
-- PHP Version: 8.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ebd_streetcar_621548`
--

-- --------------------------------------------------------

--
-- Table structure for table `bga_globals`
--

TRUNCATE TABLE `bga_globals`;
--
-- Dumping data for table `bga_globals`
--

INSERT INTO `bga_globals` (`name`, `value`) VALUES
('curDie', 'null'),
('curTrainDestinationsSelection', 'null'),
('curTrainFacingsTileSelection', 'null'),
('stackIndex', '57');


-- Truncate table before insert `board`
--

TRUNCATE TABLE `board`;
--
-- Dumping data for table `board`
--

INSERT INTO `board` (`board_x`, `board_y`, `directions_free`, `stop`, `card`, `rotation`) VALUES
(0, 0, 'X', NULL, 0, 0),
(0, 1, 'X', NULL, 0, 0),
(0, 2, 'ES', NULL, 1, 270),
(0, 3, 'NE', NULL, 1, 180),
(0, 4, 'X', NULL, 0, 0),
(0, 5, 'X', NULL, 0, 0),
(0, 6, 'ES', NULL, 1, 270),
(0, 7, 'NE', NULL, 1, 180),
(0, 8, 'X', NULL, 0, 0),
(0, 9, 'X', NULL, 0, 0),
(0, 10, 'ES', NULL, 1, 270),
(0, 11, 'NE', NULL, 1, 180),
(0, 12, 'X', NULL, 0, 0),
(0, 13, 'X', NULL, 0, 0),
(1, 0, 'X', NULL, 0, 0),
(1, 1, '[]', NULL, 0, 0),
(1, 2, '[]', NULL, 0, 0),
(1, 3, '[]', NULL, 0, 0),
(1, 4, '[]', NULL, 0, 0),
(1, 5, '[]', NULL, 0, 0),
(1, 6, 'EW', 'G', 0, 0),
(1, 7, '[]', NULL, 0, 0),
(1, 8, '[]', NULL, 0, 0),
(1, 9, '[]', NULL, 0, 0),
(1, 10, '[]', NULL, 0, 0),
(1, 11, '[]', NULL, 0, 0),
(1, 12, '[]', NULL, 0, 0),
(1, 13, 'X', NULL, 0, 0),
(2, 0, 'ES', NULL, 1, 270),
(2, 1, 'SN', NULL, 0, 90),
(2, 2, '[]', NULL, 0, 0),
(2, 3, 'NES', NULL, 3, 0),
(2, 4, '[]', NULL, 0, 0),
(2, 5, 'SN', NULL, 0, 90),
(2, 6, 'SWNE', NULL, 9, 180),
(2, 7, '[]', NULL, 0, 0),
(2, 8, '[]', NULL, 0, 0),
(2, 9, '[]', NULL, 0, 0),
(2, 10, 'EW', 'F', 0, 0),
(2, 11, '[]', NULL, 0, 0),
(2, 12, '[]', NULL, 0, 0),
(2, 13, 'NE', NULL, 1, 180),
(3, 0, 'SW', NULL, 1, 0),
(3, 1, 'SN', NULL, 0, 90),
(3, 2, 'SN', 'H', 0, 90),
(3, 3, 'NESW', NULL, 8, 0),
(3, 4, 'NES', NULL, 3, 0),
(3, 5, '[]', NULL, 0, 0),
(3, 6, 'NESW', NULL, 9, 0),
(3, 7, '[]', NULL, 0, 0),
(3, 8, 'SWE', NULL, 4, 180),
(3, 9, 'SNE', NULL, 2, 180),
(3, 10, 'WNES', NULL, 7, 270),
(3, 11, 'NS', NULL, 0, 270),
(3, 12, 'SN', NULL, 0, 90),
(3, 13, 'NW', NULL, 1, 90),
(4, 0, 'X', NULL, 0, 0),
(4, 1, '[]', NULL, 0, 0),
(4, 2, '[]', NULL, 0, 0),
(4, 3, 'EW', NULL, 0, 0),
(4, 4, '[]', NULL, 0, 0),
(4, 5, '[]', NULL, 0, 0),
(4, 6, 'EW', 'M', 0, 0),
(4, 7, '[]', NULL, 0, 0),
(4, 8, '[]', NULL, 0, 0),
(4, 9, '[]', NULL, 0, 0),
(4, 10, '[]', NULL, 0, 0),
(4, 11, '[]', NULL, 0, 0),
(4, 12, '[]', NULL, 0, 0),
(4, 13, 'X', NULL, 0, 0),
(5, 0, 'X', NULL, 0, 0),
(5, 1, '[]', NULL, 0, 0),
(5, 2, '[]', NULL, 0, 0),
(5, 3, 'WE', NULL, 0, 180),
(5, 4, '[]', NULL, 0, 0),
(5, 5, '[]', NULL, 0, 0),
(5, 6, 'SW', NULL, 1, 0),
(5, 7, 'ESN', NULL, 4, 90),
(5, 8, 'ESN', NULL, 4, 90),
(5, 9, 'NESW', NULL, 5, 0),
(5, 10, '[]', NULL, 0, 0),
(5, 11, '[]', NULL, 0, 0),
(5, 12, '[]', NULL, 0, 0),
(5, 13, 'X', NULL, 0, 0),
(6, 0, 'ES', NULL, 1, 270),
(6, 1, '[]', NULL, 0, 0),
(6, 2, 'ESWN', NULL, 10, 90),
(6, 3, 'NEW', NULL, 6, 0),
(6, 4, '[]', NULL, 0, 0),
(6, 5, '[]', NULL, 0, 0),
(6, 6, 'ES', NULL, 1, 270),
(6, 7, 'NESW', NULL, 11, 0),
(6, 8, '[]', NULL, 0, 0),
(6, 9, '[]', NULL, 0, 0),
(6, 10, '[]', NULL, 0, 0),
(6, 11, '[]', NULL, 0, 0),
(6, 12, '[]', NULL, 0, 0),
(6, 13, 'NE', NULL, 1, 180),
(7, 0, 'SW', NULL, 1, 0),
(7, 1, '[]', NULL, 0, 0),
(7, 2, '[]', NULL, 0, 0),
(7, 3, 'SW', NULL, 1, 0),
(7, 4, 'SN', 'I', 0, 90),
(7, 5, 'NES', NULL, 3, 0),
(7, 6, 'ESWN', NULL, 11, 90),
(7, 7, '[]', NULL, 0, 0),
(7, 8, '[]', NULL, 0, 0),
(7, 9, '[]', NULL, 0, 0),
(7, 10, '[]', NULL, 0, 0),
(7, 11, '[]', NULL, 0, 0),
(7, 12, '[]', NULL, 0, 0),
(7, 13, 'NW', NULL, 1, 90),
(8, 0, 'X', NULL, 0, 0),
(8, 1, '[]', NULL, 0, 0),
(8, 2, 'EW', NULL, 0, 0),
(8, 3, '[]', NULL, 0, 0),
(8, 4, '[]', NULL, 0, 0),
(8, 5, '[]', NULL, 0, 0),
(8, 6, 'SW', 'K', 1, 0),
(8, 7, 'SN', NULL, 0, 90),
(8, 8, 'NEW', NULL, 4, 0),
(8, 9, '[]', NULL, 0, 0),
(8, 10, '[]', NULL, 0, 0),
(8, 11, '[]', NULL, 0, 0),
(8, 12, '[]', NULL, 0, 0),
(8, 13, 'X', NULL, 0, 0),
(9, 0, 'X', NULL, 0, 0),
(9, 1, 'ES', 'A', 1, 270),
(9, 2, 'NESW', NULL, 8, 0),
(9, 3, '[]', NULL, 0, 0),
(9, 4, '[]', NULL, 0, 0),
(9, 5, '[]', NULL, 0, 0),
(9, 6, '[]', NULL, 0, 0),
(9, 7, '[]', NULL, 0, 0),
(9, 8, 'ESW', NULL, 3, 90),
(9, 9, 'SN', NULL, 0, 90),
(9, 10, 'NE', 'D', 1, 180),
(9, 11, '[]', NULL, 0, 0),
(9, 12, '[]', NULL, 0, 0),
(9, 13, 'X', NULL, 0, 0),
(10, 0, 'ES', NULL, 1, 270),
(10, 1, 'WN', NULL, 1, 90),
(10, 2, 'EW', NULL, 0, 0),
(10, 3, '[]', NULL, 0, 0),
(10, 4, '[]', NULL, 0, 0),
(10, 5, 'NESW', NULL, 5, 0),
(10, 6, '[]', NULL, 0, 0),
(10, 7, '[]', NULL, 0, 0),
(10, 8, '[]', NULL, 0, 0),
(10, 9, '[]', NULL, 0, 0),
(10, 10, 'EW', NULL, 0, 0),
(10, 11, '[]', NULL, 0, 0),
(10, 12, '[]', NULL, 0, 0),
(10, 13, 'NE', NULL, 1, 180),
(11, 0, 'SW', NULL, 1, 0),
(11, 1, 'NE', NULL, 1, 180),
(11, 2, 'EW', NULL, 0, 0),
(11, 3, '[]', NULL, 0, 0),
(11, 4, '[]', NULL, 0, 0),
(11, 5, '[]', NULL, 0, 0),
(11, 6, '[]', NULL, 0, 0),
(11, 7, 'ES', NULL, 1, 270),
(11, 8, 'NS', NULL, 0, 270),
(11, 9, 'SN', NULL, 0, 90),
(11, 10, 'WN', NULL, 1, 90),
(11, 11, '[]', NULL, 0, 0),
(11, 12, '[]', NULL, 0, 0),
(11, 13, 'NW', NULL, 1, 90),
(12, 0, 'X', NULL, 0, 0),
(12, 1, 'SW', NULL, 1, 0),
(12, 2, 'NEW', NULL, 6, 0),
(12, 3, 'ES', NULL, 1, 270),
(12, 4, 'SN', 'B', 0, 90),
(12, 5, 'SN', NULL, 0, 90),
(12, 6, 'NE', NULL, 1, 180),
(12, 7, 'EW', 'C', 0, 0),
(12, 8, '[]', NULL, 0, 0),
(12, 9, '[]', NULL, 0, 0),
(12, 10, '[]', NULL, 0, 0),
(12, 11, '[]', NULL, 0, 0),
(12, 12, '[]', NULL, 0, 0),
(12, 13, 'X', NULL, 0, 0),
(13, 0, 'X', NULL, 0, 0),
(13, 1, 'X', NULL, 0, 0),
(13, 2, 'SW', NULL, 1, 0),
(13, 3, 'NW', NULL, 1, 90),
(13, 4, 'X', NULL, 0, 0),
(13, 5, 'X', NULL, 0, 0),
(13, 6, 'SW', NULL, 1, 0),
(13, 7, 'NW', NULL, 1, 90),
(13, 8, 'X', NULL, 0, 0),
(13, 9, 'X', NULL, 0, 0),
(13, 10, 'SW', NULL, 1, 0),
(13, 11, 'NW', NULL, 1, 90),
(13, 12, 'X', NULL, 0, 0),
(13, 13, 'X', NULL, 0, 0);

-- Truncate table before insert `player`
--

TRUNCATE TABLE `player`;
--
-- Dumping data for table `player`
--

INSERT INTO `player` (`player_no`, `player_id`, `player_canal`, `player_name`, `player_avatar`, `player_color`, `player_score`, `player_score_aux`, `player_zombie`, `player_ai`, `player_eliminated`, `player_next_notif_no`, `player_enter_game`, `player_over_time`, `player_is_multiactive`, `player_start_reflexion_time`, `player_remaining_reflexion_time`, `player_beginner`, `player_state`, `available_cards`, `linenum`, `goals`, `goalsfinished`, `trainposition`, `traindirection`, `endnodeids`, `laststopnodeid`, `dice`, `diceused`) VALUES
(1, 2383265, 'b9f9d7083fd45204f1c5a40673718fbc', 'FindYodaWinCash1', '000000', 'ff0000', 0, 0, 0, 0, 0, 1, 1, 1, 0, '2024-09-24 22:27:36', -502, NULL, NULL, '[5,2,1,2,1]', 5, '[\"D\",\"F\",\"I\"]', '[]', NULL, NULL, NULL, NULL, NULL, 0),
(2, 2383264, '2ca188c8ca38c17a90d580cd7be575a9', 'FindYodaWinCash0', '000000', '008000', 0, 0, 0, 0, 0, 1, 1, 1, 0, NULL, -661, NULL, NULL, '[2,0,4,5,7]', 3, '[\"D\",\"H\",\"I\"]', '[]', NULL, NULL, NULL, NULL, NULL, 0),
(3, 2383266, 'f79f8b8301baa113b7b615a7876f9bef', 'FindYodaWinCash2', '000000', '0000ff', 0, 0, 0, 0, 0, 1, 1, 1, 0, NULL, -719, 0xffffffffffffffffffffffffffffffff, NULL, '[4,9,2,1,1]', 4, '[\"A\",\"D\",\"M\"]', '[]', NULL, NULL, NULL, NULL, NULL, 0);
