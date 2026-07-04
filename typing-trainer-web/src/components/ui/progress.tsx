import { cn } from '@/lib/utils';

interface ProgressProps {
  value?: number;
  className?: string;
}

/**
 * Progress indicator mapped to a 0–100 value.
 * Built on top of Tailwind utility classes (no Radix dependency).
 */
export function Progress({ value = 0, className }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className,
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
