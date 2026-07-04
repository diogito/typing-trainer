import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  className?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
}

export const Slider = forwardRef<
  HTMLInputElement,
  SliderProps
>(({ className, min = 0, max = 100, defaultValue = 0, step = 1, value, onChange }, ref) => {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue);
  const isControlled = value !== undefined;
  const currentVal = isControlled ? value : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = Number(e.target.value);
      if (!isControlled) {
        setInternalValue(newVal);
      }
      onChange?.(newVal);
    },
    [isControlled, onChange],
  );

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [value, isControlled]);

  const percentage = ((currentVal - min) / (max - min)) * 100;

  return (
    <div className={cn('relative flex w-full items-center gap-3', className)}>
      <div className="relative flex-1 h-6 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-2 rounded-full bg-muted" />
        {/* Filled track */}
        <div
          className="absolute h-2 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
        {/* Hidden native range input */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentVal}
          onChange={handleChange}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
          style={{ zIndex: 1 }}
        />
        {/* Thumb */}
        <div
          className="absolute w-5 h-5 rounded-full bg-primary border-2 border-background shadow-sm pointer-events-none transition-[left] duration-150"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      {/* Value label */}
      <span className="min-w-[3rem] text-right text-sm font-mono font-medium tabular-nums">
        {Number.isInteger(step) ? Math.round(currentVal) : currentVal.toFixed(1)}
      </span>
    </div>
  );
});

Slider.displayName = 'Slider';
