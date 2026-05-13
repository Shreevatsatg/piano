import { useState, useEffect, useCallback, useRef } from 'react';
import { Key } from './Key';
import { PIANO_KEYS } from '../constants/pianoKeys';
import { SONGS } from '../constants/songs';
import { audioEngine } from '../AudioEngine';
import { Volume2, VolumeX, Play, Square, BookOpen, Music2, ChevronDown } from 'lucide-react';

export const Piano = () => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [prevVolume, setPrevVolume] = useState(0.75);
  const [started, setStarted] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [mode, setMode] = useState(null);
  const [guideStep, setGuideStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songsOpen, setSongsOpen] = useState(false);

  const initRef = useRef(false);
  const activeNotesRef = useRef(new Set());
  const autoPlayRef = useRef(null);
  const guideStepRef = useRef(0);

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

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current.forEach(clearTimeout);
      autoPlayRef.current = null;
    }
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
      ids.push(setTimeout(() => {
        activeNotesRef.current.add(note);
        audioEngine.playNote(note);
        setActiveNotes(new Set(activeNotesRef.current));
      }, elapsed * 1000));
      ids.push(setTimeout(() => {
        activeNotesRef.current.delete(note);
        audioEngine.releaseNote(note);
        setActiveNotes(new Set(activeNotesRef.current));
      }, (elapsed + dur * 0.85) * 1000));
      elapsed += dur + 0.05;
    });
    ids.push(setTimeout(() => setIsPlaying(false), elapsed * 1000));
    autoPlayRef.current = ids;
  }, [initAudio, stopAutoPlay]);

  useEffect(() => { guideStepRef.current = guideStep; }, [guideStep]);

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
        setGuideStep(next >= selectedSong.steps.length ? 0 : next);
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

  const handleVolumeChange = (val) => { setVolume(val); audioEngine.setVolume(val); };
  const toggleMute = () => {
    if (volume > 0) { setPrevVolume(volume); handleVolumeChange(0); }
    else handleVolumeChange(prevVolume || 0.75);
  };
  const handleSelectSong = (song) => {
    stopAutoPlay(); setMode(null); setGuideStep(0); setSelectedSong(song);
  };

  const guideNote = mode === 'guide' && selectedSong ? selectedSong.steps[guideStep]?.note : null;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-8 px-4 w-full relative">

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-sky-600/6 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 w-full max-w-[1100px]">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-7 py-4 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-sky-400" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-sky-400 animate-ping opacity-40" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-[0.2em] text-white uppercase">piano</h1>
              <h2 className="text-[10px] text-zinc-500 tracking-widest uppercase">Virtual Piano</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume control */}
            <div className="flex items-center gap-3 bg-zinc-950/70 px-5 py-2.5 rounded-xl border border-white/5">
              <button onClick={toggleMute} className="transition-colors hover:scale-110 active:scale-95">
                {volume === 0
                  ? <VolumeX className="w-4 h-4 text-zinc-500" />
                  : <Volume2 className="w-4 h-4 text-sky-400" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="volume-slider w-32"
                style={{ '--val': Math.round(volume * 100) }}
              />
              <span className="text-xs font-mono text-zinc-400 w-9 text-right">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </header>

        {/* ── Songs Panel (collapsible) ── */}
        <section className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl" aria-label="Song Library">

          {/* Accordion trigger */}
          <button
            onClick={() => setSongsOpen(o => !o)}
            className="w-full flex items-center justify-between px-7 py-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Music2 className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold text-zinc-200 tracking-wider uppercase">Songs</span>
              {mode === 'guide' && selectedSong && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[11px] font-medium animate-pulse">
                  Guide · {guideStep + 1} / {selectedSong.steps.length}
                </span>
              )}
              {isPlaying && (
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-400 text-[11px] font-medium animate-pulse">
                  Playing · {selectedSong?.title}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${songsOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Accordion body */}
          <div className={`songs-panel ${songsOpen ? 'songs-panel-open' : ''}`}>
            <div className="border-t border-white/5 divide-y divide-white/5">
              {SONGS.map((song) => {
                const isSelected = selectedSong?.id === song.id;
                const isThisPlaying = isSelected && isPlaying;
                const isThisGuide = isSelected && mode === 'guide';
                return (
                  <div
                    key={song.id}
                    className={`flex items-center gap-4 px-7 py-4 transition-colors ${
                      isSelected ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Index dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isThisGuide ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' :
                      isThisPlaying ? 'bg-sky-400 shadow-[0_0_6px_rgba(14,165,233,0.8)] animate-pulse' :
                      isSelected ? 'bg-sky-500' : 'bg-zinc-700'
                    }`} />

                    {/* Song info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-white' : 'text-zinc-300'
                      }`}>{song.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{song.artist} · {song.steps.length} notes</p>
                    </div>

                    {/* Guide progress bar (only when active guide) */}
                    {isThisGuide && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-200"
                            style={{ width: `${((guideStep) / song.steps.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono w-10">
                          {guideStep}/{song.steps.length}
                        </span>
                      </div>
                    )}

                    {/* Play button */}
                    <button
                      onClick={() => {
                        if (!isSelected) handleSelectSong(song);
                        if (isThisPlaying) { stopAutoPlay(); return; }
                        setMode('play');
                        startAutoPlay(song);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex-shrink-0 ${
                        isThisPlaying
                          ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                          : 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/40'
                      }`}
                    >
                      {isThisPlaying
                        ? <><Square className="w-3 h-3" /> Stop</>
                        : <><Play className="w-3 h-3" /> Play</>}
                    </button>

                    {/* Guide button */}
                    <button
                      onClick={() => {
                        if (!isSelected) handleSelectSong(song);
                        if (isThisGuide) { setMode(null); return; }
                        stopAutoPlay();
                        setSelectedSong(song);
                        setMode('guide');
                        setGuideStep(0);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex-shrink-0 ${
                        isThisGuide
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-zinc-800/60 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      {isThisGuide ? 'Stop' : 'Guide'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Piano body ── */}
        <section className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/5 shadow-2xl" aria-label="Interactive Piano">
          {/* Piano top rail */}
          <div className="px-8 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
            {!started && (
              <p className="text-[11px] text-sky-400/60 animate-pulse tracking-widest uppercase">
                Click a key or press keyboard to begin
              </p>
            )}
            <div className="text-[10px] text-zinc-600 tracking-widest uppercase">
              {mode === 'guide' && selectedSong
                ? <span className="text-emerald-500">● Guide Mode</span>
                : mode === 'play' && isPlaying
                ? <span className="text-sky-500">● Playing</span>
                : 'Free Play'}
            </div>
          </div>

          {/* Keys */}
          <div className="px-8 py-6">
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

          {/* Piano bottom rail */}
          <div className="px-8 pb-4 flex justify-center">
            <p className="text-[11px] text-zinc-700 tracking-[0.2em] uppercase">
              A · S · D · F · G · H · J · K · L &nbsp;|&nbsp; W · E · T · Y · U · O · P
            </p>
          </div>
        </section>

      </div>
    </main>
  );
};
