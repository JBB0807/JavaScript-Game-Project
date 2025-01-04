"use strict";

import { gameBoardEventHandler } from "./gameBoardEventHandler.js";
import { getXPosition, getYPosition, removeObject } from "./utils.js";
import { SpaceShip, Player, Enemy, Drone, Ammo } from "./objects.js";
import {playBGSound, stopAudio, fetchAudioSources, pauseAudio} from "./soundManager.js";

export const gameBoard = {
  playerName: null,
  objPlayer: null,
  arrProps: [],
  arrEnemies: [],
  arrObstacles: [],
  playerAmmo: [],
  enemyAmmo: [],

  score: null,
  difficultyOptions: ["Easy", "Normal", "Hard"],
  diffifucltyIndex: 1, //defaults to Normal
  isRunning: false,
  activeScreen: null,
  domReference: $("#div-game-board"),

  init() {
    this.switchScreen("#screen-loading");
    fetchAudioSources();
    this.switchScreen("#screen-main");
    this.adjustDifficulty(0);
  },

  getDifficultyMultiplier(){
    //return a diffuclty multiplier by exponential increase per index(0,1,2)  , 1 = easy), 2 = easy, 4 = hard
    return Math.pow(2, this.diffifucltyIndex);
  },

  startGame() {
    console.log("Start game");
    $("#player-name").text(this.playerName);
    this.score = 0;
    this.addScore(0);
    this.addGameObject("#player-spaceship");

    this.resumeGame()

    playBGSound();
  },

  resumeGame() {
    this.isRunning = true;
    this.domReference.css("animation-play-state", "running");
    $(".ammo").css("animation-play-state", "running");
    $(".enemy").css("animation-play-state", "running");
    gameBoardEventHandler.activateGameLoop();
    console.log(`Game Resumed`);
  },

  pauseGame() {
    pauseAudio();
    this.domReference.css("animation-play-state", "paused");
    $(".ammo").css("animation-play-state", "paused");
    $(".enemy").css("animation-play-state", "paused");
    this.isRunning = false;
    gameBoardEventHandler.deactivateGameLoop();
    gameBoardEventHandler.clearKeys();
    console.log(`Game Paused`);
  },

  quitGame() {
    stopAudio();
    this.isRunning = false;
    gameBoardEventHandler.deactivateGameLoop();
    gameBoardEventHandler.clearKeys();
    console.log(`Game Quit`);
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

  addScore(score) {
    this.score += score;
    $("#div-score").text(this.score);
  },

  addGameObject(elementID, xPostiion, yPosition) {
    if (elementID === "#player-spaceship") {
      this.objPlayer = new Player();
    } else if (elementID === "#drone-container") {
      this.arrEnemies.push(new Drone());
    }
  },

  cleanupPlayScreen() {
    (this.objPlayer = null),
      this.arrProps.splice(0, this.arrProps.length),
      this.arrEnemies.splice(0, this.arrEnemies.length),
      this.arrObstacles.splice(0, this.arrObstacles.length),
      this.playerAmmo.splice(0, this.playerAmmo.length),
      this.enemyAmmo.splice(0, this.enemyAmmo.length),
      $(this.domReference)
        .children()
        .each(function () {
          // Removes each child element
          $(this).remove();
        });
  },

  switchScreen(screenID) {
    if (screenID === "#screen-pause") {
      this.pauseGame();
    } else {

      if (screenID === "#screen-play") {
        if (this.activeScreen === "#screen-pause") {
          this.resumeGame();
        } else if (this.activeScreen === "#screen-main") {
          //validation of user name
          this.playerName = $("#input-player-name").val();
          if(this.playerName !== "") {
            this.startGame();
          } else {
            $("#modal-name-alert").modal("show");
            return;
          }
        } else if(this.activeScreen === "#screen-game-over"){
          this.startGame();
        }
      }

      //perform cleanup of play screen when going to main screen or the game over
      if ((this.activeScreen === "#screen-pause" && screenID === "#screen-main") || screenID === "#screen-game-over") {
        this.cleanupPlayScreen();
        this.quitGame();
      }

      $(".div-screen").hide();
    }

    $(screenID).show();
    this.activeScreen = screenID;
    this.updateHeader();
  },

  updateHeader() {
    $(".div-header-item").hide();
    $("#header-item-sound").show();

    if (this.activeScreen === "#screen-credits") {
      return;
    }

    if (this.activeScreen === "#screen-main") {
      $("#header-item-credits").show();
    } else {
      $("#header-item-score").show();
      if (this.activeScreen === "#screen-play") {
        $("#header-item-pause").show();
      }
    }

    if (
      this.activeScreen === "#screen-main" ||
      this.activeScreen === "#screen-pause"
    ) {
      $("#header-item-help").show();
    }
  },

  removeIfOutside(arrOjb) {
    arrOjb.forEach((obj) => {
      if (
        this.domReference.width() < Math.abs(getXPosition(obj)) ||
        this.domReference.height() < Math.abs(getYPosition(obj)) ||
        getYPosition(obj) < 0
      ) {
        removeObject(obj, arrOjb);
      }
    });
  },

  showHelp() {
    $('#modal-help').modal('show');
  }
};
