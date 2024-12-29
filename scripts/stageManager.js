"use strict";

import {endBGMusicLoop, loopFirstDrop} from './soundManager.js'

export const stageManager = {
    enemiesToDefeat: [],
    currentStage: 0,
    currentStageTime: 0,

    stageCheck(frame){
        this.currentStageTime += frame;

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