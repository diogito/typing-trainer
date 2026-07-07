import { useState, useCallback, useEffect } from 'react';
import { SvgKeyboard, LayerIndicator, FingerLegend } from '@/components/keyboard/SvgKeyboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { BreakReminderOverlay } from '@/components/BreakReminderOverlay';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { ExerciseDisplay } from '@/components/ExerciseDisplay';
import { PostSessionSummary } from '@/components/PostSessionSummary';
import { useBreakReminder } from '@/hooks/useBreakReminder';
import { useSessionStore } from '@/stores/sessionStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { useUISlice } from '@/stores/uiStore';
import { useKeyboardStore } from '@/stores/keyboardStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useEventCapture } from '@/core/capture/eventCapture';
import { generateRecommendations } from '@/lib/recommendations';
import type { KeystrokeEvent, SessionMetrics, TrainingRecommendation } from '@/types';

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

  const recordError = useKeyboardStore((s) => s.recordError);

  // Exercise store
  const selectedExerciseId = useExerciseStore((s) => s.selectedExerciseId);
  const selectExercise = useExerciseStore((s) => s.selectExercise);
  const resetSession = useExerciseStore((s) => s.resetSession);
  const getExercise = useExerciseStore((s) => s.getExercise);
  const getCharacterStates = useExerciseStore((s) => s.getCharacterStates);
  const getTarget = useExerciseStore((s) => s.currentTarget);
  const exerciseAccuracy = useExerciseStore((s) =>
    s.totalKeystrokes + s.totalErrors > 0
      ? (s.totalKeystrokes / (s.totalKeystrokes + s.totalErrors)) * 100
      : undefined
  );

  const [isInitialized, setIsInitialized] = useState(false);
  const [activeLayoutId, setActiveLayoutId] = useState('');

  // Post-session summary state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryMetrics, setSummaryMetrics] = useState<SessionMetrics | null>(null);
  const [summaryRecommendations, setSummaryRecommendations] = useState<TrainingRecommendation[] | undefined>(undefined);

  // Break reminder integration
  const breakReminder = useBreakReminder({
    onReminder: useCallback(() => {
      // Overlay auto-shown via breakReminder.active === true
    }, []),
    isTyping: session.state === 'running',
  });

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
    if (selectedExerciseId) {
      resetSession();
    }
    breakReminder.start();
    start();
  }, [start, resetMirrorMode, breakReminder, selectedExerciseId, resetSession]);

  const handleStop = useCallback(() => {
    stop();
    breakReminder.reset();

    // Show post-session summary if exercise was active
    if (selectedExerciseId && session.metrics) {
      const metrics = session.metrics;
      setSummaryMetrics(metrics);
      setSummaryRecommendations(generateRecommendations({
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        totalKeystrokes: metrics.totalKeystrokes,
        errors: metrics.errors.byKey,
        exerciseType: getExercise()?.type ?? 'home-row',
      }));
      setShowSummary(true);
    }
  }, [stop, breakReminder, selectedExerciseId, session.metrics, getExercise]);

  const handlePause = useCallback(() => {
    if (session.state === 'running') {
      pause();
      breakReminder.pause();
    } else {
      resume();
    }
  }, [session.state, pause, resume, breakReminder]);

  const handleKeystroke = useCallback((event: KeystrokeEvent) => {
    recordKeystroke(event);
    // Record live error for heatmap display
    if (event.error === 'wrong-finger') {
      recordError(event.scancode);
    }
    // Increment mirror progress on correct keystrokes (no error)
    if (!event.error && mirrorMode.enabled) {
      incrementMirrorProgress();
    }
  }, [recordKeystroke, recordError, mirrorMode.enabled, incrementMirrorProgress]);

  // Exercise validation callback for useEventCapture
  const handleValidation = useCallback(
    (_index: number, correct: boolean, _expected: string, _actual: string) => {
      if (correct) {
        // exerciseStore.onKeystroke handles character tracking
      }
      // exerciseStore.onKeystroke is called via the onKeystroke path
    },
    [],
  );

  // Get finger map from layout
  const fingerMap = layout?.fingerMap ?? {};
  const enabled = session.state === 'running';

  const exerciseActive = !!selectedExerciseId;
  const targetText = exerciseActive ? getTarget : undefined;

  useEventCapture({
    onKeystroke: handleKeystroke,
    fingerMap,
    activeLayer,
    enabled,
    targetText,
    onValidation: exerciseActive ? handleValidation : undefined,
  });

  // Compute displayed stats
  const wpm = metrics?.wpm ?? 0;
  const accuracy = metrics?.accuracy ?? 100;
  const precision = metrics?.precision ?? 0;
  const ks = session.keystrokes.length;

  // Live elapsed time during running session
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (session.state !== 'running' || !session.startTime) {
      // When idle, show stored metrics duration
      setElapsed(metrics ? Math.round(metrics.duration) : 0);
      return;
    }
    const startTime = session.startTime;
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session.state, session.startTime, metrics]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Exercise selector */}
      {session.state === 'idle' && !selectedExerciseId && (
        <ExerciseSelector onSelect={selectExercise} />
      )}

      {/* Exercise display */}
      {selectedExerciseId && session.state === 'idle' && (
        <div className="max-w-4xl mx-auto w-full">
          <ExerciseDisplay
            targetText={getTarget}
            charStates={getCharacterStates()}
            className="text-center"
          />
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="WPM" value={wpm} suffix=" wpm" />
        <StatCard label="Accuracy" value={accuracy} suffix="%" />
        <StatCard label="Precision" value={precision} suffix="%" />
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

      {/* Break reminder overlay */}
      <BreakReminderOverlay
        active={breakReminder.active}
        remaining={breakReminder.remaining}
        formattedRemaining={breakReminder.formattedRemaining}
        onDismiss={breakReminder.dismiss}
        onPause={breakReminder.pause}
        onResume={() => {}}
      />

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

      {/* Post-session summary overlay */}
      {showSummary && summaryMetrics && (
        <div className="max-w-4xl mx-auto w-full">
          <PostSessionSummary
            metrics={summaryMetrics}
            exerciseTitle={getExercise()?.title ?? 'Free Mode'}
            exerciseAccuracy={exerciseAccuracy}
            recommendations={summaryRecommendations ?? []}
            onClose={() => setShowSummary(false)}
          />
        </div>
      )}
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
