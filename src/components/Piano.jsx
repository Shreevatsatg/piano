import { useState, useEffect, useCallback, useRef } from 'react';
import { Key } from './Key';
import { PIANO_KEYS } from '../constants/pianoKeys';
import { audioEngine } from '../AudioEngine';
import { Volume2, VolumeX, Music } from 'lucide-react';

const SYNTH_TYPES = [
  { id: 'poly', label: 'Grand' },
  { id: 'am', label: 'AM' },
  { id: 'fm', label: 'FM' },
  { id: 'duo', label: 'Duo' },
];

export const Piano = () => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [prevVolume, setPrevVolume] = useState(0.75);
  const [synthType, setSynthType] = useState('poly');
  const [started, setStarted] = useState(false);
  const initRef = useRef(false);

  const initAudio = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;
    await audioEngine.initialize();
    audioEngine.setVolume(0.75);
    setStarted(true);
  }, []);

  const activeNotesRef = useRef(new Set());

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

  useEffect(() => {
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
  }, [playNote, releaseNote]);

  const handleVolumeChange = (val) => {
    setVolume(val);
    audioEngine.setVolume(val);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      handleVolumeChange(0);
    } else {
      handleVolumeChange(prevVolume || 0.75);
    }
  };

  const handleSynthChange = (type) => {
    setSynthType(type);
    audioEngine.setSynthType(type);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/8 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col gap-6 w-full max-w-5xl">
        {/* Header panel */}
        <div className="flex items-center justify-between bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/60 px-6 py-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <span className="text-base font-semibold tracking-widest text-zinc-100 uppercase">Virtuoso</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Synth selector */}
            <div className="flex gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/50">
              {SYNTH_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSynthChange(t.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-150 ${
                    synthType === t.id
                      ? 'bg-sky-500 text-white shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 bg-zinc-950/60 px-4 py-2 rounded-xl border border-zinc-800/50">
              <button onClick={toggleMute} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="volume-slider w-28"
                style={{ '--val': Math.round(volume * 100) }}
              />
              <span className="text-xs text-zinc-500 w-8 text-right tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Piano body */}
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-2xl p-6 pb-8">
          {!started && (
            <p className="text-center text-xs text-sky-400/70 animate-pulse mb-4 tracking-wider">
              CLICK A KEY OR PRESS A KEYBOARD KEY TO BEGIN
            </p>
          )}
          <div
            className="flex justify-center relative select-none touch-none"
            onMouseLeave={() => {
              activeNotes.forEach(n => releaseNote(n));
              setIsMouseDown(false);
            }}
          >
            {PIANO_KEYS.map((keyObj) => (
              <Key
                key={keyObj.note}
                note={keyObj.note}
                type={keyObj.type}
                keyLabel={keyObj.keyLabel}
                isActive={activeNotes.has(keyObj.note)}
                onPlay={playNote}
                onRelease={releaseNote}
                isMouseDown={isMouseDown}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700 tracking-wide">
          A S D F G H J K L &nbsp;·&nbsp; W E T Y U O P &nbsp;·&nbsp; black keys
        </p>
      </div>
    </div>
  );
};
