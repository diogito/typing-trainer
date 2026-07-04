import { AlertTriangle, Pause, Play, X } from 'lucide-react';

interface BreakReminderOverlayProps {
  active: boolean;
  remaining: number;
  formattedRemaining: string;
  onDismiss: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function BreakReminderOverlay({
  active,
  remaining,
  formattedRemaining,
  onDismiss,
  onPause,
  onResume,
}: BreakReminderOverlayProps) {
  if (!active) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = Math.round(remaining % 60);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-card shadow-xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-semibold">Time for a break</h2>
              <p className="text-sm text-muted-foreground">
                {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`} remaining
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Timer bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-1000 ease-linear"
            style={{ width: `${((remaining / 60) / (1)) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onPause}
            className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        </div>
      </div>
    </div>
  );
}
