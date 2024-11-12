'use strict';

const gameBoard = {
  props: [],
  isRunning: false,
  keyframe: null,
  targetFrameRate: 1000 / 144,
  requestAnimationFrameID: null,
  activeScreen: null,

  init() {
    this.switchScreen("#screen-main")
  },

  switchScreen(screenID){
    if(screenID !== "#screen-pause") {
        $(".div-screen").hide();
    } 
    $(screenID).show();
    this.activeScreen = screenID;
  }

};

$(document).ready(function() {
    gameBoard.init();
    setupListeners();
});

function setupListeners() {
    //
    //on click listener for all menu items that will trigger a screen to change
    $(".div-screen-select").on("click", function () {
        if($(this).hasClass("switch-screen-play")){
            console.log("Switch to play screen");
            gameBoard.switchScreen("#screen-play");
            
        } else if($(this).hasClass("switch-screen-main")){
            console.log("Switch to main screen");
            gameBoard.switchScreen("#screen-main");

        } else if($(this).hasClass("switch-screen-pause")){
            console.log("Switch to pause screen");
            gameBoard.switchScreen("#screen-pause");

        } else if($(this).hasClass("switch-screen-credits")){
            console.log("Switch to credits screen");
            gameBoard.switchScreen("#screen-credits");

        } 
    });

    

}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}