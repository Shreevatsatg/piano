import { useState, useEffect, useCallback } from 'react';
import { Key } from './Key';
import { PIANO_KEYS, calculateKeyPositions } from '../constants/pianoKeys';
import { audioEngine } from '../AudioEngine';
import { Volume2, VolumeX, Music, Activity } from 'lucide-react';

const SYNTH_TYPES = [
  { id: 'poly', label: 'Classic Synth' },
  { id: 'am', label: 'AM Synth' },
  { id: 'fm', label: 'FM Synth' },
  { id: 'duo', label: 'Duo Synth' },
];

export const Piano = () => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [synthType, setSynthType] = useState('poly');
  const [hasInteracted, setHasInteracted] = useState(false);

  const keysWithPositions = calculateKeyPositions(PIANO_KEYS);

  // Initialize audio engine on first interaction
  const initAudio = async () => {
    if (!hasInteracted) {
      await audioEngine.initialize();
      setHasInteracted(true);
    }
  };

  const playNote = useCallback((note) => {
    initAudio();
    setActiveNotes((prev) => {
      const next = new Set(prev);
      if (!next.has(note)) {
        next.add(note);
        audioEngine.playNote(note);
      }
      return next;
    });
  }, [hasInteracted]);

  const releaseNote = useCallback((note) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      if (next.has(note)) {
        next.delete(note);
        audioEngine.releaseNote(note);
      }
      return next;
    });
  }, []);

  const handleMouseEnter = (note) => {
    if (isMouseDown) {
      playNote(note);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return; // Prevent retriggers on key hold
      const keyObj = PIANO_KEYS.find(k => k.keyboardKey === e.key.toLowerCase());
      if (keyObj) {
        playNote(keyObj.note);
      }
    };

    const handleKeyUp = (e) => {
      const keyObj = PIANO_KEYS.find(k => k.keyboardKey === e.key.toLowerCase());
      if (keyObj) {
        releaseNote(keyObj.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', () => setIsMouseDown(true));
    window.addEventListener('mouseup', () => setIsMouseDown(false));

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', () => setIsMouseDown(true));
      window.removeEventListener('mouseup', () => setIsMouseDown(false));
    };
  }, [playNote, releaseNote]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.setSynthType(synthType);
  }, [synthType]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 w-full relative">
      
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl z-10 flex flex-col gap-8 w-full max-w-5xl">
        
        {/* Top Control Panel */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Virtuoso
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Synth Type Selector */}
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <Music className="w-4 h-4 text-zinc-400" />
              <select 
                value={synthType}
                onChange={(e) => setSynthType(e.target.value)}
                className="bg-transparent text-sm text-zinc-300 outline-none border-none cursor-pointer"
              >
                {SYNTH_TYPES.map(type => (
                  <option key={type.id} value={type.id} className="bg-zinc-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-400" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Piano Keyboard */}
        <div className="flex justify-center relative select-none touch-none px-4"
             onMouseLeave={() => {
               activeNotes.forEach(note => releaseNote(note));
               setIsMouseDown(false);
             }}>
          {keysWithPositions.map((keyObj) => (
            <Key
              key={keyObj.note}
              note={keyObj.note}
              type={keyObj.type}
              keyLabel={keyObj.keyLabel}
              isActive={activeNotes.has(keyObj.note)}
              onPlay={playNote}
              onRelease={releaseNote}
              onMouseEnter={handleMouseEnter}
            />
          ))}
        </div>
        
        {/* Footer info */}
        <div className="text-center text-xs text-zinc-600">
          {!hasInteracted && <p className="animate-pulse text-sky-400/80 mb-1">Click anywhere or press a key to start</p>}
          <p>Use your keyboard or mouse to play. Mapped from A to '.</p>
        </div>
      </div>
    </div>
  );
};
