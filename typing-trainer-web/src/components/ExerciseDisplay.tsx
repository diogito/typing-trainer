interface ExerciseDisplayProps {
  targetText: string;
  charStates: ('pending' | 'current' | 'correct' | 'incorrect' | 'corrected')[];
  className?: string;
}

export function ExerciseDisplay({
  targetText,
  charStates,
  className = '',
}: ExerciseDisplayProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-0 font-mono text-lg leading-relaxed ${className}`}
    >
      {targetText.split('').map((char, i) => {
        const state = charStates[i] || 'pending';
        const isCurrent = state === 'current';

        let colorClass = 'text-gray-400'; // pending = dim
        if (state === 'correct') colorClass = 'text-green-500';
        else if (state === 'incorrect') colorClass = 'text-red-500';
        else if (state === 'corrected') colorClass = 'text-green-500/50';
        else if (isCurrent) colorClass = 'text-gray-900 dark:text-gray-100';

        return (
          <span
            key={i}
            className={`relative inline-block transition-colors duration-100 ${colorClass} ${
              isCurrent ? 'font-bold' : ''
            }`}
          >
            {isCurrent && (
              <span className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-blue-500 animate-pulse" />
            )}
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
}
