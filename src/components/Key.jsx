import { cn } from '../lib/utils';

export const Key = ({ note, type, isActive, isGuide, keyLabel, onPlay, onRelease, isMouseDown }) => {
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
        'relative select-none outline-none flex flex-col justify-end items-center transition-all duration-75',
        isBlack
          ? cn(
              'z-10 w-11 h-44 -mx-[1.1rem] rounded-b-xl pb-4',
              'border border-black/80',
              'shadow-[0_8px_16px_rgba(0,0,0,0.8),0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-4px_8px_rgba(0,0,0,0.5)]',
              !isActive && !isGuide && 'bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0d0d0d] hover:from-[#333] hover:via-[#222] hover:to-[#111]',
              isActive && 'bg-gradient-to-b from-sky-600 via-sky-800 to-sky-950 border-sky-700/50 shadow-[0_4px_8px_rgba(0,0,0,0.9),0_0_20px_rgba(14,165,233,0.5),inset_0_2px_6px_rgba(0,0,0,0.5)] translate-y-1',
              isGuide && !isActive && 'bg-gradient-to-b from-emerald-600 via-emerald-800 to-emerald-950 border-emerald-600/50 shadow-[0_0_24px_rgba(52,211,153,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] animate-pulse',
            )
          : cn(
              'z-0 w-16 h-64 rounded-b-2xl pb-5',
              'border border-zinc-300/30 border-t-0',
              'shadow-[0_6px_12px_rgba(0,0,0,0.5),inset_0_-3px_6px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(0,0,0,0.04),-1px_0_0_rgba(0,0,0,0.06)]',
              !isActive && !isGuide && 'bg-gradient-to-b from-white via-zinc-50 to-zinc-100 hover:from-zinc-50 hover:via-zinc-100 hover:to-zinc-150',
              isActive && 'bg-gradient-to-b from-sky-100 via-sky-150 to-sky-200 border-sky-200/60 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_0_24px_rgba(14,165,233,0.35),inset_0_3px_8px_rgba(14,165,233,0.15)] translate-y-1',
              isGuide && !isActive && 'bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 border-emerald-200/60 shadow-[0_0_28px_rgba(52,211,153,0.5),inset_0_1px_0_rgba(255,255,255,1)] animate-pulse',
            )
      )}
    >
      <span className={cn(
        'text-[11px] font-bold tracking-widest pointer-events-none transition-all duration-75',
        isBlack
          ? cn(
              'text-zinc-500',
              isActive && 'text-sky-300 opacity-100',
              isGuide && !isActive && 'text-emerald-300 opacity-100',
              !isActive && !isGuide && 'opacity-60',
            )
          : cn(
              'text-zinc-400',
              isActive && 'text-sky-500 opacity-100',
              isGuide && !isActive && 'text-emerald-600 opacity-100',
              !isActive && !isGuide && 'opacity-50',
            ),
      )}>
        {keyLabel}
      </span>
      {!isBlack && (
        <span className={cn(
          'text-[10px] font-medium pointer-events-none mt-1 transition-all duration-75',
          'opacity-20 text-zinc-500',
          isActive && 'opacity-60 text-sky-500',
          isGuide && !isActive && 'opacity-80 text-emerald-600',
        )}>
          {note}
        </span>
      )}
    </button>
  );
};
