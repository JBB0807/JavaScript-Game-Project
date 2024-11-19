"use strict";

const gameBoard = {
  playerName: null,
  objPlayer: null,
  arrProps: [],
  arrEnemies: [],
  arrObstacles: [],
  playerAmmo: [],
  enemyAmmo:[],

  score: null,
  difficultyOptions: ["Easy", "Normal", "Hard"],
  diffifucltyIndex: 1,
  isRunning: false,
  activeScreen: null,
  $gamePlaySection: $("#screen-play"),

  init() {
    gameBoard.switchScreen("#screen-main");
    gameBoard.adjustDifficulty(0);
  },

  startGame() {
    gameBoard.playerName = $("#input-player-name").val();
    gameBoard.isRunning = true;
    // console.log(`Game Started: Welcome ${gameBoard.playerName}!`);

    gameBoard.addGameObject("#player-spaceship");

    gameBoardEventHandler.activateGameLoop();
    //
  },

  pauseGame() {
    gameBoard.isRunning = false;
    console.log(`Game Paused`);
  },

  resumeGame() {
    gameBoard.isRunning = true;
    console.log(`Game Resumed`);
  },

  quitGame() {
    gameBoard.isRunning = true;
    console.log(`Game Quit`);
  },

  adjustDifficulty(intPlusMinus) {
    gameBoard.diffifucltyIndex += intPlusMinus;
    if (gameBoard.diffifucltyIndex < 0) {
      gameBoard.diffifucltyIndex = gameBoard.difficultyOptions.length - 1;
    } else if (
      gameBoard.diffifucltyIndex >= gameBoard.difficultyOptions.length
    ) {
      gameBoard.diffifucltyIndex = 0;
    }

    $("#difficulty-level-display").text(
      gameBoard.difficultyOptions[gameBoard.diffifucltyIndex]
    );
  },

  addGameObject(elementID, xPostiion, yPosition) {
    if (elementID === "#player-spaceship") {
      gameBoard.objPlayer = new Player();
    } else if(elementID === '#drone-spaceship') {
      gameBoard.arrEnemies.push(new Drone());
    }
  },

  switchScreen(screenID) {
    if (screenID !== "#screen-pause") {
      $(".div-screen").hide();
    }
    $(screenID).show();
    gameBoard.activeScreen = screenID;
    gameBoard.updateHeader();
  },

  updateHeader() {
    $(".div-header-item").hide();
    $("#header-item-sound").show();

    if (gameBoard.activeScreen === "#screen-credits") {
      return;
    }

    if (gameBoard.activeScreen === "#screen-main") {
      $("#header-item-credits").show();
    } else {
      $("#header-item-score").show();
      if (gameBoard.activeScreen === "#screen-play") {
        $("#header-item-pause").show();
      }
    }

    if (
      gameBoard.activeScreen === "#screen-main" ||
      gameBoard.activeScreen === "#screen-pause"
    ) {
      $("#header-item-help").show();
    }
  },

  removeIfOutside(arrOjb){
    arrOjb.forEach((obj) => {
      if(gameBoard.$gamePlaySection.width() < Math.abs(getXPosition(obj)) 
        || gameBoard.$gamePlaySection.height() < Math.abs(getYPosition(obj))
        || getYPosition(obj) < 0){
          removeObject(obj,arrOjb);
      }
    });
  },
};

const gameBoardEventHandler = {
  activeKeys: [],
  keyframe: null,
  targetFrameRate: 1000 / 144,
  playerFiringRate: 1000 / 25,
  playerFireKeyFrame: null,
  requestAnimationFrameID: null,

  registerKeyPress(key) {
    if (
      gameBoard.isRunning &&
      gameBoardEventHandler.activeKeys.indexOf(key) === -1
    ) {
      gameBoardEventHandler.activeKeys.unshift(key);
    }
    // console.log(`Active kyes: ${gameBoardEventHandler.activeKeys}`);
  },

  registerKeyRelease(key) {
    if (gameBoard.isRunning) {
      const index = gameBoardEventHandler.activeKeys.indexOf(key);
      gameBoardEventHandler.activeKeys.splice(index, 1);
      // console.log(`Active kyes: ${gameBoardEventHandler.activeKeys}`);
    }
  },

  activateGameLoop() {
    gameBoardEventHandler.requestAnimationFrameID =
      window.requestAnimationFrame(gameBoardEventHandler.checkKeyFrame);
  },

  deactivateGameLoop() {
    window.cancelAnimationFrame(gameBoardEventHandler.requestAnimationFrameID);
    gameBoardEventHandler.requestAnimationFrameID = null;
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
    }


    gameBoardEventHandler.requestAnimationFrameID =
      window.requestAnimationFrame(gameBoardEventHandler.checkKeyFrame);
  },

  updateEnemyMovement(highResTimestamp){
    gameBoard.arrEnemies.forEach((enemy) => {
        enemy.updatePosition(highResTimestamp, gameBoardEventHandler.keyframe, 0, -1);
      } 
    );
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
        gameBoard.addGameObject('#drone-spaceship');
      }

    });

    if(xMovement !==0 || yMovement !== 0){
      gameBoard.objPlayer.updatePosition(
        highResTimestamp,
        gameBoardEventHandler.keyframe,
        xMovement,
        yMovement
      );
    }
  },

  firePlayerAmmo(highResTimestamp) {
    if (this.activeKeys.includes(" ")) {
      if (
        highResTimestamp - gameBoardEventHandler.playerFireKeyFrame >
        gameBoardEventHandler.playerFiringRate
      ) {
        gameBoard.objPlayer.fire();
        gameBoardEventHandler.playerFireKeyFrame = highResTimestamp;
      }
    }
  },

  updateAmmoPosition(highResTimestamp) {
    gameBoard.playerAmmo.forEach((ammo) => {
      ammo.updatePosition(gameBoardEventHandler.keyframe, highResTimestamp);
    });
  },

  objectCleanup(){
    gameBoard.removeIfOutside(gameBoard.playerAmmo);
    gameBoard.removeIfOutside(gameBoard.arrEnemies);
  },

  detectCollision(){

    //
    //detect player ammo against enemies
    gameBoard.playerAmmo.forEach((ammo) => {
      gameBoard.arrEnemies.forEach((enemy) => {
        if(isOverlapping(ammo, enemy)){
          enemy.takeDmage(ammo.damage);
          removeObject(ammo, gameBoard.playerAmmo);
        }
      });
    });

    gameBoard.arrEnemies.forEach((enemy) => {
      if(isOverlapping(enemy, gameBoard.objPlayer)){
        enemy.takeDmage(gameBoard.objPlayer.atk);
        gameBoard.objPlayer.takeDmage(enemy.atk);
      }
    });
  }

};

$(document).ready(function () {
  gameBoard.init();
  setupListeners();
});

//
//Listeners
function setupListeners() {
  //
  //on click listener for all menu items that will trigger a screen to change
  $(".div-screen-select").on("click", function () {
    var elementId = $(this).attr("id");
    if ($(this).hasClass("switch-screen-play")) {
      console.log("Switch to play screen");
      gameBoard.switchScreen("#screen-play");
      if (elementId === "menu-start-game") {
        gameBoard.startGame();
      } else if (elementId === "menu-resume") {
        gameBoard.resumeGame();
      }
    } else if ($(this).hasClass("switch-screen-main")) {
      console.log("Switch to main screen");
      gameBoard.switchScreen("#screen-main");
    } else if ($(this).hasClass("switch-screen-pause")) {
      console.log("Switch to pause screen");
      gameBoard.pauseGame();
      gameBoard.switchScreen("#screen-pause");
    } else if ($(this).hasClass("switch-screen-credits")) {
      console.log("Switch to credits screen");
      gameBoard.switchScreen("#screen-credits");
    }
  });

  $("#difficulty-adjust-right").on("click", function () {
    gameBoard.adjustDifficulty(1);
  });

  $("#difficulty-adjust-left").on("click", function () {
    gameBoard.adjustDifficulty(-1);
  });

  //
  //Keyboard Press/Release Listeners
  $(document).keydown(function (event) {
    gameBoardEventHandler.registerKeyPress(event.key);
  });

  $(document).keyup(function (event) {
    gameBoardEventHandler.registerKeyRelease(event.key);
  });
}


//
//Utility functions
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getXPosition(obj){
  return parseInt($(obj.domReference).css("left"), 10);
}

function getYPosition(obj){
  return parseInt($(obj.domReference).css("bottom"), 10);
}

function removeObject(obj, arr){
  $(obj.domReference).remove();
  const index = arr.indexOf(obj);
  arr.splice(index,1);
}

function isOverlapping(obj1, obj2){
  //getting corner coordinates for object 1
  const x1_1 = Math.abs(parseInt($(obj1.domReference).css("left"), 10));
  const x1_2 = x1_1 + $(obj1.domReference).width();
  const y1_1 = Math.abs(parseInt($(obj1.domReference).css("bottom"), 10));
  const y1_2 = y1_1 + $(obj1.domReference).height();

  //getting corner coordinates for object 1
  const x2_1 = Math.abs(parseInt($(obj2.domReference).css("left"), 10));
  const x2_2 = x2_1 + $(obj2.domReference).width();
  const y2_1 = Math.abs(parseInt($(obj2.domReference).css("bottom"), 10));
  const y2_2 = y2_1 + $(obj2.domReference).height();
  
  // console.log('isOverlapping');
  // console.log(`${x1_1}:${x1_2}:${x2_1}:${x2_2}:${y1_1}:${y1_2}:${y2_1}:${y2_2}`);

  return (x1_1 < x2_2 && x1_2 > x2_1 && y1_1 < y2_2 && y1_2 > y2_1)
}

//
//Game object classes
class SpaceShip {
  constructor(elementID, ammoElementId, speed, hp, def, atk) {
    this.speed = speed;
    this.hp = hp;
    this.def = def;
    this.atk = atk;
    this.ammoElementId = ammoElementId;

    this.domReference = $(elementID).clone();
    this.domReference
      .appendTo(gameBoard.$gamePlaySection)
      .css("transition", "none");
  }

  updatePosition(timeStamp, lastKeyFrame, xMovement, yMovement) {
    let xPosition = parseInt($(this.domReference).css("left"), 10);
    let yPosition = parseInt($(this.domReference).css("bottom"), 10);

    xPosition -= this.speed * xMovement * (timeStamp / lastKeyFrame);
    yPosition += this.speed * yMovement * (timeStamp / lastKeyFrame);

    $(this.domReference)
      .css("bottom", `${yPosition}px`)
      .css("left", `${xPosition}px`);
  }

  fire() {
    if(this instanceof Player) {
      gameBoard.playerAmmo.push(new Ammo(this));
    } else if (this instanceof Enemy) {
      gameBoard.enemyAmmo.push(new Ammo(this));
    }
  }

  takeDmage(dmg){
    this.hp -= dmg;
    if(this.hp <= 0) {
      this.destroy();
    }
  }

  destroy(){
    if(this instanceof Enemy) {
      removeObject(this, gameBoard.arrEnemies);
    } else if (this instanceof Player){
      gameBoard.switchScreen('#screen-game-over');
    }
  }
}

class Player extends SpaceShip {
  constructor() {
    const elementID = "#player-spaceship";
    const ammoElementId = "#player-ammo";
    const speed = 4;
    const hp = 100;
    const def = 10;
    const atk = 10;

    super(elementID, ammoElementId, speed, hp, def, atk);
    //place the player at the bottom center
    const leftOffset =
      gameBoard.$gamePlaySection.width() / 2 - this.domReference.width() / 2;
    this.domReference.css("left", `${leftOffset}px`).css("bottom", `0px`);
  }
}

class Enemy extends SpaceShip {
  constructor(elementID, ammoElementId, speed, hp, def, atk) {
    super(elementID, ammoElementId, speed, hp, def, atk);
  }
}

class Drone extends Enemy {
  constructor() {
    const elementID = "#drone-spaceship";
    const ammoElementId = "#drone-ammo";
    const speed = 2;
    const hp = 10;
    const def = 5;
    const atk = 2;

    super(elementID, ammoElementId, speed, hp, def, atk);
    //place the drone at a random location
    const leftOffset =
      gameBoard.$gamePlaySection.width() / 2 - this.domReference.width() / 2;
    this.domReference.css("left", `50%`).css("bottom", `100%`);
  }
}

class Ammo {
  constructor(objSpaceShip) {
    this.damage = objSpaceShip.atk;
    this.fromPlayer = objSpaceShip instanceof Player;
    this.speed = objSpaceShip.speed;

    this.domReference = $(objSpaceShip.ammoElementId).clone();
    this.domReference
      .appendTo(gameBoard.$gamePlaySection);

    const xPosition = parseInt($(objSpaceShip.domReference).css("left"), 10);
    const yPosition = parseInt($(objSpaceShip.domReference).css("bottom"), 10);

    const leftOffset = objSpaceShip.domReference.width() / 2 + xPosition;
    const bottomOffset = objSpaceShip.domReference.height() / 2 + yPosition;

    this.domReference
      .css("left", `${leftOffset}px`)
      .css("bottom", `${bottomOffset}px`);
  }

  updatePosition(lastKeyFrame, timeStamp) {
    let yPosition = parseInt($(this.domReference).css("bottom"), 10);
    yPosition += this.speed * 2 *(timeStamp / lastKeyFrame);

    $(this.domReference).css("bottom", `${yPosition}px`);
  }
}

//
//Constants and DOM References
