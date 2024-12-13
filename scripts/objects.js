import {gameBoard} from './gameboard.js';
import { getCenterXPosition, getRandomNumber, getYPosition, getXPosition, removeObject } from './utils.js';
//
//Game object classes
export class SpaceShip {
  constructor(elementID, ammoElementId, speed, hp, def, atk) {
    this.speed = speed;
    this.hp = hp;
    this.def = def;
    this.atk = atk;
    this.ammoElementId = ammoElementId;

    this.domReference = $(elementID).clone();
    this.domReference
      .appendTo(gameBoard.domReference)
      .css("transition", "none");
  }

  updatePosition(timeStamp, lastKeyFrame, xMovement, yMovement) {
    let xPosition = getXPosition(this);
    let yPosition = getYPosition(this);

    xPosition -= this.speed * xMovement * (timeStamp / lastKeyFrame);
    yPosition += this.speed * yMovement * (timeStamp / lastKeyFrame);

    if (this instanceof Player) {
      //perform a reset if the movement will exceed the game borders.
      if (
        xPosition + this.domReference.width() >
          gameBoard.domReference.width() ||
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
    }
    $(this.domReference)
      .css("bottom", `${yPosition}px`)
      .css("left", `${xPosition}px`);
  }

  fire() {
    if (this instanceof Player) {
      gameBoard.playerAmmo.push(new Ammo(this));
    } else if (this instanceof Enemy) {
      gameBoard.enemyAmmo.push(new Ammo(this));
    }
  }

  takeDmage(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.destroy();
    }
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
    const speed = 4;
    const hp = 100;
    const def = 10;
    const atk = 10;

    super(elementID, ammoElementId, speed, hp, def, atk);
    //place the player at the bottom center
    const leftOffset = getCenterXPosition(gameBoard) - getCenterXPosition(this);
    this.domReference.css("left", `${leftOffset}px`).css("bottom", `0px`);
  }
}

export class Enemy extends SpaceShip {
  constructor(elementID, ammoElementId, speed, hp, def, atk) {
    super(elementID, ammoElementId, speed, hp, def, atk);
  }
}

export class Drone extends Enemy {
  constructor() {
    const elementID = "#drone-spaceship";
    const ammoElementId = "#drone-ammo";
    const speed = 2;
    const hp = 100;
    const def = 5;
    const atk = 2;

    super(elementID, ammoElementId, speed, hp, def, atk);
    //place the drone at a random location
    const leftOffset =
      getRandomNumber(20, gameBoard.domReference.width()) -
      this.domReference.width() / 2;
    this.domReference.css("left", `${leftOffset}px`).css("bottom", `100%`);
  }
}

export class Ammo {
  constructor(objSpaceShip) {
    this.damage = objSpaceShip.atk;
    this.fromPlayer = objSpaceShip instanceof Player;
    this.speed = objSpaceShip.speed;

    this.domReference = $(objSpaceShip.ammoElementId).clone();
    this.domReference
      .appendTo(gameBoard.domReference)
      .css("transition", "none");

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
