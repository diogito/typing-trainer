import { useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { usePostureStore } from '@/stores/postureStore';
import { PersonStanding as Posture, Clock, AlertTriangle } from 'lucide-react';

export function PosturePage() {
  const { posture, loading, load, update } = usePostureStore();

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6 pb-24 md:pb-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Posture className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Posture Calibration</h1>
          <p className="text-sm text-muted-foreground">
            Optimize your typing setup and break reminders
          </p>
        </div>
      </div>

      {/* Arm Separation */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Arm Separation</h3>
            <p className="text-sm text-muted-foreground">
              Distance between your shoulders (20–80 cm)
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {Math.round(posture.armSeparation)}
          </div>
        </div>
        <Slider
          min={20}
          max={80}
          step={5}
          value={posture.armSeparation}
          onChange={(v) => update({ armSeparation: v })}
        />
      </div>

      {/* Monitor Height */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Monitor Height</h3>
            <p className="text-sm text-muted-foreground">
              Relative monitor elevation (1 = low, 10 = high)
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {posture.wristHeight}
          </div>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={posture.wristHeight}
          onChange={(v) => update({ wristHeight: v })}
        />
      </div>

      {/* Break Interval */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Break Interval</h3>
            <p className="text-sm text-muted-foreground">
              Pause reminder frequency (5–120 minutes)
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {Math.round(posture.breakIntervalMinutes)}
          </div>
        </div>
        <Slider
          min={5}
          max={120}
          step={5}
          value={posture.breakIntervalMinutes}
          onChange={(v) => update({ breakIntervalMinutes: v })}
        />
      </div>

      {/* Break Enable */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-medium">Break Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Show a reminder overlay during typing sessions
              </p>
            </div>
          </div>
          <Switch
            checked={posture.breakEnabled}
            onCheckedChange={(checked) => update({ breakEnabled: checked })}
          />
        </div>
      </div>

      {/* Timer info */}
      {posture.breakEnabled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30 flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            Reminders will fire every <strong>{Math.round(posture.breakIntervalMinutes)} min</strong>{' '}
            while you are actively typing. You can dismiss each reminder and continue.
          </div>
        </div>
      )}
    </div>
  );
}
