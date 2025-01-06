"use strict";

import { gameBoardEventHandler } from "./gameBoardEventHandler.js";
import { getXPosition, getYPosition, removeObject } from "./utils.js";
import { SpaceShip, Player, Enemy, Drone, Ammo } from "./objects.js";
import {playBGSound, stopAudio, fetchAudioSources, pauseAudio} from "./soundManager.js";
import { stageManager } from "./stageManager.js";

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

  getDifficultyMultiplier() {
    //return a diffuclty multiplier by exponential increase per index(0,1,2)  , 1 = easy), 2 = easy, 4 = hard
    return Math.pow(2, this.diffifucltyIndex);
  },

  startGame() {
    console.log("Start game");

    //reset first to make sure everything is clean
    this.resetGame();

    $("#player-name").text(this.playerName);
    this.score = 0;
    this.addScore(0);
    this.addGameObject("#player-spaceship");

    this.resumeGame();

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
    stageManager.pause();
    console.log(`Game Paused`);
  },

  stageCleared(){
    this.quitGame();
    this.switchScreen("#screen-stage-cleared");
    console.log(`Stage Cleaed`);
  },

  quitGame() {
    stopAudio();
    this.isRunning = false;
    this.resetGame();
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

  addGameObject(elementID, isPartOfSwarm, xPostiion, yPosition) {
    let object;
    if (elementID === "#player-spaceship") {
      object = new Player();
      this.objPlayer = object;
    } else if (elementID === "#drone-container") {
      object = new Drone(isPartOfSwarm, xPostiion, yPosition);
      this.arrEnemies.push(object);
    }

    return object;
  },

  resetGame(){
    gameBoardEventHandler.deactivateGameLoop();
    gameBoardEventHandler.clearKeys();
    this.cleanupPlayScreen();
    stageManager.reset();
  },

  cleanupPlayScreen() {
      this.objPlayer = null,
      this.arrProps.splice(0, this.arrProps.length),
      this.arrEnemies.splice(0, this.arrEnemies.length),
      this.arrObstacles.splice(0, this.arrObstacles.length),
      this.playerAmmo.splice(0, this.playerAmmo.length),
      this.enemyAmmo.splice(0, this.enemyAmmo.length),
      $(this.domReference).empty();
  },

  async switchScreen(screenID) {
    if (screenID === "#screen-pause") {
      this.pauseGame();
    } else {
      if (screenID === "#screen-play") {
        if (this.activeScreen === "#screen-pause") {
          this.resumeGame();
        } else if (this.activeScreen === "#screen-main") {
          //validation of user name
          this.playerName = $("#input-player-name").val();
          if (this.playerName !== "") {
            await this.animateSpaceLaunch();
          } else {
            $("#modal-name-alert").modal("show");
            return;
          }
        } else if (this.activeScreen === "#screen-game-over" || this.activeScreen === "#screen-stage-cleared") {
          this.startGame();
        }
      }

      //perform cleanup of play screen when going to main screen or the game over
      if (screenID === "#screen-main" || screenID === "#screen-game-over") {
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
      $("#header-item-sound").hide();
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
    $("#modal-help").modal("show");
  },

  isSwarmCleared() {
    let clear = true;
    this.arrEnemies.forEach((obj) => {
      if (obj instanceof Drone) {
        if (obj.isPartOfSwarm) {
          clear = false;
        }
      }
    });
    return clear;
  },

  animateSpaceLaunch() {
    console.log("animateSpaceLaunch");
    //remove all listeners first to prevent multiple execution
    $("#main-screen-foreground").off("animationend");

    $("#screen-white-overlay").addClass("animate-white-out");
    $("#main-screen-foreground").addClass("launch-animation");
    $("#main-screen-text-container").addClass("animate-fade");
    $(".div-header").addClass("animate-fade");

    return new Promise((resolve) => {
      $("#main-screen-foreground").on("animationend", function () {
        $("#screen-white-overlay").removeClass("animate-white-out");
        $("#main-screen-foreground").removeClass("launch-animation");
        $("#main-screen-text-container").removeClass("animate-fade");
        $(".div-header").removeClass("animate-fade");
        gameBoard.startGame();
        resolve();
      });
    });
  },
};
