import { useState, useEffect, useCallback, useRef } from 'react';
import { Key } from './Key';
import { PIANO_KEYS } from '../constants/pianoKeys';
import { SONGS } from '../constants/songs';
import { audioEngine } from '../AudioEngine';
import { Volume2, VolumeX, Play, Square, BookOpen, Music2 } from 'lucide-react';
import * as Tone from 'tone';

export const Piano = () => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [prevVolume, setPrevVolume] = useState(0.75);
  const [started, setStarted] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [mode, setMode] = useState(null); // 'play' | 'guide' | null
  const [guideStep, setGuideStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const initRef = useRef(false);
  const activeNotesRef = useRef(new Set());
  const autoPlayRef = useRef(null); // holds timeout ids

  const initAudio = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;
    await audioEngine.initialize();
    audioEngine.setVolume(0.75);
    setStarted(true);
  }, []);

  const playNote = useCallback(async (note) => {
    if (activeNotesRef.current.has(note)) return;
    await initAudio();
    activeNotesRef.current.add(note);
    audioEngine.playNote(note);
    setActiveNotes(new Set(activeNotesRef.current));
  }, [initAudio]);

  const releaseNote = useCallback((note) => {
    if (!activeNotesRef.current.has(note)) return;
    activeNotesRef.current.delete(note);
    audioEngine.releaseNote(note);
    setActiveNotes(new Set(activeNotesRef.current));
  }, []);

  // ── Auto-play a song ──────────────────────────────────────────────
  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current.forEach(clearTimeout);
      autoPlayRef.current = null;
    }
    // release any held notes
    activeNotesRef.current.forEach(n => audioEngine.releaseNote(n));
    activeNotesRef.current.clear();
    setActiveNotes(new Set());
    setIsPlaying(false);
  }, []);

  const startAutoPlay = useCallback(async (song) => {
    await initAudio();
    stopAutoPlay();
    setIsPlaying(true);
    let elapsed = 0;
    const ids = [];
    song.steps.forEach(({ note, dur }) => {
      const onId = setTimeout(() => {
        activeNotesRef.current.add(note);
        audioEngine.playNote(note);
        setActiveNotes(new Set(activeNotesRef.current));
      }, elapsed * 1000);
      const offId = setTimeout(() => {
        activeNotesRef.current.delete(note);
        audioEngine.releaseNote(note);
        setActiveNotes(new Set(activeNotesRef.current));
      }, (elapsed + dur * 0.85) * 1000);
      ids.push(onId, offId);
      elapsed += dur + 0.05;
    });
    const doneId = setTimeout(() => setIsPlaying(false), elapsed * 1000);
    ids.push(doneId);
    autoPlayRef.current = ids;
  }, [initAudio, stopAutoPlay]);

  // ── Guide mode: advance on correct keypress ───────────────────────
  const guideStepRef = useRef(0);

  useEffect(() => {
    guideStepRef.current = guideStep;
  }, [guideStep]);

  useEffect(() => {
    if (mode !== 'guide' || !selectedSong) return;
    const onKeyDown = async (e) => {
      if (e.repeat) return;
      const k = PIANO_KEYS.find(k => k.keyboardKey === e.key.toLowerCase());
      if (!k) return;
      const step = selectedSong.steps[guideStepRef.current];
      if (!step) return;
      await playNote(k.note);
      if (k.note === step.note) {
        const next = guideStepRef.current + 1;
        if (next >= selectedSong.steps.length) {
          setGuideStep(0);
        } else {
          setGuideStep(next);
        }
      }
    };
    const onKeyUp = (e) => {
      const k = PIANO_KEYS.find(k => k.keyboardKey === e.key.toLowerCase());
      if (k) releaseNote(k.note);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [mode, selectedSong, playNote, releaseNote]);

  // ── Normal keyboard handler (when not in guide mode) ──────────────
  useEffect(() => {
    if (mode === 'guide') return;
    const onKeyDown = (e) => {
      if (e.repeat) return;
      const k = PIANO_KEYS.find(k => k.keyboardKey === e.key.toLowerCase());
      if (k) playNote(k.note);
    };
    const onKeyUp = (e) => {
      const k = PIANO_KEYS.find(k => k.keyboardKey === e.key.toLowerCase());
      if (k) releaseNote(k.note);
    };
    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [mode, playNote, releaseNote]);

  const handleVolumeChange = (val) => {
    setVolume(val);
    audioEngine.setVolume(val);
  };

  const toggleMute = () => {
    if (volume > 0) { setPrevVolume(volume); handleVolumeChange(0); }
    else handleVolumeChange(prevVolume || 0.75);
  };

  const handleSelectSong = (song) => {
    stopAutoPlay();
    setMode(null);
    setGuideStep(0);
    setSelectedSong(song);
  };

  const handlePlay = () => {
    if (isPlaying) { stopAutoPlay(); return; }
    if (!selectedSong) return;
    setMode('play');
    startAutoPlay(selectedSong);
  };

  const handleGuide = () => {
    stopAutoPlay();
    if (mode === 'guide') { setMode(null); return; }
    setMode('guide');
    setGuideStep(0);
  };

  const guideNote = mode === 'guide' && selectedSong ? selectedSong.steps[guideStep]?.note : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col gap-4 w-full max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/60 px-6 py-3 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <span className="text-sm font-semibold tracking-widest text-zinc-100 uppercase">Virtuoso</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950/60 px-4 py-2 rounded-xl border border-zinc-800/50">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-zinc-200 transition-colors">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-slider w-28"
              style={{ '--val': Math.round(volume * 100) }}
            />
            <span className="text-xs text-zinc-500 w-8 text-right tabular-nums">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Songs panel */}
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Music2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Songs</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SONGS.map(song => (
              <button
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                  selectedSong?.id === song.id
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                    : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                }`}
              >
                <span className="font-semibold">{song.title}</span>
                <span className="ml-1.5 opacity-60">{song.artist}</span>
              </button>
            ))}
          </div>

          {selectedSong && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-800/60">
              <span className="text-xs text-zinc-500 flex-1">
                {mode === 'guide'
                  ? `Guide mode — press the glowing key  (${guideStep + 1} / ${selectedSong.steps.length})`
                  : mode === 'play' && isPlaying
                  ? 'Playing…'
                  : `${selectedSong.title} selected`}
              </span>
              <button
                onClick={handlePlay}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isPlaying
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                    : 'bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30'
                }`}
              >
                {isPlaying ? <><Square className="w-3 h-3" /> Stop</> : <><Play className="w-3 h-3" /> Play</>}
              </button>
              <button
                onClick={handleGuide}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                  mode === 'guide'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                {mode === 'guide' ? 'Stop Guide' : 'Guide'}
              </button>
            </div>
          )}
        </div>

        {/* Piano */}
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-2xl p-6 pb-8">
          {!started && (
            <p className="text-center text-xs text-sky-400/60 animate-pulse mb-4 tracking-wider">
              CLICK A KEY OR PRESS A KEYBOARD KEY TO BEGIN
            </p>
          )}
          <div
            className="flex justify-center relative select-none touch-none"
            onMouseLeave={() => { activeNotes.forEach(n => releaseNote(n)); setIsMouseDown(false); }}
          >
            {PIANO_KEYS.map((keyObj) => (
              <Key
                key={keyObj.note}
                note={keyObj.note}
                type={keyObj.type}
                keyLabel={keyObj.keyLabel}
                isActive={activeNotes.has(keyObj.note)}
                isGuide={guideNote === keyObj.note}
                onPlay={playNote}
                onRelease={releaseNote}
                isMouseDown={isMouseDown}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700 tracking-wide">
          A S D F G H J K L · W E T Y U O P · black keys
        </p>
      </div>
    </div>
  );
};
