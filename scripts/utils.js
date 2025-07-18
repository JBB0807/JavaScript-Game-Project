"use strict";

//
//Utility functions
export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
 
export function getXPosition(obj) {
    const matrix = $(obj.domReference).css('transform').split(',');
    let x = matrix[4];

    if(x === undefined){
      x = 0;
    }

  return parseInt($(obj.domReference).css("left"), 10) + parseInt(x, 10); 
}

export function getYPosition(obj) {
  const matrix = $(obj.domReference).css('transform').split(',');
  let y = matrix[5];

  if(y === undefined){
    y = 0;
  }

  return parseInt($(obj.domReference).css("bottom"), 10) - parseInt(y, 10);
}

export function getCenterXPosition(obj) {
  return getXPosition(obj) + obj.domReference.width() / 2;
}

export function getCenterYPosition(obj) {
  return getXPosition(obj) + obj.domReference.height() / 2;
}

export function removeObject(obj, arr) {
  $(obj.domReference).remove();
  const index = arr.indexOf(obj);
  arr.splice(index, 1);
}

export function isOverlapping(obj1, obj2) {
  //getting corner coordinates for object 1
  const x1_1 = Math.abs(getXPosition(obj1));
  const x1_2 = x1_1 + $(obj1.domReference).width();
  const y1_1 = Math.abs(getYPosition(obj1));
  const y1_2 = y1_1 + $(obj1.domReference).height();

  //getting corner coordinates for object 2
  const x2_1 = Math.abs(getXPosition(obj2));
  const x2_2 = x2_1 + $(obj2.domReference).width();
  const y2_1 = Math.abs(getYPosition(obj2));
  const y2_2 = y2_1 + $(obj2.domReference).height();

  return x1_1 < x2_2 && x1_2 > x2_1 && y1_1 < y2_2 && y1_2 > y2_1;
}

//return true or false based on probability precentage, e.g. 80 input will give an 80% probability of true
export function drawProbability(probabilityPercentage) {
  const randomInt = getRandomNumber(1, 100);
  return randomInt <= probabilityPercentage;
}