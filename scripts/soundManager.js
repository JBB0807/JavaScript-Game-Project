export const audioContext = new (window.AudioContext ||
  window.webkitAudioContext)();


//
// Sound setup for gameplay music
//
let gamePlayBuff = await fetchData("./sounds/space-background.mp3");
let gamePlaykGN = createGain(.5); // Set the volume

export function playgamePlaySound() {
  if (!gamePlayBuff) return;
  playBuffer(gamePlayBuff, gamePlaykGN);
}
//
// END - Sound setup for drone ammo sfx
//

//
// Sound setup for player ammo sfx
//
let playerAmmoSFXBuffer = await fetchData("./sounds/player-ammo-sfx.wav");
let playerAmmoGN = createGain(0.2); // Set the volume

export function playPlayerLaserSound() {
  if (!playerAmmoSFXBuffer) return;
  playBuffer(playerAmmoSFXBuffer, playerAmmoGN);
}
//
// END - Sound setup for player ammo sfx
//

//
// Sound setup for drome ammo sfx
//
let droneAmmoSFXBuffer = await fetchData("./sounds/player-ammo-sfx.wav");
let droneAmmoGN = createGain(0.4); // Set the volume

export function playDroneLaserSound() {
  if (!droneAmmoSFXBuffer) return;
  playBuffer(droneAmmoSFXBuffer, droneAmmoGN);
}
//
// END - Sound setup for drone ammo sfx
//

export function enableAudio() {
    audioContext.resume();
}

export function pauseAudio() {

}

export function disableAudio() {
    audioContext.suspend();
}


async function fetchData(media) {
  return fetch(media)
  .then((response) => response.arrayBuffer())
  .then((data) => audioContext.decodeAudioData(data))
  .then((buffer) => {
    return buffer;
  });
}

// Create a GainNode for volume control
function createGain(volume) {
  let objGain = audioContext.createGain(); 
  objGain.connect(audioContext.destination); // Connect GainNode to the destination
  objGain.gain.value = volume; // Set the volume
  return objGain;
  
}

function playBuffer(buffer, gain){
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start(0); // Play immediately
}