import { TrendingUp, Target, Keyboard, AlertTriangle, X } from 'lucide-react';
import type { SessionMetrics, TrainingRecommendation } from '@/types';

interface PostSessionSummaryProps {
  metrics: SessionMetrics | null;
  exerciseTitle?: string;
  exerciseAccuracy?: number;
  recommendations: TrainingRecommendation[];
  onClose: () => void;
  className?: string;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high': return 'High';
    case 'medium': return 'Medium';
    default: return 'Low';
  }
}

function getTopErrors(errors: Record<string, number>, limit: number): Array<{ key: string; count: number }> {
  return Object.entries(errors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

export function PostSessionSummary({
  metrics,
  exerciseTitle = 'Free Mode',
  exerciseAccuracy,
  recommendations,
  onClose,
  className = '',
}: PostSessionSummaryProps) {
  if (!metrics) return null;

  const topErrors = getTopErrors(metrics.errors, 5);

  return (
    <div className={`rounded-2xl border border-border bg-card shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="font-semibold text-lg">Session Summary</h2>
          <p className="text-sm text-muted-foreground">{exerciseTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border px-4 py-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>WPM</span>
          </div>
          <div className="text-2xl font-bold">{metrics.wpm.toFixed(0)}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
            <Target className="h-3.5 w-3.5" />
            <span>Accuracy</span>
          </div>
          <div className="text-2xl font-bold">{metrics.accuracy.toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
            <Keyboard className="h-3.5 w-3.5" />
            <span>Keystrokes</span>
          </div>
          <div className="text-2xl font-bold">{metrics.totalKeystrokes}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
            <span className="text-xs">⏱</span>
            <span>Duration</span>
          </div>
          <div className="text-2xl font-bold">{metrics.duration}s</div>
        </div>
      </div>

      {/* Exercise Accuracy */}
      {exerciseAccuracy !== undefined && exerciseAccuracy !== null && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border-y border-border">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Exercise Accuracy:</span>
            <span className="font-bold text-blue-700 dark:text-blue-300">
              {exerciseAccuracy.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Errors Section */}
      {topErrors.length > 0 && (
        <div className="px-5 py-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Errors</h3>
          <div className="space-y-2">
            {topErrors.map(({ key, count }) => (
              <div key={key} className="flex items-center justify-between">
                <code className="text-sm bg-muted px-2 py-0.5 rounded font-mono">
                  {key}
                </code>
                <span className="text-sm text-muted-foreground">{count} time{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="px-5 py-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getPriorityColor(rec.priority)}`}>
                    {getPriorityLabel(rec.priority)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
