"use strict";

const gameBoard = {
  playerName: null,
  scrore: null,
  difficultyOptions: ["Easy", "Normal", "Hard"],
  diffifucltyIndex: 1,
  props: [],
  isRunning: false,
  keyframe: null,
  targetFrameRate: 1000 / 144,
  requestAnimationFrameID: null,
  activeScreen: null,

  init() {
    this.switchScreen("#screen-main");
    this.adjustDifficulty(0)
  },

  startGame() {
    this.playerName = $("#input-player-name").val();
    this.isRunning = true;
    console.log(`Game Started: Welcome ${this.playerName}!`);
  },

  pauseGame() {
    this.isRunning = false;
    console.log(`Game Paused`);
  },

  resumeGame(){
    this.isRunning = true;
    console.log(`Game Resumed`);
  },

  adjustDifficulty(intPlusMinus) {
    this.diffifucltyIndex += intPlusMinus;
    if (this.diffifucltyIndex < 0) {
      this.diffifucltyIndex = this.difficultyOptions.length - 1;
    } else if (this.diffifucltyIndex >= this.difficultyOptions.length) {
      this.diffifucltyIndex = 0;
    }

    $("#difficulty-level-display").text(
      this.difficultyOptions[this.diffifucltyIndex]
    );
  },

  switchScreen(screenID) {
    if (screenID !== "#screen-pause") {
      $(".div-screen").hide();
    }
    $(screenID).show();
    this.activeScreen = screenID;
  },
};

$(document).ready(function () {
  gameBoard.init();
  setupListeners();
});

function setupListeners() {
  //
  //on click listener for all menu items that will trigger a screen to change
  $(".div-screen-select").on("click", function () {
    var elementId = $(this).attr("id");
    if ($(this).hasClass("switch-screen-play")) {
      console.log("Switch to play screen");
      gameBoard.switchScreen("#screen-play");
        if(elementId === "menu-start-game") {
            gameBoard.startGame();
        } else if (elementId === "menu-resume") {
            gameBoard.resumeGame();
        }
    } else if ($(this).hasClass("switch-screen-main")) {
      console.log("Switch to main screen");
      gameBoard.switchScreen("#screen-main");
    } else if ($(this).hasClass("switch-screen-pause")) {
      console.log("Switch to pause screen");
      gameBoard.pauseGame();
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
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
