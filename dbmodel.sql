
-- ------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- LineNumberOne implementation : © David Felcan dfelcan@gmail.com, Stefan van der Heijden axecrazy@gmail.com
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

-- CREATE TABLE IF NOT EXISTS `card` (
--   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
--   `card_type` varchar(16) NOT NULL,
--   `card_type_arg` int(11) NOT NULL,
--   `card_location` varchar(16) NOT NULL,
--   `card_location_arg` int(11) NOT NULL,
--   PRIMARY KEY (`card_id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

CREATE TABLE IF NOT EXISTS `board` (
  `board_x` smallint(5) unsigned NOT NULL,
  `board_y` smallint(5) unsigned NOT NULL,
  `directions_free` varchar(64)  DEFAULT NULL,
  `stop` varchar(5)  DEFAULT NULL,
  `card` smallint(16) unsigned NOT NULL,
  `rotation` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`board_x`,`board_y`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `stack` (
  `id` smallint(16) unsigned NOT NULL,
  `card` smallint(16) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `player` ADD `available_cards` VARCHAR(255) NOT NULL;
ALTER TABLE `player` ADD `linenum` smallint(5) unsigned NOT NULL;
ALTER TABLE `player` ADD `goals` varchar(255) NOT NULL;
ALTER TABLE `player` ADD `goalsfinished` VARCHAR(255) NOT NULL;

ALTER TABLE `player` ADD `trainposition` VARCHAR(10) DEFAULT NULL;
ALTER TABLE `player` ADD `traindirection` VARCHAR(1) DEFAULT NULL;
ALTER TABLE `player` ADD `endnodeids` VARCHAR(32) DEFAULT NULL;
ALTER TABLE `player` ADD `laststopnodeid` VARCHAR(16) DEFAULT NULL;
ALTER TABLE `player` ADD `dice` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `player` ADD `diceused` smallint(5) unsigned NOT NULL;
ALTER TABLE `player` ADD `lasttileplacementlocation` VARCHAR(20) DEFAULT NULL;