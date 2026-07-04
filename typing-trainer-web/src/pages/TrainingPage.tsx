import { useState, useCallback, useEffect } from 'react';
import { SvgKeyboard, LayerIndicator, FingerLegend } from '@/components/keyboard/SvgKeyboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useSessionStore } from '@/stores/sessionStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { useUISlice } from '@/stores/uiStore';
import { useEventCapture } from '@/core/capture/eventCapture';
import type { KeystrokeEvent } from '@/types';

export function TrainingPage() {
  const session = useSessionStore((s) => s.state);
  const metrics = useSessionStore((s) => s.metrics);
  const start = useSessionStore((s) => s.start);
  const stop = useSessionStore((s) => s.stop);
  const pause = useSessionStore((s) => s.pause);
  const resume = useSessionStore((s) => s.resume);
  const init = useSessionStore((s) => s.init);
  const recordKeystroke = useSessionStore((s) => s.recordKeystroke);

  const layout = useLayoutStore((s) => s.getLayout());
  const activeLayer = useLayoutStore((s) => s.activeLayer);
  const activateLayer = useLayoutStore((s) => s.activateLayer);

  // Mirror mode state from uiStore
  const mirrorMode = useUISlice((s) => s.mirrorMode);
  const toggleMirrorMode = useUISlice((s) => s.toggleMirrorMode);
  const incrementMirrorProgress = useUISlice((s) => s.incrementMirrorProgress);
  const resetMirrorMode = useUISlice((s) => s.resetMirrorMode);
  const mirrorOpacity = useUISlice((s) => s.getMirrorOpacity());

  const [isInitialized, setIsInitialized] = useState(false);
  const [activeLayoutId, setActiveLayoutId] = useState('');

  // Initialize session on mount
  const layoutId = useLayoutStore.getState().layoutId;
  if (!isInitialized && layout) {
    init(layoutId);
    setIsInitialized(true);
    setActiveLayoutId(layoutId);
  }

  // Reset mirror mode when layout changes
  useEffect(() => {
    if (layoutId !== activeLayoutId) {
      resetMirrorMode();
      setActiveLayoutId(layoutId);
    }
  }, [layoutId, activeLayoutId, resetMirrorMode]);

  // Reset mirror mode when starting a new session
  const handleStart = useCallback(() => {
    resetMirrorMode();
    start();
  }, [start, resetMirrorMode]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handlePause = useCallback(() => {
    if (session.state === 'running') {
      pause();
    } else {
      resume();
    }
  }, [session.state, pause, resume]);

  const handleKeystroke = useCallback((event: KeystrokeEvent) => {
    recordKeystroke(event);
    // Increment mirror progress on correct keystrokes (no error)
    if (!event.error && mirrorMode.enabled) {
      incrementMirrorProgress();
    }
  }, [recordKeystroke, mirrorMode.enabled, incrementMirrorProgress]);

  // Get finger map from layout
  const fingerMap = layout?.fingerMap ?? {};
  const enabled = session.state === 'running';

  useEventCapture({
    onKeystroke: handleKeystroke,
    fingerMap,
    activeLayer,
    enabled,
  });

  // Compute displayed stats
  const wpm = metrics?.wpm ?? 0;
  const accuracy = metrics?.accuracy ?? 100;
  const ks = metrics?.totalKeystrokes ?? 0;
  const elapsed = metrics ? Math.round(metrics.duration) : 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="WPM" value={wpm} suffix=" wpm" />
        <StatCard label="Accuracy" value={accuracy} suffix="%" />
        <StatCard label="Keystrokes" value={ks} suffix=" ks" />
        <StatCard label="Time" value={elapsed} suffix="s" />
      </div>

      {/* Session controls */}
      <div className="flex gap-2 justify-center">
        {session.state === 'idle' && (
          <Button onClick={handleStart} variant="default" size="lg">
            {ks > 0 ? 'Restart' : 'Start Training'}
          </Button>
        )}
        {session.state === 'running' && (
          <Button onClick={handlePause} variant="outline" size="lg">
            Pause
          </Button>
        )}
        {session.state === 'paused' && (
          <Button onClick={handlePause} variant="default" size="lg">
            Resume
          </Button>
        )}
        {ks > 0 && session.state !== 'idle' && (
          <Button onClick={handleStop} variant="destructive" size="lg">
            Stop
          </Button>
        )}
      </div>

      {/* Toolbar with Mirror Mode toggle */}
      <div className="flex items-center justify-between px-4">
        <div className="flex justify-center">
          {layout && (
            <LayerIndicator
              activeLayer={activeLayer}
              layerNames={Object.keys(layout.layers)}
              onLayerChange={activateLayer}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mirror Mode</span>
          <Switch
            checked={mirrorMode.enabled}
            onCheckedChange={(checked) => {
              if (checked) {
                resetMirrorMode();
              }
              toggleMirrorMode();
            }}
          />
        </div>
      </div>

      {/* Mirror Mode progress bar */}
      {mirrorMode.enabled && (
        <div className="max-w-4xl mx-auto w-full px-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">Mirror Progress</span>
            <span className="text-xs font-mono">{mirrorMode.progress}%</span>
          </div>
          <Progress value={mirrorMode.progress} />
        </div>
      )}

      {/* SVG Keyboard — the centerpiece */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Keyboard</CardTitle>
            {layout && <Badge>{layout.name}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <SvgKeyboard className="w-full" opacity={mirrorMode.enabled ? mirrorOpacity : undefined} />
        </CardContent>
      </Card>

      {/* Finger legend */}
      <div className="flex justify-center pb-4">
        <FingerLegend colors={{
          pinky: '#ef4444',
          ring: '#f97316',
          middle: '#eab308',
          index: '#22c55e',
          thumb: '#3b82f6',
          other: '#6b7280',
        }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <Card className="text-center">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-2xl font-bold">
          {Number.isInteger(value) ? value : value.toFixed(1)}
          <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      </CardContent>
    </Card>
  );
}
