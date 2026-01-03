// Synthesized Sound Effects using Web Audio API
// No external assets required!

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (freq, type, duration) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

export const playSuccessSound = () => {
    // High pitched "Ding!"
    playTone(800, 'sine', 0.1);
    setTimeout(() => playTone(1200, 'sine', 0.2), 100);
};

export const playErrorSound = () => {
    // Low pitched "Buzz"
    playTone(150, 'sawtooth', 0.1);
    setTimeout(() => playTone(100, 'sawtooth', 0.2), 100);
};

export const playCoinSound = () => {
    // Mario-like coin sound
    playTone(900, 'square', 0.1);
    setTimeout(() => playTone(1400, 'square', 0.2), 80);
};

export const playLevelUpSound = () => {
    // Victory fanfare logic (simplified)
    const melody = [523, 659, 784, 1046]; // C E G C
    melody.forEach((note, i) => {
        setTimeout(() => playTone(note, 'triangle', 0.2), i * 150);
    });
};
