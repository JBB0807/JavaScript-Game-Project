"use strict";

import { gameBoard } from "./gameboard.js";
import {
  getCenterXPosition,
  getRandomNumber,
  getYPosition,
  getXPosition,
  removeObject,
} from "./utils.js";
import { playPlayerLaserSound, playDroneLaserSound } from "./soundManager.js";
//
//Game object classes

export class Swarm {
  domReference;
  animationClass;

  spawnRate = 1000;
  lastSpawnTime = 0;
  currentSpawnCount = 0;
  spawnSize = 10;

  //number of object to be spawned at the same time
  groupCountPerSpawn = 1;

  //define to give swarm a fixed position to start
  xOrigin = 0;
  yOrigin = null;

  //incremental position if objects are spawned in a group
  groupIncrementX;
  groupIncrementY;

  //for randomized positions
  xRandomMin;
  xRandomMax;
  yRandomMin;
  yRandomMax;

  constructor(domReference, animation){
    this.domReference = domReference;
    this.animation = animation;
  }

  addObject(highResTimestamp) {
    this.lastSpawnTime = highResTimestamp;

    let object = gameBoard.addGameObject(this.domReference, true, this.xOrigin, this.yOrigin);
    object.domReference.removeClass("default-drone-anim");
    object.domReference.addClass(this.animation);
    //add onjects here
  }

  check(highResTimestamp) {

    if(this.lastSpawnTime === null){
      this.lastSpawnTime = highResTimestamp;
    }

    if(highResTimestamp - this.lastSpawnTime >= this.spawnRate && this.spawnSize > this.currentSpawnCount){
      this.currentSpawnCount++;
      this.addObject(highResTimestamp);
    }
  }

  onPause(){
    this.lastSpawnTime = null;
  }

  spawnComplete(){
    return this.spawnSize == this.currentSpawnCount;
  }

}

export class SpaceShip {
  constructor(elementID, ammoElementId, speed, hp, def, atk) {
    this.speed = speed;
    this.hp = hp;
    this.totalDamage = 0;
    this.def = def;
    this.atk = atk;
    this.ammoElementId = ammoElementId;

    this.domReference = $(elementID).clone();
    this.domReference.appendTo(gameBoard.domReference);

    this.updateHPBar();
  }

  

  fire() {
    if (this instanceof Player) {
      gameBoard.playerAmmo.push(new Ammo(this));
    } else if (this instanceof Enemy) {
      gameBoard.enemyAmmo.push(new Ammo(this));
    }
  }

  takeDmage(dmg) {
    this.totalDamage += dmg;

    if (this instanceof Enemy) {
      gameBoard.addScore(dmg);
    }

    if (this.totalDamage > this.hp) {
      this.destroy();

      if (this instanceof Enemy) {
        gameBoard.addScore(this.hp);
      }
    } else {
      //instead of destroying just update the hp bar
      this.updateHPBar();
    }
  }

  updateHPBar(){
    const remainingPct = 100 * ( (this.hp - this.totalDamage) / this.hp); 

    let dom;
    if(this instanceof Player){
      dom = $('#player-hp');
    } else if(this instanceof Drone){
      dom = this.domReference.find('.drone-hp');
    }

    dom?.css("width", `${remainingPct}%`);

  }

  destroy() {
    if (this instanceof Enemy) {
      removeObject(this, gameBoard.arrEnemies);
    } else if (this instanceof Player) {
      gameBoard.switchScreen("#screen-game-over");
    }
  }
}

export class Player extends SpaceShip {
  constructor() {
    const elementID = "#player-spaceship";
    const ammoElementId = "#player-ammo";
    //variable speed to make is consistent regardless of the the screen size
    const speed = 4 * gameBoard.domReference.width() / 480;
    const hp = 1000;
    const def = 10;
    const atk = 10;
    
    super(elementID, ammoElementId, speed, hp, def, atk);
    //place the player at the bottom center
    this.domReference.css("left", `48%`).css("bottom", `0px`);
  }

  updatePosition(timeStamp, lastKeyFrame, xMovement, yMovement) {
    let xPosition = getXPosition(this);
    let yPosition = getYPosition(this);

    xPosition -= this.speed * xMovement * (timeStamp / lastKeyFrame);
    yPosition += this.speed * yMovement * (timeStamp / lastKeyFrame);

    //perform a reset if the movement will exceed the game borders. 
    if (
      xPosition + this.domReference.width() > gameBoard.domReference.width() ||
      xPosition <= 0
    ) {
      xPosition += this.speed * xMovement * (timeStamp / lastKeyFrame);
    }

    if (
      yPosition + this.domReference.height() >
        gameBoard.domReference.height() ||
      yPosition <= 0
    ) {
      yPosition -= this.speed * yMovement * (timeStamp / lastKeyFrame);
    }
    $(this.domReference)
      .css("bottom", `${yPosition}px`)
      .css("left", `${xPosition}px`);
  }

  fire() {
    playPlayerLaserSound();
    super.fire();
  }

}

export class Enemy extends SpaceShip {
  constructor(elementID, ammoElementId, speed, hp, def, atk) {
    
    super(elementID
      , ammoElementId
      , speed
      , hp * gameBoard.getDifficultyMultiplier()
      , def
      , atk * gameBoard.getDifficultyMultiplier());
  }
}

export class Drone extends Enemy {
  constructor(isPartOfSwarm = false, x = null, y = null) {
    const elementID = "#drone-container";
    const ammoElementId = "#drone-ammo-container";
    const speed = 2;
    const hp = 100;
    const def = 5;
    const atk = 2;

    super(elementID, ammoElementId, speed, hp, def, atk);

    this.isPartOfSwarm = isPartOfSwarm;
    const leftOffset = x !== null
      ? x
      : `${
          getRandomNumber(20, gameBoard.domReference.width()) -
          this.domReference.width() / 2
        }px`;

    const bottomOffset = y !== null ? y : "100%";

    this.domReference.css("left", leftOffset).css("bottom", bottomOffset);
  }

  fire() {
    playDroneLaserSound();
    super.fire();
  }
}

export class Ammo {
  constructor(objSpaceShip) {
    this.damage = objSpaceShip.atk;
    this.fromPlayer = objSpaceShip instanceof Player;
    this.speed = objSpaceShip.speed;

    this.domReference = $(objSpaceShip.ammoElementId).clone();
    this.domReference.appendTo(gameBoard.domReference);
    let botomAdjust = objSpaceShip.domReference.height() / 2;
    if (objSpaceShip instanceof Enemy) {
      botomAdjust *= -1;
    }

    const leftOffset =
      getCenterXPosition(objSpaceShip) - this.domReference.width() / 2;
    const bottomOffset = getYPosition(objSpaceShip) + botomAdjust;

    this.domReference
      .css("left", `${leftOffset}px`)
      .css("bottom", `${bottomOffset}px`);
  }

  updatePosition(lastKeyFrame, timeStamp) {
    let multiplier = 2;

    if (!this.fromPlayer) {
      multiplier *= -1;
    }

    let yPosition = parseInt($(this.domReference).css("bottom"), 10);
    yPosition += this.speed * multiplier * (timeStamp / lastKeyFrame);

    $(this.domReference).css("bottom", `${yPosition}px`);
  }
}
