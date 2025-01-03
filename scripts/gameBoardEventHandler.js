"use strict";

import {gameBoard} from './gameboard.js';
import {isOverlapping, removeObject} from './utils.js'
import {stageManager} from './stageManager.js'

export const gameBoardEventHandler = {
    activeKeys: [],
    keyframe: null,
    targetFrameRate: 1000 / 144,
    playerFiringRate: 1000 / 25,
    playerFireKeyFrame: null,
    requestAnimationFrameID: null,
  
    registerKeyPress(key) {
      if (
        gameBoard.isRunning &&
        this.activeKeys.indexOf(key) === -1
      ) {
        this.activeKeys.unshift(key);
      }
      // console.log(`Active kyes: ${this.activeKeys}`);
    },
  
    registerKeyRelease(key) {
      if (gameBoard.isRunning) {
        const index = this.activeKeys.indexOf(key);
        this.activeKeys.splice(index, 1);
        // console.log(`Active kyes: ${this.activeKeys}`);
      }
    },
  
    activateGameLoop() {
      this.requestAnimationFrameID =
        window.requestAnimationFrame(this.checkKeyFrame);
    },
  
    deactivateGameLoop() {
      window.cancelAnimationFrame(this.requestAnimationFrameID);
      this.requestAnimationFrameID = null;
    },
  
    checkKeyFrame: function (highResTimestamp) {
      if (!gameBoard.isRunning) {
        return;
      }

      // if(getGBMusicTime() >= 64.491 && !gameBoardEventHandler.musicLoop){
      //   console.log("Enter first loop");
      //   gameBoardEventHandler.musicLoop = true;
      //   loopFistDrop();
      // }
  
      if (gameBoardEventHandler.keyframe === null) {
        gameBoardEventHandler.keyframe = highResTimestamp;
      }

      stageManager.stageCheck(highResTimestamp); 
  
      if (
        highResTimestamp - gameBoardEventHandler.keyframe >
        gameBoardEventHandler.targetFrameRate
      ) {

        gameBoardEventHandler.updatePlayerMovement(highResTimestamp);
  
        gameBoardEventHandler.firePlayerAmmo(highResTimestamp);
        gameBoardEventHandler.objectCleanup();
        gameBoardEventHandler.detectCollision();
        gameBoardEventHandler.keyframe = highResTimestamp;
      }
  
      gameBoardEventHandler.requestAnimationFrameID =
        window.requestAnimationFrame(gameBoardEventHandler.checkKeyFrame);
    },
  
    updatePlayerMovement(highResTimestamp) {
      let xMovement = 0;
      let yMovement = 0;
  
      this.activeKeys.forEach((key) => {
        if (xMovement === 0) {
          if (key.toUpperCase() === "A" || key === "ArrowLeft") {
            xMovement = 1;
          } else if (key.toUpperCase() === "D" || key === "ArrowRight") {
            xMovement = -1;
          }
        }
  
        if (yMovement === 0) {
          if (key.toUpperCase() === "W" || key === "ArrowUp") {
            yMovement = 1;
          } else if (key.toUpperCase() === "S" || key === "ArrowDown") {
            yMovement = -1;
          }
        }
  
        if (key.toUpperCase() === "X") {
          gameBoard.addGameObject("#drone-container");
        }
      });
  
      if (xMovement !== 0 || yMovement !== 0) {
        gameBoard.objPlayer.updatePosition(
          highResTimestamp,
          this.keyframe,
          xMovement,
          yMovement
        );
      }
    },
  
    firePlayerAmmo(highResTimestamp) {
      if (this.activeKeys.includes(" ")) {
        if (
          highResTimestamp - this.playerFireKeyFrame >
          this.playerFiringRate
        ) {
          gameBoard.objPlayer?.fire();
          if(this.musicLoop){
            this.musicLoop = false;
          }
          this.playerFireKeyFrame = highResTimestamp;
        }
      }
    },
  
    objectCleanup() {
      gameBoard.removeIfOutside(gameBoard.playerAmmo);
      gameBoard.removeIfOutside(gameBoard.enemyAmmo);
      gameBoard.removeIfOutside(gameBoard.arrEnemies);
    },
  
    detectCollision() {
      //
      //detect collision between player ammo and enemies
      gameBoard.playerAmmo.forEach((ammo) => {
        gameBoard.arrEnemies.forEach((enemy) => {
          if (isOverlapping(ammo, enemy)) {
            enemy.takeDmage(ammo.damage);
            removeObject(ammo, gameBoard.playerAmmo);
          }
        });
      });
  
      //
      //detect collision between player ship and enemies
      gameBoard.arrEnemies.forEach((enemy) => {
        if (isOverlapping(enemy, gameBoard.objPlayer)) {
          enemy.takeDmage(gameBoard.objPlayer.atk);
          gameBoard.objPlayer.takeDmage(enemy.atk);
        }
      });
  
      //
      //detect collision between player ship and enemy ammo
      gameBoard.enemyAmmo.forEach((ammo) => {
        if (isOverlapping(ammo, gameBoard.objPlayer)) {
          gameBoard.objPlayer.takeDmage(ammo.damage);
          removeObject(ammo, gameBoard.enemyAmmo);
        }
      });
    },
  };