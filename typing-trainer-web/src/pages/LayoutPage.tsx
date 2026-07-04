import { useState, useCallback } from 'react';
import { SvgKeyboard, FingerLegend } from '@/components/keyboard/SvgKeyboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLayoutStore } from '@/stores/layoutStore';
import { usePostureStore } from '@/stores/postureStore';
import { KeyRemapEditor } from '@/components/keyboard/KeyRemapEditor';
import { LayerSelector } from '@/components/keyboard/LayerSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  saveLayoutToStorage,
  deleteLayoutFromStorage,
  isBuiltinLayout,
  slugify,
  exportLayoutAsJson,
  parseImportedJson,
  type ImportedLayoutResult,
} from '@/lib/layoutActions';

export function LayoutPage() {
  const layout = useLayoutStore((s) => s.getLayout());
  const layoutId = useLayoutStore((s) => s.layoutId);
  const setLayout = useLayoutStore((s) => s.setLayout);
  const registerCustomLayout = useLayoutStore((s) => s.registerCustomLayout);
  const deleteCustomLayout = useLayoutStore((s) => s.deleteCustomLayout);
  const customLayouts = useLayoutStore((s) => s.customLayouts);

  const layoutOptions = [
    { id: 'qwerty-es', name: 'QWERTY (ES)' },
    { id: 'colemak', name: 'Colemak' },
    { id: 'colemak-dh', name: 'Colemak DH' },
    { id: 'dvorak', name: 'Dvorak' },
  ];

  const [showRemap, setShowRemap] = useState(false);
  const [remapLayer, setRemapLayer] = useState('base');
  const [saveName, setSaveName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const isCustom = layoutId.startsWith('custom-') || !!customLayouts[layoutId];

  const handleLayoutChange = useCallback((id: string) => {
    setLayout(id);
    setShowRemap(false);
  }, [setLayout]);

  const handleSaveCustom = useCallback(async () => {
    if (!layout) return;
    const name = saveName.trim() || `${layout.name} (copy)`;
    const id = `custom-${slugify(name)}-${Date.now()}`;
    const customLayout = { ...layout, id, name };
    registerCustomLayout(customLayout);
    await saveLayoutToStorage(customLayout);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
    setSaveName('');
  }, [layout, saveName, registerCustomLayout]);

  const handleExport = useCallback(() => {
    if (!layout) return;
    exportLayoutAsJson(layout);
  }, [layout]);

  const handleDelete = useCallback(async () => {
    if (!layout || !isCustom) return;
    const confirmed = window.confirm(`Delete "${layout.name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteCustomLayout(layout.id);
    await deleteLayoutFromStorage(layout.id);
    // Revert to first available layout
    const firstBuiltin = layoutOptions[0].id;
    setLayout(firstBuiltin);
  }, [layout, isCustom, deleteCustomLayout, layoutOptions, setLayout]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = parseImportedJson(json);
      if (!result.success || !result.layout) {
        setImportError(result.error ?? 'Invalid layout data');
        return;
      }
      // Create a custom layout from the imported data
      const id = `custom-${slugify(result.name)}-${Date.now()}`;
      const customLayout = { ...result.layout, id, name: result.name };
      registerCustomLayout(customLayout);
      await saveLayoutToStorage(customLayout);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse file');
    }
    // Reset file input
    e.target.value = '';
  }, [registerCustomLayout]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Layouts</h2>
        <p className="text-muted-foreground">Select your keyboard layout for training.</p>
      </div>

      {/* Layout selector */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {layoutOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleLayoutChange(opt.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  layoutId === opt.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom layout actions */}
      {layout && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {layout.name}
                {isCustom && <Badge className="ml-2">Custom</Badge>}
                {!isCustom && <Badge variant="outline" className="ml-2">Built-in</Badge>}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Import */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Import QMK keymap.json:</label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
              />
            </div>
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setShowRemap(!showRemap)}>
                {showRemap ? 'Hide' : 'Edit'} Labels
              </Button>
              <Button size="sm" variant="outline" onClick={handleExport}>
                Export JSON
              </Button>
              {isCustom && (
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>

            {/* Save custom layout */}
            {showRemap && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  placeholder="Layout name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="max-w-xs"
                />
                <Button size="sm" onClick={handleSaveCustom} disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saved' ? 'Saved!' : saveStatus === 'saving' ? 'Saving...' : 'Save Copy'}
                </Button>
                {saveStatus === 'saved' && (
                  <span className="text-xs text-green-600">Layout saved successfully</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key remap editor */}
      {layout && showRemap && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Label Editor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <LayerSelector
              layers={Object.entries(layout.layers).map(([name, layerDef]) => ({
                name,
                label: layerDef.label || name,
              }))}
              activeLayer={remapLayer}
              onSelect={setRemapLayer}
            />
            <KeyRemapEditor
              layout={layout}
              layer={remapLayer}
              onChange={(updatedLayout) => {
                // Update the layout in store if it's custom
                if (isCustom) {
                  registerCustomLayout(updatedLayout);
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Keyboard preview */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Layout Preview</CardTitle>
            {layout && <Badge>{layout.name}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <SvgKeyboard className="w-full" />
        </CardContent>
      </Card>

      {/* Finger legend */}
      <div className="flex justify-center pb-4">
        <FingerLegend colors={{
          pinky: '#ef4444', ring: '#f97316', middle: '#eab308',
          index: '#22c55e', thumb: '#3b82f6', other: '#6b7280',
        }} />
      </div>
    </div>
  );
}
