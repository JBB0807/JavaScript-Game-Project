"use strict";

import { endBGMusicLoop, loopFirstDrop } from "./soundManager.js";
import { gameBoard } from "./gameboard.js";
import { drawProbability, getRandomNumber } from "./utils.js";
import { Swarm } from "./objects.js";

let activeSwarm;

export const stageManager = {
  enemiesToDefeat: [],
  activeSwarm: null,
  currentStage: -1, 
  currentStageTime: 0,
  lastSpawnKeyframe: 0,
  lastFireKeyFrame: 0,
  lastKeyFrame: null,
  isPasued: false,

  stageCheck(highResTimestamp) {
    if (this.lastKeyFrame === null) {
      this.lastKeyFrame = highResTimestamp;
      return;
    }

    //calling stage check will resume the game
    if(this.isPasued){
      // console.log('resuming');
      this.resume(highResTimestamp);
    }

    this.currentStageTime += highResTimestamp - this.lastKeyFrame;
    //musical timing
    // stage -1 ->> 0 to 16550 ms
    // stage 0  ->> 16550 to 25000 ms (8450 total play time)
    // stage 1  ->> 25000 to 33000 ms (8000 total play time)
    // stage 2  ->> 33000 to (until swarm is clear) - music loop starts at 47490 and ends at 63490 (16000 total time).  
    //              14490 ms from stage begin to start of loop time (total play time varies)
    // stage 3  ->> 63490 to 80000 (16510 total play time)
    // stage 4  ->> 80000 to 96000 (16000 total play time)
    // stage 5  ->> 96000 to 112000 (16000 total play time)
    // stage 6  ->> 112000 to 128000 (16000 total play time)
    // stage 7  ->> 128000 to 146000 (18000 total play time)
    if (this.currentStage === -1 && this.currentStageTime >= 16550) {
      //stage -1 - calm - can add text or instructions or story
      this.nextStage();
    } else if (this.currentStage === 0) {
      //stage 0 - first drones - little by little and not firing
      if (this.currentStageTime < 8450) {
        this.checkAddDrone(highResTimestamp, 3000, 1);
      } else {
        this.nextStage();
      }
    } else if (this.currentStage === 1) {
      //Stage 1 more drone and now they are firing
      if (this.currentStageTime < 8000) {
        this.checkAddDrone(highResTimestamp, 1000, 3);
        this.checkEnemyFire(highResTimestamp, 1000, 100, 1);
      } else {
        this.nextStage();
      }
    } else if (this.currentStage === 2) {
      //Stage 2 drop the first swarm
      if(this.activeSwarm === null){
        // console.log("start loop");
        loopFirstDrop();
        this.activeSwarm = new Swarm("#drone-container", "trajectory1-animation");
        this.activeSwarm.spawnRate = 600;
        this.activeSwarm.spawnSize = 15;
      }
      this.activeSwarm.check(highResTimestamp);
      this.checkEnemyFire(highResTimestamp, 250, 50, 1);
      if(this.activeSwarm.spawnComplete() && gameBoard.isSwarmCleared()){
        //move to the next stage if the current stage time is close to the end of the music loop
        if((this.currentStageTime - 14490) % 16000 > 14000){
          endBGMusicLoop();
          this.nextStage();
        } else {
          //fill with drones while waiting to the end of loop so there are not dead time
          this.checkAddDrone(highResTimestamp, 600, 1);
        }
      }
    } else if (this.currentStage === 3) {
      //Stage 3 calm - put text or story
      if(this.currentStageTime > 18510){
        this.nextStage();
      }
    } else if (this.currentStage === 4) {
      //Stage 4 add a little meteor
      this.checkAddDrone(highResTimestamp, 2000, 2);
      if(this.currentStageTime > 16000){
        this.nextStage();
      }
    } else if (this.currentStage === 5) {
      //Stage 5 add meteor 
      this.checkAddDrone(highResTimestamp, 1000, 4);
      this.checkEnemyFire(highResTimestamp, 1000, 50, 1);
      if(this.currentStageTime > 16000){
        this.nextStage();
      }
    } else if (this.currentStage === 6) {
      //Stage 6 add meteor and drone
      this.checkAddDrone(highResTimestamp, 1000, 4);
      this.checkAddDrone(highResTimestamp, 200, 1);
      this.checkEnemyFire(highResTimestamp, 100, 50, 1);
      if(this.currentStageTime > 16000){
        this.nextStage();
      }
    } else if (this.currentStage === 7) {
      //Stage 7 finishing section - add text or story
      if(this.currentStageTime > 18000){
        console.log("Stage finish");
        gameBoard.stageCleared();
        //Finish the game
      }
    }

    this.lastKeyFrame = highResTimestamp;
  },

  nextStage() {
    this.currentStage++;
    this.currentStageTime = 0;
    this.lastSpawnKeyframe = 0;
    this.lastFireKeyFrame = 0;
    this.activeSwarm = null;
    console.log(`stage ${this.currentStage}`);
  },

  checkAddDrone(highResTimestamp, spawnRate, droneCount) {
    if (highResTimestamp - this.lastSpawnKeyframe > spawnRate) {
      // console.log(`add drone`);
      this.lastSpawnKeyframe = highResTimestamp;
      for (let index = 0; index < droneCount; index++) {
        gameBoard.addGameObject("#drone-container");
      }
    }
  },

  checkEnemyFire(highResTimestamp, fireRate, probability, enemyToFire) {
    if (highResTimestamp - this.lastFireKeyFrame > fireRate) {
      this.lastFireKeyFrame = highResTimestamp;
      if (enemyToFire === null) {
        gameBoard.arrEnemies.forEach((enemy) => {
          if (drawProbability(probability)) {
            enemy?.fire();
          }
        });
      } else {
        for (let index = 0; index < enemyToFire; index++) {
          const enemy = gameBoard.arrEnemies[getRandomNumber(0, gameBoard.arrEnemies.length)];
          if (drawProbability(probability)) {
            enemy?.fire();
          }
        }
      }
    }
  },

  pause(){
    this.isPasued = true;
  },

  resume(highResTimestamp){
    this.isPasued = false;
    this.lastSpawnKeyframe += highResTimestamp - this.lastKeyFrame;
    this.lastFireKeyFrame += highResTimestamp - this.lastKeyFrame;
    this.lastKeyFrame += highResTimestamp - this.lastKeyFrame;
  },

  reset(){
    this.enemiesToDefeat = [];
    this.activeSwarm = null;
    this.currentStage = -1;
    this.currentStageTime = 0;
    this.lastSpawnKeyframe = 0;
    this.lastFireKeyFrame = 0;
    this.lastKeyFrame =  null;
  },
};
