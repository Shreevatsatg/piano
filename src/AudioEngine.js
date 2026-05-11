import * as Tone from 'tone';

class AudioEngine {
  constructor() {
    this.synth = null;
    this.isInitialized = false;
    this.currentSynthType = 'poly';
  }

  async initialize() {
    if (this.isInitialized) return;
    // Minimize audio latency
    Tone.getContext().lookAhead = 0;
    Tone.getContext().latencyHint = 'interactive';
    await Tone.start();

    this.volume = new Tone.Volume(-6).toDestination();
    this.reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.01, wet: 0.18 }).connect(this.volume);
    await this.reverb.ready;

    this.setupSynth(this.currentSynthType);
    this.isInitialized = true;
  }

  setupSynth(type) {
    if (this.synth) this.synth.dispose();

    const dest = this.reverb ?? Tone.getDestination();

    const envelope = { attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.8 };

    switch (type) {
      case 'am':
        this.synth = new Tone.PolySynth(Tone.AMSynth, { envelope }).connect(dest);
        break;
      case 'fm':
        this.synth = new Tone.PolySynth(Tone.FMSynth, { envelope }).connect(dest);
        break;
      case 'duo':
        this.synth = new Tone.PolySynth(Tone.DuoSynth).connect(dest);
        break;
      default:
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope,
        }).connect(dest);
    }
    this.synth.volume.value = -6;
  }

  setSynthType(type) {
    this.currentSynthType = type;
    if (this.isInitialized) this.setupSynth(type);
  }

  // value: 0–1 mapped to -40dB–0dB (perceptual log curve)
  setVolume(value) {
    if (!this.volume) return;
    this.volume.volume.value = value === 0 ? -Infinity : -40 + value * 40;
  }

  playNote(note) {
    if (!this.isInitialized || !this.synth) return;
    this.synth.triggerAttack(note, Tone.now());
  }

  releaseNote(note) {
    if (!this.isInitialized || !this.synth) return;
    this.synth.triggerRelease(note, Tone.now());
  }
}

export const audioEngine = new AudioEngine();
