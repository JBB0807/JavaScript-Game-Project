"use strict";

import {gameBoardEventHandler} from './gameBoardEventHandler.js';
import {getXPosition, getYPosition, removeObject} from './utils.js'
import { SpaceShip,Player, Enemy, Drone, Ammo } from './objects.js';

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
    diffifucltyIndex: 1,
    isRunning: false,
    activeScreen: null,
    domReference: $("#screen-play"),
  
    init() {
      this.switchScreen("#screen-main");
      this.adjustDifficulty(0);
    },
  
    startGame() {
      this.playerName = $("#input-player-name").val();
      this.isRunning = true;
      this.score = 0;
      this.addScore(0);
      // console.log(`Game Started: Welcome ${this.playerName}!`);
  
      this.addGameObject("#player-spaceship");
      this.domReference.css('animation-play-state', 'running');
  
      gameBoardEventHandler.activateGameLoop();
      //
    },
  
    pauseGame() {
      this.isRunning = false;
      this.domReference.css('animation-play-state', 'paused');
      console.log(`Game Paused`);
    },
  
    resumeGame() {
      this.isRunning = true;
      console.log(`Game Resumed`);
    },
  
    quitGame() {
      gameBoard.domReference.clear();
      this.isRunning = false;
      console.log(`Game Quit`);
    },
  
    adjustDifficulty(intPlusMinus) {
      this.diffifucltyIndex += intPlusMinus;
      if (this.diffifucltyIndex < 0) {
        this.diffifucltyIndex = this.difficultyOptions.length - 1;
      } else if (
        this.diffifucltyIndex >= this.difficultyOptions.length
      ) {
        this.diffifucltyIndex = 0;
      }
  
      $("#difficulty-level-display").text(
        this.difficultyOptions[this.diffifucltyIndex]
      );
    },

    addScore(score){
      this.score += score;
      $("#div-score").text(this.score);
    },
  
    addGameObject(elementID, xPostiion, yPosition) {
      if (elementID === "#player-spaceship") {
        this.objPlayer = new Player();
      } else if (elementID === "#drone-spaceship") {
        this.arrEnemies.push(new Drone());
      }
    },

    cleanupPlayScreen(){
      this.objPlayer = null,
      this.arrProps.splice(0, this.arrProps.length),
      this.arrEnemies.splice(0, this.arrEnemies.length),
      this.arrObstacles.splice(0, this.arrObstacles.length),
      this.playerAmmo.splice(0, this.playerAmmo.length),
      this.enemyAmmo.splice(0, this.enemyAmmo.length),

      $("#screen-play")
          .children()
          .each(function () {
            // Removes each child element
            $(this).remove();
          });
    },
  
    switchScreen(screenID) {
      if (screenID !== "#screen-pause") {
        $(".div-screen").hide();
      }

      //perform cleanup of play screen when going to main screen
      if (screenID === "#screen-main" || screenID === "#screen-game-over") {
        this.cleanupPlayScreen();
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
  };