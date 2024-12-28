export const audioContext = new (window.AudioContext ||
  window.webkitAudioContext)();

//
// Sound setup for player ammo sfx
//
let playerAmmoSFXBuffer;
fetch("./sounds/player-ammo-sfx.wav")
  .then((response) => response.arrayBuffer())
  .then((data) => audioContext.decodeAudioData(data))
  .then((buffer) => {
    playerAmmoSFXBuffer = buffer;
  });

let playerAmmoGN = audioContext.createGain(); // Create a GainNode for volume control
playerAmmoGN.connect(audioContext.destination); // Connect GainNode to the destination
playerAmmoGN.gain.value = 0.2; // Set the volume

export function playLaserSound() {
  if (!playerAmmoSFXBuffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = playerAmmoSFXBuffer;
  source.connect(playerAmmoGN);
  source.start(0); // Play immediately
}
//
// END - Sound setup for player ammo sfx
//



export function enableAudio() {
    audioContext.resume();
}

export function pauseAudio() {

}

export function disableAudio() {
    audioContext.suspend();
}