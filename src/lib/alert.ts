// A short beep (and a buzz where supported) for when rest is over.
//
// Browsers only allow sound after the user has tapped something, so call
// unlockSound() from a tap (ticking a set) before relying on alertRestOver().
// iPhones don't support vibration from web apps, and the silent switch mutes
// the beep, so the timer bar also shows the moment visually.

let audio: AudioContext | null = null;

export function unlockSound() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    // No Web Audio — the visual alert still works
  }
}

export function alertRestOver() {
  navigator.vibrate?.([200, 100, 200]);
  if (!audio) return;
  // Three short high beeps
  for (let i = 0; i < 3; i++) {
    const start = audio.currentTime + i * 0.25;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  }
}
