import * as Tone from 'tone';

class AudioEngine {
  constructor() {
    this.sampler = null;
    this.volume = null;
    this.reverb = null;
    this.isInitialized = false;
    this._initPromise = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      await Tone.start();
      Tone.getContext().lookAhead = 0;

      this.volume = new Tone.Volume(-6).toDestination();
      this.reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.01, wet: 0.22 }).connect(this.volume);
      await this.reverb.ready;

      await new Promise((resolve) => {
        this.sampler = new Tone.Sampler({
          urls: {
            C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', A4: 'A4.mp3',
            C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', A5: 'A5.mp3',
          },
          baseUrl: 'https://tonejs.github.io/audio/salamander/',
          onload: resolve,
          onerror: () => {
            // fallback to synth if samples fail to load
            this.sampler = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: 'triangle8' },
              envelope: { attack: 0.006, decay: 0.8, sustain: 0.1, release: 2.5 },
            });
            resolve();
          },
        }).connect(this.reverb);
      });

      this.isInitialized = true;
    })();

    return this._initPromise;
  }

  setVolume(value) {
    if (!this.volume) return;
    this.volume.volume.value = value === 0 ? -Infinity : -40 + value * 40;
  }

  playNote(note) {
    if (!this.isInitialized || !this.sampler) return;
    this.sampler.triggerAttack(note, Tone.now());
  }

  releaseNote(note) {
    if (!this.isInitialized || !this.sampler) return;
    this.sampler.triggerRelease(note, Tone.now());
  }

  // For auto-play: schedule a full note with duration
  scheduleNote(note, time, duration = '8n') {
    if (!this.isInitialized || !this.sampler) return;
    this.sampler.triggerAttackRelease(note, duration, time);
  }
}

export const audioEngine = new AudioEngine();
