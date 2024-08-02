<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Streetcar implementation : © <Your name here> <Your email address here>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * Streetcar game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */
$this->tracks = array(
  array(
    array(
      "N" => "",
      "E" => "W",
      "S" => "",
      "W" => "E",
    ),
    array(
      "N" => "S",
      "E" => "",
      "S" => "N",
      "W" => "",
    ),
    array(
      "N" => "",
      "E" => "W",
      "S" => "",
      "W" => "E",
    ),
    array(
      "N" => "S",
      "E" => "",
      "S" => "N",
      "W" => "",
    ),
  ),
  array(
    array(
      "N" => "",
      "E" => "",
      "S" => "W",
      "W" => "S",
    ),
    array(
      "N" => "W",
      "E" => "",
      "S" => "",
      "W" => "N",
    ),
    array(
      "N" => "E",
      "E" => "N",
      "S" => "",
      "W" => "",
    ),
    array(
      "N" => "",
      "E" => "S",
      "S" => "E",
      "W" => "",
    ),
  ),
  array(
    array(
      "N" => "S",
      "E" => "",
      "S" => "NW",
      "W" => "S",
    ),
    array(
      "N" => "W",
      "E" => "W",
      "S" => "",
      "W" => "NE",
    ),
    array(
      "N" => "SE",
      "E" => "N",
      "S" => "N",
      "W" => "",
    ),
    array(
      "N" => "",
      "E" => "SW",
      "S" => "E",
      "W" => "E",
    ),
  ),
  array(
    array(
      "N" => "S",
      "E" => "S",
      "S" => "NE",
      "W" => "",
    ),
    array(
      "N" => "",
      "E" => "W",
      "S" => "W",
      "W" => "ES",
    ),
    array(
      "N" => "SW",
      "E" => "",
      "S" => "N",
      "W" => "N",
    ),
    array(
      "N" => "E",
      "E" => "NW",
      "S" => "",
      "W" => "E",
    ),

  ),
  array(
    array(
      "N" => "EW",
      "E" => "N",
      "S" => "",
      "W" => "N",
    ),
    array(
      "N" => "E",
      "E" => "NS",
      "S" => "E",
      "W" => "",
    ),
    array(
      "N" => "",
      "E" => "S",
      "S" => "EW",
      "W" => "S",
    ),
    array(
      "N" => "W",
      "E" => "",
      "S" => "W",
      "W" => "NS",
    ),

  ),
  array(
    array(
      "N" => "E",
      "E" => "N",
      "S" => "W",
      "W" => "S",
    ),
    array(
      "N" => "W",
      "E" => "S",
      "S" => "E",
      "W" => "N",
    ),
    array(
      "N" => "E",
      "E" => "N",
      "S" => "W",
      "W" => "S",
    ),

    array(
      "N" => "W",
      "E" => "S",
      "S" => "E",
      "W" => "N",
    ),
  ),
  array(
    array(
      "N" => "EW",
      "E" => "NW",
      "S" => "",
      "W" => "NE",
    ),
    array(
      "N" => "ES",
      "E" => "NS",
      "S" => "NE",
      "W" => "",
    ),
    array(
      "N" => "",
      "E" => "SW",
      "S" => "EW",
      "W" => "ES",
    ),
    array(
      "N" => "SW",
      "E" => "",
      "S" => "NW",
      "W" => "NS",
    ),
  ),
  array(
    array(
      "N" => "E",
      "E" => "NSW",
      "S" => "E",
      "W" => "E",
    ),
    array(
      "N" => "S",
      "E" => "S",
      "S" => "NEW",
      "W" => "S",
    ),
    array(
      "N" => "W",
      "E" => "W",
      "S" => "W",
      "W" => "NES",
    ),
    array(
      "N" => "ESW",
      "E" => "N",
      "S" => "N",
      "W" => "N",
    ),
  ),
  array(
    array(
      "N" => "EW",
      "E" => "NS",
      "S" => "EW",
      "W" => "NS",
    ),
    array(
      "N" => "EW",
      "E" => "NS",
      "S" => "EW",
      "W" => "NS",
    ),
    array(
      "N" => "EW",
      "E" => "NS",
      "S" => "EW",
      "W" => "NS",
    ),
    array(
      "N" => "EW",
      "E" => "NS",
      "S" => "EW",
      "W" => "NS",
    ),

  ),
  array(
    array(
      "N" => "S",
      "E" => "W",
      "S" => "N",
      "W" => "E",
    ),
    array(
      "N" => "S",
      "E" => "W",
      "S" => "N",
      "W" => "E",
    ),
    array(
      "N" => "S",
      "E" => "W",
      "S" => "N",
      "W" => "E",
    ),
    array(
      "N" => "S",
      "E" => "W",
      "S" => "N",
      "W" => "E",
    ),

  ),
  array(
    array(
      "N" => "ES",
      "E" => "N",
      "S" => "Nw",
      "W" => "S",
    ),
    array(
      "N" => "W",
      "E" => "SW",
      "S" => "W",
      "W" => "NE",
    ),
    array(
      "N" => "ES",
      "E" => "N",
      "S" => "Nw",
      "W" => "S",
    ),
    array(
      "N" => "W",
      "E" => "SW",
      "S" => "W",
      "W" => "NE",
    ),
  ),
  array(
    array(
      "N" => "SW",
      "E" => "S",
      "S" => "NE",
      "W" => "N",
    ),
    array(
      "N" => "E",
      "E" => "NW",
      "S" => "W",
      "W" => "ES",
    ),
    array(
      "N" => "SW",
      "E" => "S",
      "S" => "NE",
      "W" => "N",
    ),
    array(
      "N" => "E",
      "E" => "NW",
      "S" => "W",
      "W" => "ES",
    ),
  )
);
$this->locations = array(
  array(
    "row" => 1,
    "col" => 8,
    "building" => 1,
    "name" => _("Automaker"),
    "code" => "A"
  ),
  array(
    "row" => 2,
    "col" => 4,
    "building" => 1,
    "name" => _("Hospital"),
    "code" => "H"
  ),
  array(
    "row" => 4,
    "col" => 6,
    "building" => 1,
    "name" => _("Ice cream parlor"),
    "code" => "I"
  ),
  array(
    "row" => 4,
    "col" => 11,
    "building" => 1,
    "name" => _("Brewery"),
    "code" => "B"
  ),
  array(
    "row" => 5,
    "col" => 1,
    "building" => 1,
    "name" => _("Gardens"),
    "code" => "G"
  ),
  array(
    "row" => 6,
    "col" => 9,
    "building" => 1,
    "name" => _("Kindergarden"),
    "code" => "K"
  ),
  array(
    "row" => 7,
    "col" => 4,
    "building" => 1,
    "name" => _("Museum"),
    "code" => "M"
  ),
  array(
    "row" => 8,
    "col" => 12,
    "building" => 1,
    "name" => _("Cathedral"),
    "code" => "C"
  ),
  array(
    "row" => 9,
    "col" => 2,
    "building" => 1,
    "name" => _("Fire station"),
    "code" => "F"
  ),
  array(
    "row" => 9,
    "col" => 7,
    "building" => 1,
    "name" => _("Library"),
    "code" => "L"
  ),
  array(
    "row" => 11,
    "col" => 9,
    "building" => 1,
    "name" => _("Department store"),
    "code" => "D"
  ),
  array(
    "row" => 12,
    "col" => 5,
    "building" => 1,
    "name" => _("Exhibition"),
    "code" => "E"
  ),
);
$this->goals  = array(
  array(
    array("B", "I"),
    array("B", "M"),
    array("D", "M"),
    array("E", "I"),
    array("B", "H"),
    array("F", "I")
  ),
  array(
    array("C", "M"),
    array("F", "L"),
    array("H", "K"),
    array("E", "K"),
    array("D", "I"),
    array("B", "L")
  ),
  array(
    array("C", "I"),
    array("G", "K"),
    array("E", "G"),
    array("C", "H"),
    array("H", "M"),
    array("A", "G")
  ),
  array(
    array("A", "F"),
    array("G", "L"),
    array("C", "F"),
    array("D", "F"),
    array("A", "L"),
    array("C", "E")
  ),
  array(
    array("B", "D"),
    array("B", "E"),
    array("B", "G"),
    array("H", "L"),
    array("A", "M"),
    array("A", "D")
  ),
  array(
    array("F", "K"),
    array("F", "H"),
    array("A", "C"),
    array("D", "K"),
    array("D", "G"),
    array("E", "H")
  ),
  array(
    array("C", "D", "I"),
    array("B", "D", "M"),
    array("G", "K", "L"),
    array("E", "F", "K"),
    array("E", "H", "K"),
    array("A", "L", "M")
  ),
  array(
    array("F", "H", "K"),
    array("C", "F", "I"),
    array("G", "L", "M"),
    array("B", "H", "L"),
    array("D", "I", "M"),
    array("B", "F", "I")
  ),
  array(
    array("B", "G", "L"),
    array("B", "L", "M"),
    array("C", "I", "M"),
    array("A", "D", "M"),
    array("A", "G", "K"),
    array("B", "F", "M")
  ),
  array(
    array("F", "I", "K"),
    array("E", "G", "I"),
    array("D", "H", "K"),
    array("H", "K", "L"),
    array("A", "E", "L"),
    array("A", "B", "L")
  ),
  array(
    array("A", "C", "L"),
    array("C", "G", "K"),
    array("D", "H", "I"),
    array("C", "E", "M"),
    array("A", "B", "M"),
    array("E", "I", "K")
  ),
  array(
    array("C", "K", "M"),
    array("G", "H", "L"),
    array("C", "D", "M"),
    array("A", "E", "I"),
    array("D", "F", "I"),
    array("E", "K", "L")
  ),



);
$this->routepoints = array(
  array(
    'start' => [[7, 13]],
    'end' => [[2, 0]]
  ),
  array(
    'start' => [[11, 13]],
    'end' => [[6, 0]]
  ),
  array(
    'start' => [[3, 13]],
    'end' => [[10, 0]]
  ),
  array(
    'start' => [[0, 7]],
    'end' => [[13, 2]]
  ),
  array(
    'start' => [[0, 11]],
    'end' => [[13, 6]]
  ),
  array(
    'start' => [[0, 3]],
    'end' => [[13, 10]]
  ),
);
