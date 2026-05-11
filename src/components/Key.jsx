import { cn } from '../lib/utils';

export const Key = ({ note, type, isActive, keyLabel, onPlay, onRelease, isMouseDown }) => {
  const isBlack = type === 'black';

  return (
    <button
      onMouseDown={() => onPlay(note)}
      onMouseUp={() => onRelease(note)}
      onMouseLeave={() => onRelease(note)}
      onMouseEnter={() => isMouseDown && onPlay(note)}
      onTouchStart={(e) => { e.preventDefault(); onPlay(note); }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease(note); }}
      className={cn(
        'relative select-none outline-none transition-all duration-75 flex flex-col justify-end items-center',
        isBlack
          ? cn(
              'z-10 -mx-[0.9rem] w-9 h-36 rounded-b-lg pb-3',
              'bg-gradient-to-b from-zinc-700 to-zinc-900 border border-zinc-950 border-t-zinc-600',
              'shadow-[0_6px_12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]',
              isActive
                ? 'from-sky-700 to-sky-900 border-sky-800 shadow-[0_2px_6px_rgba(0,0,0,0.8),0_0_12px_rgba(14,165,233,0.5),inset_0_2px_4px_rgba(0,0,0,0.4)] translate-y-0.5'
                : 'hover:from-zinc-600 hover:to-zinc-800'
            )
          : cn(
              'z-0 w-14 h-56 rounded-b-xl pb-4 border border-zinc-300/20',
              'bg-gradient-to-b from-zinc-50 to-zinc-200',
              'shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)]',
              isActive
                ? 'from-sky-100 to-sky-200 border-sky-300/40 shadow-[0_1px_4px_rgba(0,0,0,0.3),0_0_16px_rgba(14,165,233,0.35),inset_0_2px_4px_rgba(14,165,233,0.2)] translate-y-0.5'
                : 'hover:from-white hover:to-zinc-100'
            )
      )}
    >
      <span className={cn(
        'text-[10px] font-bold tracking-widest pointer-events-none transition-opacity',
        isBlack
          ? cn('text-zinc-400', isActive && 'text-sky-300 opacity-100')
          : cn('text-zinc-400', isActive && 'text-sky-500 opacity-100'),
        !isActive && 'opacity-50'
      )}>
        {keyLabel}
      </span>
      {!isBlack && (
        <span className={cn(
          'text-[9px] pointer-events-none mt-0.5 transition-opacity opacity-20',
          isActive && 'opacity-50 text-sky-500'
        )}>
          {note}
        </span>
      )}
    </button>
  );
};
