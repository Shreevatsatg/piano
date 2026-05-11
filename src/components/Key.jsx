import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const Key = ({ note, type, isActive, keyLabel, onPlay, onRelease, onMouseEnter }) => {
  const isBlack = type === 'black';

  return (
    <motion.button
      onMouseDown={() => onPlay(note)}
      onMouseUp={() => onRelease(note)}
      onMouseLeave={() => onRelease(note)}
      onMouseEnter={() => onMouseEnter(note)}
      onTouchStart={(e) => {
        e.preventDefault(); // Prevent scrolling
        onPlay(note);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onRelease(note);
      }}
      className={cn(
        "relative rounded-b-md select-none transition-all duration-75 flex flex-col justify-end items-center pb-4",
        isBlack 
          ? "bg-piano-key-black text-white z-10 w-10 h-40 -mx-5 shadow-key-black" 
          : "bg-piano-key-white text-zinc-600 z-0 w-16 h-64 shadow-key-white",
        isActive && isBlack && "bg-piano-key-activeBlack h-[9.8rem] shadow-key-black-active shadow-glow z-20",
        isActive && !isBlack && "bg-piano-key-activeWhite h-[15.8rem] shadow-key-white-active shadow-glow z-20"
      )}
      style={isBlack ? { marginLeft: '-1.25rem', marginRight: '-1.25rem' } : {}}
      whileTap={!isActive ? { scale: 0.98 } : {}}
    >
      <div className={cn(
        "font-semibold text-xs tracking-widest pointer-events-none transition-opacity",
        isActive ? "opacity-100" : "opacity-40",
        isBlack ? "text-zinc-300" : "text-zinc-400"
      )}>
        {keyLabel}
      </div>
      {!isBlack && (
        <div className={cn(
          "text-[10px] pointer-events-none mt-1 opacity-20",
          isActive && "opacity-60 text-piano-accent"
        )}>
          {note}
        </div>
      )}
    </motion.button>
  );
};
