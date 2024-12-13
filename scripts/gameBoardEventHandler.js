import {gameBoard} from './gameboard.js';
import {isOverlapping, removeObject} from './utils.js'

export const gameBoardEventHandler = {
    activeKeys: [],
    keyframe: null,
    targetFrameRate: 1000 / 144,
    playerFiringRate: 1000 / 25,
    playerFireKeyFrame: null,
    requestAnimationFrameID: null,
    lastDroneKeyframe: null,
  
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
  
      if (gameBoardEventHandler.keyframe === null) {
        gameBoardEventHandler.keyframe = highResTimestamp;
      }
  
      if (
        highResTimestamp - gameBoardEventHandler.keyframe >
        gameBoardEventHandler.targetFrameRate
      ) {
        gameBoardEventHandler.updatePlayerMovement(highResTimestamp);
  
        gameBoardEventHandler.updateAmmoPosition(highResTimestamp);
        gameBoardEventHandler.updateEnemyMovement(highResTimestamp);
        gameBoardEventHandler.firePlayerAmmo(highResTimestamp);
        gameBoardEventHandler.objectCleanup();
        gameBoardEventHandler.detectCollision();
        gameBoardEventHandler.keyframe = highResTimestamp;
  
        if(highResTimestamp - gameBoardEventHandler.lastDroneKeyframe > 1500 ){
          gameBoardEventHandler.lastDroneKeyframe = highResTimestamp; 
          gameBoard.addGameObject("#drone-spaceship");
          gameBoard.arrEnemies.forEach((enemy) => {
            enemy.fire();
          });
        }
      }
  
      gameBoardEventHandler.requestAnimationFrameID =
        window.requestAnimationFrame(gameBoardEventHandler.checkKeyFrame);
    },
  
    updateEnemyMovement(highResTimestamp) {
      gameBoard.arrEnemies.forEach((enemy) => {
        enemy.updatePosition(
          highResTimestamp,
          this.keyframe,
          0,
          -1
        );
      });
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
          gameBoard.addGameObject("#drone-spaceship");
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
          gameBoard.objPlayer.fire();
          this.playerFireKeyFrame = highResTimestamp;
        }
      }
    },
  
    updateAmmoPosition(highResTimestamp) {
      gameBoard.playerAmmo.forEach((ammo) => {
        ammo.updatePosition(this.keyframe, highResTimestamp);
      });
  
      gameBoard.enemyAmmo.forEach((ammo) => {
        ammo.updatePosition(this.keyframe, highResTimestamp);
      });
  
    },
  
    objectCleanup() {
      gameBoard.removeIfOutside(gameBoard.playerAmmo);
      gameBoard.removeIfOutside(gameBoard.enemyAmmo);
      gameBoard.removeIfOutside(gameBoard.arrEnemies);
    },
  
    detectCollision() {
      //
      //detect player ammo against enemies
      gameBoard.playerAmmo.forEach((ammo) => {
        gameBoard.arrEnemies.forEach((enemy) => {
          if (isOverlapping(ammo, enemy)) {
            enemy.takeDmage(ammo.damage);
            removeObject(ammo, gameBoard.playerAmmo);
          }
        });
      });
  
      gameBoard.arrEnemies.forEach((enemy) => {
        if (isOverlapping(enemy, gameBoard.objPlayer)) {
          enemy.takeDmage(gameBoard.objPlayer.atk);
          gameBoard.objPlayer.takeDmage(enemy.atk);
        }
      });
  
      gameBoard.enemyAmmo.forEach((ammo) => {
        if (isOverlapping(ammo, gameBoard.objPlayer)) {
          gameBoard.objPlayer.takeDmage(ammo.damage);
          removeObject(ammo, gameBoard.enemyAmmo);
        }
      });
    },
  };