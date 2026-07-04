import { useState, useEffect } from 'react';
// Page component — route is defined in routes/progress.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { storageService } from '@/services/storage';
import type { PersistedSession } from '@/types';
import { aggregateSessionsMetrics } from '@/core/analytics/metrics';

export function ProgressPage() {
  const [sessions, setSessions] = useState<PersistedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const data = await storageService.getAllSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await storageService.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const agg = aggregateSessionsMetrics(sessions);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress</h2>
          <p className="text-muted-foreground">Your training history and statistics.</p>
        </div>
        <Button variant="outline" onClick={loadSessions}>
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Sessions" value={sessions.length} suffix="" />
        <StatCard label="Average WPM" value={agg.avgWpm} suffix=" wpm" />
        <StatCard label="Best WPM" value={agg.bestWpm} suffix=" wpm" />
        {sessions.length > 0 && (
          <>
            <StatCard label="Avg Accuracy" value={agg.avgAccuracy} suffix="%" />
            <StatCard label="Total Keystrokes" value={sessions.reduce((s, x) => s + x.totalKeystrokes, 0)} suffix="" />
            <StatCard label="Total Time" value={Math.round(sessions.reduce((s, x) => s + x.duration, 0) / 60)} suffix=" min" />
          </>
        )}
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-muted-foreground">No training sessions yet.</p>
            <p className="text-sm text-muted-foreground">Go to Training to start practicing!</p>
            <Button asChild>
              <a href="/">Start Training</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border border-border p-4 bg-card"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline">{session.layoutId || 'unknown'}</Badge>
                <div>
                  <p className="font-medium">
                    {session.wpm} WPM · {session.accuracy}% accuracy
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.totalKeystrokes} keystrokes · {Math.round(session.duration)}s
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(session.id)}
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <Card>
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
