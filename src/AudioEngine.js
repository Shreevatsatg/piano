import * as Tone from 'tone';

class AudioEngine {
  constructor() {
    this.synth = null;
    this.isInitialized = false;
    this.currentSynthType = 'poly';
    this.volume = new Tone.Volume(0).toDestination();
    this.reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.1, wet: 0.3 }).connect(this.volume);
    this.delay = new Tone.FeedbackDelay("8n", 0.2).connect(this.reverb);
  }

  async initialize() {
    if (this.isInitialized) return;
    await Tone.start();
    this.setupSynth(this.currentSynthType);
    this.isInitialized = true;
  }

  setupSynth(type) {
    if (this.synth) {
      this.synth.dispose();
    }

    switch (type) {
      case 'am':
        this.synth = new Tone.PolySynth(Tone.AMSynth).connect(this.delay);
        break;
      case 'fm':
        this.synth = new Tone.PolySynth(Tone.FMSynth).connect(this.delay);
        break;
      case 'duo':
        this.synth = new Tone.PolySynth(Tone.DuoSynth).connect(this.delay);
        break;
      case 'poly':
      default:
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }).connect(this.delay);
        break;
    }
    
    // Set a lower volume for the synth to prevent clipping when playing chords
    this.synth.volume.value = -8; 
  }

  setSynthType(type) {
    this.currentSynthType = type;
    if (this.isInitialized) {
      this.setupSynth(type);
    }
  }

  setVolume(value) {
    // value from 0 to 1
    // convert to decibels: 0 -> -60, 1 -> 0
    if (value === 0) {
      this.volume.volume.value = -Infinity;
    } else {
      this.volume.volume.value = 20 * Math.log10(value);
    }
  }

  playNote(note) {
    if (!this.isInitialized || !this.synth) return;
    this.synth.triggerAttack(note);
  }

  releaseNote(note) {
    if (!this.isInitialized || !this.synth) return;
    this.synth.triggerRelease(note);
  }
}

export const audioEngine = new AudioEngine();
