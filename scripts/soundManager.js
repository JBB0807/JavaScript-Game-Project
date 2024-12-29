"use strict";

const audioContext = new (window.AudioContext ||
  window.webkitAudioContext)();

//
// Sound setup for background music
// 24.33 - fist big drop
//       - loop at 48.474 64.491
//
//
const bgAudioContext = new (window.AudioContext ||
  window.webkitAudioContext)();
let bgMusicXBuffer = await fetchData(bgAudioContext, "./sounds/space-background.mp3");
let bgMusicGN = createGain(bgAudioContext, 0.7); // Set the volume
let bgMusicBFSource;

export function playBGSound() {
  if (bgMusicXBuffer === null) return;

  bgMusicBFSource = playBuffer(bgAudioContext, bgMusicXBuffer, bgMusicGN);
}

export function loopFirstDrop() {
  if(bgMusicBFSource === null) return;

  console.log("first loop");
  bgMusicBFSource.loop = true; 
  bgMusicBFSource.loopStart  = 47.49;
  bgMusicBFSource.loopEnd = 63.49;
}

export function endBGMusicLoop() {
  if(bgMusicBFSource === null) return;
  console.log("end loop");

  bgMusicBFSource.loop = false; 
}

// END - Sound setup for background music
//

//
// Sound setup for player ammo sfx
//
let playerAmmoSFXBuffer = await fetchData(audioContext, "./sounds/player-ammo-sfx.wav");
let playerAmmoGN = createGain(audioContext, 0.2); // Set the volume

export function playPlayerLaserSound() {
  if (!playerAmmoSFXBuffer) return;
  playBuffer(audioContext, playerAmmoSFXBuffer, playerAmmoGN);
}
//
// END - Sound setup for player ammo sfx
//

//
// Sound setup for drome ammo sfx
//
let droneAmmoSFXBuffer = await fetchData(audioContext, "./sounds/player-ammo-sfx.wav");
let droneAmmoGN = createGain(audioContext, 0.4); // Set the volume

export function playDroneLaserSound() {
  if (!droneAmmoSFXBuffer) return;
  playBuffer(audioContext, droneAmmoSFXBuffer, droneAmmoGN);
}
//
// END - Sound setup for drone ammo sfx
//

export function startAudio() {
  audioContext.resume();
  bgAudioContext.resume();
}

export function audioOff() {
}

export function pauseAudio() {
  audioContext.pause();
  bgAudioContext.pause();
}

export function stopAudio() {
  bgMusicBFSource.stop();
}

async function fetchData(context, media) {
  return fetch(media)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      return buffer;
    });
}

// Create a GainNode for volume control
function createGain(context, volume) {
  let objGain = context.createGain();
  objGain.connect(context.destination); // Connect GainNode to the destination
  objGain.gain.value = volume; // Set the volume
  return objGain;
}

function playBuffer(context, buffer, gain) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start(0); // Play immediately
  return source;
}


