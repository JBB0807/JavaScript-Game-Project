"use strict";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const bgAudioContext = new (window.AudioContext || window.webkitAudioContext)();

//buffer and gain to be fetched on fetchAudioBuffer()
let bgMusicXBuffer;
let bgMusicGN;
let bgMusicGNDefVol = 0.7;
let bgMusicBFSource;
let isOnMute = false;

export function playBGSound() {
  if (bgMusicXBuffer === null) return;

  bgMusicBFSource = playBuffer(bgAudioContext, bgMusicXBuffer, bgMusicGN);
}

export function loopFirstDrop() {
  if (bgMusicBFSource === null) return;

  console.log("first loop");
  bgMusicBFSource.loop = true;
  bgMusicBFSource.loopStart = 47.49;
  bgMusicBFSource.loopEnd = 63.49;
  //total loop time is 16
}

export function endBGMusicLoop() {
  if (bgMusicBFSource === null) return;
  console.log("end loop");

  bgMusicBFSource.loop = false;
}

// END - Sound setup for background music
//

//
// Sound setup for player ammo sfx
//

  //buffer and gain to be fetched on fetchAudioBuffer()
let playerAmmoSFXBuffer;
let playerAmmoGN;
const playerAmmoGNDefVol = 0.2;

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

    //buffer and gain to be fetched on fetchAudioBuffer()
let droneAmmoSFXBuffer;
let droneAmmoGN;
const droneAmmoGNDefVol = 0.4;

export function playDroneLaserSound() {
  if (!droneAmmoSFXBuffer) return;
  playBuffer(audioContext, droneAmmoSFXBuffer, droneAmmoGN);
}
//
// END - Sound setup for drone ammo sfx
//

export function startAudio() {
  audioContext?.resume();
  bgAudioContext?.resume();
}

export function toggleSound() {
  isOnMute = !isOnMute;

  if(isOnMute){
    droneAmmoGN.gain.setValueAtTime(0, audioContext.currentTime);
    playerAmmoGN.gain.setValueAtTime(0, audioContext.currentTime);
    bgMusicGN.gain.setValueAtTime(0, bgAudioContext.currentTime);
  } else {
    droneAmmoGN.gain.setValueAtTime(droneAmmoGNDefVol, audioContext.currentTime);
    playerAmmoGN.gain.setValueAtTime(playerAmmoGNDefVol, audioContext.currentTime);
    bgMusicGN.gain.setValueAtTime(bgMusicGNDefVol, bgAudioContext.currentTime);
  }
}

export function pauseAudio() {
  audioContext?.suspend();
  bgAudioContext?.suspend();
}

export function stopAudio() {
  bgMusicBFSource?.stop();
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

export async function fetchAudioSources() {
  // fetch sources for bachgroun music
  bgMusicXBuffer = await fetchData(
    bgAudioContext,
    "./sounds/space-background.mp3"
  );
  bgMusicGN = createGain(bgAudioContext, bgMusicGNDefVol); // Set the volume
  // END -  fetch sources for bachgroun music

  // fetch sources for player ammo sfx
  playerAmmoSFXBuffer = await fetchData(
    audioContext,
    "./sounds/player-ammo-sfx.wav"
  );
  playerAmmoGN = createGain(audioContext, playerAmmoGNDefVol); // Set the volume
  // END - fetch sources for player ammo sfx

  // fetch sources for drone ammo sfx
  droneAmmoSFXBuffer = await fetchData(
    audioContext,
    "./sounds/player-ammo-sfx.wav"
  );
  droneAmmoGN = createGain(audioContext, droneAmmoGNDefVol); // Set the volume
  // END - fetch sources for drone ammo sfx

}
