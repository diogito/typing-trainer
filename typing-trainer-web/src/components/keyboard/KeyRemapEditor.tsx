import { useState, useCallback, useMemo } from 'react';
import { KeyboardLayout, type FingerMap, type Layer } from '@/types';

interface KeyRemapEditorProps {
  layout: KeyboardLayout;
  layer: string;
  onChange: (updatedLayout: KeyboardLayout) => void;
}

export function KeyRemapEditor({ layout, layer, onChange }: KeyRemapEditorProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const currentLayer = useMemo(() => {
    const layerDef = layout.layers[layer];
    return layerDef?.keys ?? {};
  }, [layout.layers, layer]);

  const handleEdit = useCallback((scancode: string) => {
    const currentLabel = currentLayer[scancode] ?? layout.keys.find((k) => k.scancode === scancode)?.labels?.base ?? '';
    setEditing(scancode);
    setEditValue(currentLabel);
  }, [currentLayer, layout.keys]);

  const handleSave = useCallback(() => {
    if (!editing) return;
    const trimmed = editValue.trim();
    if (!trimmed) return; // Reject empty

    const updatedLayout = { ...layout };
    const layerDef = updatedLayout.layers[layer]
      ? { ...updatedLayout.layers[layer], keys: { ...updatedLayout.layers[layer].keys } }
      : { name: layer, label: layer, keys: {} as Record<string, string> };

    layerDef.keys = { ...layerDef.keys, [editing]: trimmed };
    updatedLayout.layers = { ...updatedLayout.layers, [layer]: layerDef };

    onChange(updatedLayout);
    setEditing(null);
    setEditValue('');
  }, [editing, editValue, layout, layer, onChange]);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  }, [handleSave, handleCancel]);

  // Collect unique scancodes and their base labels
  const keys = useMemo(() => {
    return layout.keys.map((key) => ({
      scancode: key.scancode,
      baseLabel: key.labels?.base ?? key.scancode,
      currentLabel: currentLayer[key.scancode] ?? (key.labels?.[layer] ?? key.labels?.base ?? key.scancode),
    }));
  }, [layout.keys, currentLayer, layer]);

  // Group keys by approximate row (based on position)
  const rows = useMemo(() => {
    const rowMap = new Map<number, typeof keys>();
    keys.forEach((key) => {
      const layoutKey = layout.keys.find((k) => k.scancode === key.scancode);
      const row = layoutKey?.position?.row ?? 0;
      if (!rowMap.has(row)) rowMap.set(row, []);
      rowMap.get(row)?.push(key);
    });
    return Array.from(rowMap.entries()).sort(([a], [b]) => a - b);
  }, [keys, layout.keys]);

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        Click a key to edit its label in the <strong>{layer}</strong> layer
      </div>
      <div className="space-y-1">
        {rows.map(([row, rowKeys]) => (
          <div key={row} className="flex gap-1 justify-center flex-wrap">
            {Array.from({ length: row * 2 }).map((_, i) => (
              <div key={`spacer-${i}`} className="w-[52px] h-[36px]" />
            ))}
            {rowKeys.map((key) => (
              <div key={key.scancode} className="w-[52px]">
                {editing === key.scancode ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="w-full h-8 text-xs border border-primary rounded bg-background px-1.5 text-center"
                    maxLength={8}
                    data-scancode={key.scancode}
                  />
                ) : (
                  <button
                    onClick={() => handleEdit(key.scancode)}
                    className="w-full h-8 text-xs border border-border rounded bg-card hover:bg-accent transition-colors"
                    title={`Click to edit. Base: ${key.baseLabel}`}
                  >
                    {key.currentLabel || '—'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
