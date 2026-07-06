import { useMemo } from 'react';
import { EXERCISE_CATALOG } from '@/data/exercises';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Exercise, ExerciseType, TrainingLevel } from '@/types';

interface ExerciseSelectorProps {
  onSelect: (id: string) => void;
  selectedId?: string;
}

const TYPE_LABELS: Record<ExerciseType, string> = {
  'home-row': 'Home Row',
  letters: 'Letters',
  symbols: 'Symbols',
  code: 'Programming',
  spanish: 'Spanish',
  free: 'Free',
};

const LEVEL_BADGE_COLORS: Record<TrainingLevel, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  expert: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export function ExerciseSelector({ onSelect, selectedId }: ExerciseSelectorProps) {
  const grouped = useMemo(() => {
    const groups: Record<ExerciseType, Exercise[]> = {
      'home-row': [],
      letters: [],
      symbols: [],
      code: [],
      spanish: [],
      free: [],
    };
    for (const ex of EXERCISE_CATALOG) {
      groups[ex.type].push(ex);
    }
    return groups;
  }, []);

  const typeOptions = useMemo(() => {
    return Object.entries(TYPE_LABELS)
      .filter(([, exercises]) => exercises.length > 0)
      .map(([value, label]) => ({ value, label }));
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select an Exercise</h3>
        {selectedId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect(selectedId); // deselect by re-selecting same
            }}
          >
            Clear selection
          </Button>
        )}
      </div>

      {/* Type filter */}
      <Select
        options={typeOptions}
        onChange={(value) => {
          // Show all exercises of that type
          const typeExercises = EXERCISE_CATALOG.filter((e) => e.type === value);
          if (typeExercises.length === 1) {
            onSelect(typeExercises[0].id);
          }
        }}
        className="w-48"
      />

      {/* Exercise cards */}
      <div className="grid grid-cols-1 gap-3">
        {EXERCISE_CATALOG.map((ex) => {
          const isSelected = ex.id === selectedId;
          return (
            <Card
              key={ex.id}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? 'border-primary ring-1 ring-primary'
                  : 'hover:border-border/80'
              }`}
              onClick={() => onSelect(ex.id)}
            >
              <div className="flex items-start justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{ex.title}</h4>
                    <Badge
                      className={
                        LEVEL_BADGE_COLORS[ex.level]
                      }
                    >
                      {ex.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ex.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge variant="outline">{TYPE_LABELS[ex.type]}</Badge>
                  <div className="text-xs text-muted-foreground">
                    {ex.target.length} chars
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
