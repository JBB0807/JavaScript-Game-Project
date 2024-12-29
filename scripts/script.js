"use strict";

import {gameBoard} from './gameboard.js';
import {gameBoardEventHandler} from './gameBoardEventHandler.js';
import {startAudio} from "./soundManager.js"


$(document).ready(function () {
  gameBoard.init();
  setupListeners();
});

//
//Listeners
function setupListeners() {
  //
  //on click listener for all menu items that will trigger a screen to change
  $(".div-screen-select").on("click", function () {    
    var elementId = $(this).attr("id");
    
    startAudio();
    if ($(this).hasClass("switch-screen-play")) {
      console.log("Switch to play screen");
      gameBoard.switchScreen("#screen-play");
    } else if ($(this).hasClass("switch-screen-main")) {
      console.log("Switch to main screen");
      gameBoard.switchScreen("#screen-main");
    } else if ($(this).hasClass("switch-screen-pause")) {
      console.log("Switch to pause screen");
      gameBoard.switchScreen("#screen-pause");
    } else if ($(this).hasClass("switch-screen-credits")) {
      console.log("Switch to credits screen");
      gameBoard.switchScreen("#screen-credits");
    }
  });

  $("#difficulty-adjust-right").on("click", function () {
    gameBoard.adjustDifficulty(1);
  });

  $("#difficulty-adjust-left").on("click", function () {
    gameBoard.adjustDifficulty(-1);
  });

  //
  //Keyboard Press/Release Listeners
  $(document).keydown(function (event) {
    gameBoardEventHandler.registerKeyPress(event.key);
  });

  $(document).keyup(function (event) {
    gameBoardEventHandler.registerKeyRelease(event.key);
  });
}

//
//Constants and DOM References