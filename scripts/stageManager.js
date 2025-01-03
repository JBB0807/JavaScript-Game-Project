"use strict";

import {endBGMusicLoop, loopFirstDrop} from './soundManager.js'
import {gameBoard} from './gameboard.js'

let activeSwarm;

export const stageManager = {
    enemiesToDefeat: [],
    currentStage: 0,
    currentStageTime: 0,
    lastDroneKeyframe: null,
    lastKeyFrame: null,

    stageCheck(highResTimestamp){
        if(this.lastKeyFrame === null){
            this.lastKeyFrame = highResTimestamp;
            return;
        }

        this.currentStageTime += highResTimestamp;

        if(this.lastKeyFrame - this.lastDroneKeyframe > 1500 ){
            this.lastDroneKeyframe = highResTimestamp; 
            gameBoard.addGameObject("#drone-spaceship");
            gameBoard.arrEnemies.forEach((enemy) => {
              enemy.fire();
            });
          }

        if(this.currentStage === 0 && this.currentStageTime >= 30000){
            loopFirstDrop();
            this.currentStage++
            this.currentStageTime = 0;
        } else if (this.currentStage === 1 && this.currentStageTime >= 30000){
            endBGMusicLoop();
            this.currentStage++
        }
    }

}

