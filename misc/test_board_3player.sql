-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Dec 15, 2024 at 06:50 PM
-- Server version: 5.7.44-log
-- PHP Version: 8.2.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ebd_streetcar_652278`
--

-- --------------------------------------------------------

--
-- Table structure for table `bga_globals`
--

--
-- Truncate table before insert `bga_globals`
--

TRUNCATE TABLE `bga_globals`;
--
-- Dumping data for table `bga_globals`
--

INSERT INTO `bga_globals` (`name`, `value`) VALUES
('curDie', 'null'),
('curDieIdx', 'null'),
('curTrainDestinationsSelection', 'null'),
('gameProgression', '75'),
('routesToNextStation', 'null'),
('stackIndex', '62');

-- --------------------------------------------------------

--
-- Table structure for table `bga_user_preferences`
--

--
-- Truncate table before insert `bga_user_preferences`
--

TRUNCATE TABLE `bga_user_preferences`;
--
-- Dumping data for table `bga_user_preferences`
--

INSERT INTO `bga_user_preferences` (`pgp_player`, `pgp_preference_id`, `pgp_value`) VALUES
(2383264, 200, 0),
(2383265, 200, 0),
(2383266, 200, 0);

-- --------------------------------------------------------

--
-- Table structure for table `board`
--

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
(1, 6, '[]', NULL, 0, 0),
(1, 7, '[]', NULL, 0, 0),
(1, 8, '[]', NULL, 0, 0),
(1, 9, '[]', NULL, 0, 0),
(1, 10, '[]', NULL, 0, 0),
(1, 11, 'EW', NULL, 0, 0),
(1, 12, '[]', NULL, 0, 0),
(1, 13, 'X', NULL, 0, 0),
(2, 0, 'ES', NULL, 1, 270),
(2, 1, '[]', NULL, 0, 0),
(2, 2, '[]', NULL, 0, 0),
(2, 3, 'ES', NULL, 1, 270),
(2, 4, 'SN', NULL, 0, 90),
(2, 5, 'NS', 'G', 0, 270),
(2, 6, 'NE', NULL, 1, 180),
(2, 7, '[]', NULL, 0, 0),
(2, 8, '[]', NULL, 0, 0),
(2, 9, '[]', NULL, 0, 0),
(2, 10, '[]', NULL, 0, 0),
(2, 11, 'EW', NULL, 0, 0),
(2, 12, '[]', NULL, 0, 0),
(2, 13, 'NE', NULL, 1, 180),
(3, 0, 'SW', NULL, 1, 0),
(3, 1, '[]', NULL, 0, 0),
(3, 2, '[]', NULL, 0, 0),
(3, 3, 'EW', NULL, 0, 0),
(3, 4, '[]', NULL, 0, 0),
(3, 5, '[]', NULL, 0, 0),
(3, 6, 'SW', NULL, 1, 0),
(3, 7, 'SN', 'M', 0, 90),
(3, 8, 'NESW', NULL, 5, 0),
(3, 9, '[]', NULL, 0, 0),
(3, 10, 'WES', NULL, 2, 270),
(3, 11, 'NESW', NULL, 8, 0),
(3, 12, 'SN', NULL, 0, 90),
(3, 13, 'NW', NULL, 1, 90),
(4, 0, 'X', NULL, 0, 0),
(4, 1, '[]', NULL, 0, 0),
(4, 2, '[]', NULL, 0, 0),
(4, 3, 'WES', 'H', 2, 270),
(4, 4, 'NE', NULL, 1, 180),
(4, 5, '[]', NULL, 0, 0),
(4, 6, '[]', NULL, 0, 0),
(4, 7, '[]', NULL, 0, 0),
(4, 8, 'ESW', NULL, 3, 90),
(4, 9, '[]', NULL, 0, 0),
(4, 10, 'EW', NULL, 0, 0),
(4, 11, 'WE', NULL, 0, 180),
(4, 12, '[]', NULL, 0, 0),
(4, 13, 'X', NULL, 0, 0),
(5, 0, 'X', NULL, 0, 0),
(5, 1, 'ES', NULL, 1, 270),
(5, 2, 'ESN', NULL, 6, 90),
(5, 3, 'SWNE', NULL, 7, 180),
(5, 4, 'WN', 'I', 1, 90),
(5, 5, '[]', NULL, 0, 0),
(5, 6, '[]', NULL, 0, 0),
(5, 7, '[]', NULL, 0, 0),
(5, 8, 'EWN', NULL, 2, 90),
(5, 9, '[]', NULL, 0, 0),
(5, 10, 'NESW', NULL, 5, 0),
(5, 11, 'WNE', 'E', 3, 270),
(5, 12, '[]', NULL, 0, 0),
(5, 13, 'X', NULL, 0, 0),
(6, 0, 'ES', NULL, 1, 270),
(6, 1, 'WN', NULL, 1, 90),
(6, 2, 'WES', NULL, 2, 270),
(6, 3, 'EWN', NULL, 2, 90),
(6, 4, '[]', NULL, 0, 0),
(6, 5, '[]', NULL, 0, 0),
(6, 6, '[]', NULL, 0, 0),
(6, 7, '[]', NULL, 0, 0),
(6, 8, 'NESW', NULL, 5, 0),
(6, 9, 'NSW', 'L', 2, 0),
(6, 10, 'NEW', NULL, 4, 0),
(6, 11, 'EW', NULL, 0, 0),
(6, 12, '[]', NULL, 0, 0),
(6, 13, 'NE', NULL, 1, 180),
(7, 0, 'SW', NULL, 1, 0),
(7, 1, '[]', NULL, 0, 0),
(7, 2, 'EW', NULL, 0, 0),
(7, 3, 'SW', NULL, 1, 0),
(7, 4, 'NE', NULL, 1, 180),
(7, 5, '[]', NULL, 0, 0),
(7, 6, '[]', NULL, 0, 0),
(7, 7, '[]', NULL, 0, 0),
(7, 8, '[]', NULL, 0, 0),
(7, 9, '[]', NULL, 0, 0),
(7, 10, 'SWE', NULL, 4, 180),
(7, 11, 'NESW', NULL, 8, 0),
(7, 12, 'NESW', NULL, 8, 0),
(7, 13, 'NW', NULL, 1, 90),
(8, 0, 'X', NULL, 0, 0),
(8, 1, '[]', NULL, 0, 0),
(8, 2, 'WES', 'A', 2, 270),
(8, 3, 'SN', NULL, 0, 90),
(8, 4, 'NESW', NULL, 7, 0),
(8, 5, 'NESW', NULL, 8, 0),
(8, 6, '[]', NULL, 0, 0),
(8, 7, '[]', NULL, 0, 0),
(8, 8, '[]', NULL, 0, 0),
(8, 9, '[]', NULL, 0, 0),
(8, 10, 'SWE', NULL, 4, 180),
(8, 11, 'WNS', NULL, 6, 270),
(8, 12, '[]', NULL, 0, 0),
(8, 13, 'X', NULL, 0, 0),
(9, 0, 'X', NULL, 0, 0),
(9, 1, '[]', NULL, 0, 0),
(9, 2, 'EW', NULL, 0, 0),
(9, 3, '[]', NULL, 0, 0),
(9, 4, 'SW', NULL, 1, 0),
(9, 5, 'WNE', NULL, 3, 270),
(9, 6, '[]', NULL, 0, 0),
(9, 7, '[]', NULL, 0, 0),
(9, 8, 'ES', NULL, 1, 270),
(9, 9, '[]', NULL, 0, 0),
(9, 10, 'EW', NULL, 0, 0),
(9, 11, '[]', NULL, 0, 0),
(9, 12, 'EW', 'D', 0, 0),
(9, 13, 'X', NULL, 0, 0),
(10, 0, 'ES', NULL, 1, 270),
(10, 1, 'SN', NULL, 0, 90),
(10, 2, 'WNES', NULL, 10, 270),
(10, 3, '[]', NULL, 0, 0),
(10, 4, '[]', NULL, 0, 0),
(10, 5, 'WNS', NULL, 4, 270),
(10, 6, 'ESN', 'K', 6, 90),
(10, 7, 'NESW', NULL, 9, 0),
(10, 8, 'WNES', NULL, 7, 270),
(10, 9, '[]', NULL, 0, 0),
(10, 10, 'SW', NULL, 1, 0),
(10, 11, 'SN', NULL, 0, 90),
(10, 12, 'ESWN', NULL, 7, 90),
(10, 13, 'NE', NULL, 1, 180),
(11, 0, 'SW', NULL, 1, 0),
(11, 1, '[]', NULL, 0, 0),
(11, 2, 'EW', NULL, 0, 0),
(11, 3, '[]', NULL, 0, 0),
(11, 4, '[]', NULL, 0, 0),
(11, 5, '[]', NULL, 0, 0),
(11, 6, 'EWN', NULL, 2, 90),
(11, 7, '[]', NULL, 0, 0),
(11, 8, '[]', NULL, 0, 0),
(11, 9, '[]', NULL, 0, 0),
(11, 10, '[]', NULL, 0, 0),
(11, 11, '[]', NULL, 0, 0),
(11, 12, '[]', NULL, 0, 0),
(11, 13, 'NW', NULL, 1, 90),
(12, 0, 'X', NULL, 0, 0),
(12, 1, '[]', NULL, 0, 0),
(12, 2, '[]', NULL, 0, 0),
(12, 3, '[]', NULL, 0, 0),
(12, 4, '[]', NULL, 0, 0),
(12, 5, '[]', NULL, 0, 0),
(12, 6, 'EW', NULL, 0, 0),
(12, 7, '[]', NULL, 0, 0),
(12, 8, '[]', NULL, 0, 0),
(12, 9, '[]', NULL, 0, 0),
(12, 10, '[]', NULL, 0, 0),
(12, 11, 'EWN', NULL, 2, 90),
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

-- --------------------------------------------------------


-- --------------------------------------------------------

--
-- Table structure for table `global`
--

--
-- Truncate table before insert `global`
--

TRUNCATE TABLE `global`;
--
-- Dumping data for table `global`
--

INSERT INTO `global` (`global_id`, `global_value`) VALUES
(0, 1734288354),
(1, 12),
(2, 2383265),
(3, 81),
(4, 11507),
(5, 2383264),
(6, 38),
(7, 50),
(8, 180),
(9, 40),
(200, 1),
(201, 0),
(300, 999999999),
(301, 0),
(302, 0),
(304, 0),
(305, 0),
(306, 0);

-- --------------------------------------------------------


--
-- Truncate table before insert `player`
--

TRUNCATE TABLE `player`;
--
-- Dumping data for table `player`
--

INSERT INTO `player` (`player_no`, `player_id`, `player_canal`, `player_name`, `player_avatar`, `player_color`, `player_score`, `player_score_aux`, `player_zombie`, `player_ai`, `player_eliminated`, `player_next_notif_no`, `player_enter_game`, `player_over_time`, `player_is_multiactive`, `player_start_reflexion_time`, `player_remaining_reflexion_time`, `player_beginner`, `player_state`, `available_cards`, `linenum`, `goals`, `goalsfinished`, `trainposition`, `traindirection`, `endnodeids`, `laststopnodeid`, `dice`, `diceused`, `lasttileplacementinformation`) VALUES
(1, 2383264, '31bac6bf31d1002a510431313854b136', 'FindYodaWinCash0', '000000', '773300', 0, 0, 0, 0, 0, 1, 1, 1, 0, NULL, 13, NULL, NULL, '[2,0,3,1,0]', 5, '[\"E\",\"H\",\"K\"]', '[]', NULL, NULL, NULL, NULL, NULL, 0, '[{\"card\":\"1\",\"rotation\":\"180\",\"ownerID\":\"2383264\",\"destination\":\"square_7_4\",\"numFromStack\":0},{\"card\":\"1\",\"rotation\":\"0\",\"ownerID\":\"2383264\",\"destination\":\"square_9_4\",\"numFromStack\":2}]'),
(2, 2383265, '19824e1dbea145533f82526826927c5b', 'FindYodaWinCash1', '000000', 'ff0000', 0, 0, 0, 0, 0, 1, 1, 1, 0, '2024-12-15 20:45:54', -75, NULL, NULL, '[5,4,0,1]', 2, '[\"G\",\"H\",\"L\"]', '[]', '10_11_S', 'N', '[\"6_0_S\",\"7_0_S\"]', '10_13_E', '[2,6]', 1, NULL),
(3, 2383266, '2749d11deef5bb9ec238ccba01b2eda2', 'FindYodaWinCash2', '000000', '008000', 0, 0, 0, 0, 0, 1, 1, 0, 0, NULL, 71, NULL, NULL, '[2,1,1,4,1]', 3, '[\"D\",\"H\",\"I\"]', '[]', NULL, NULL, NULL, NULL, NULL, 0, '[{\"card\":\"0\",\"rotation\":\"0\",\"ownerID\":\"2383266\",\"destination\":\"square_4_10\",\"numFromStack\":0},{\"card\":\"0\",\"rotation\":\"0\",\"ownerID\":\"2383266\",\"destination\":\"square_9_10\",\"numFromStack\":2}]');

-- --------------------------------------------------------

--
-- Table structure for table `stack`
--

--
-- Truncate table before insert `stack`
--

TRUNCATE TABLE `stack`;
--
-- Dumping data for table `stack`
--

INSERT INTO `stack` (`id`, `card`) VALUES
(62, 4),
(63, 2),
(64, 11),
(65, 10),
(66, 5),
(67, 4),
(68, 10),
(69, 9),
(70, 0),
(71, 9),
(72, 5),
(73, 9),
(74, 3),
(75, 1),
(76, 0),
(77, 1),
(78, 0),
(79, 3),
(80, 4),
(81, 5),
(82, 6),
(83, 3),
(84, 1),
(85, 0),
(86, 6),
(87, 3),
(88, 9),
(89, 11),
(90, 4),
(91, 0),
(92, 2),
(93, 8),
(94, 1),
(95, 0),
(96, 0),
(97, 3),
(98, 0),
(99, 6),
(100, 1),
(101, 1),
(102, 1),
(103, 5),
(104, 1),
(105, 0),
(106, 1),
(107, 0),
(108, 0),
(109, 1),
(110, 3),
(111, 3),
(112, 6),
(113, 7),
(114, 4),
(115, 4),
(116, 1),
(117, 7),
(118, 1),
(119, 7),
(120, 6),
(121, 11),
(122, 7),
(123, 3),
(124, 3);

--
-- Indexes for dumped tables
--

