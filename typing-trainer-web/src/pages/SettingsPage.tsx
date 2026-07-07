import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select } from '@/components/ui/select';
import { useUISlice } from '@/stores/uiStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { storageService } from '@/services/storage';
import { layoutRegistry } from '@/core/keyboard/layoutRegistry';

export function SettingsPage() {
  const preferences = useUISlice((s) => s.preferences);
  // const updatePreference = useUISlice((s) => s.updatePreference);
  const resetPreferences = useUISlice((s) => s.resetPreferences);

  const layoutId = useLayoutStore((s) => s.layoutId);
  const setLayout = useLayoutStore((s) => s.setLayout);

  const [layoutName, setLayoutName] = useState(layoutId);
  const [fontSize, setFontSize] = useState(String(preferences.fontSize));
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showLayerIndicator, setShowLayerIndicator] = useState(preferences.showLayerIndicator);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLayoutName(layoutId);
  }, [layoutId]);

  const handleSave = useCallback(async () => {
    try {
      await storageService.savePreferences({
        ...preferences,
        selectedLayoutId: layoutName,
        fontSize: parseInt(fontSize, 10) || 16,
        theme,
        showLayerIndicator,
        updatedAt: Date.now(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  }, [preferences, layoutName, fontSize, theme, showLayerIndicator]);

  const handleReset = useCallback(() => {
    resetPreferences();
    setLayout('qwerty-es');
    setFontSize('16');
    setTheme('light');
    setShowLayerIndicator(true);
  }, [resetPreferences, setLayout]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Customize your training experience.</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Theme</label>
            <Select
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              value={theme}
              onChange={(v) => setTheme(v as 'light' | 'dark')}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <label className="text-sm font-medium">Font Size</label>
            <Input
              type="number"
              min={10}
              max={32}
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Layer Indicator</p>
              <p className="text-xs text-muted-foreground">Display the layer switcher on the keyboard</p>
            </div>
            <Switch checked={showLayerIndicator} onCheckedChange={setShowLayerIndicator} />
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Selected Layout</label>
            <Select
              options={useMemo(() => {
                const builtinIds = layoutRegistry.getLayoutIds();
                const customIds = Object.keys(useLayoutStore.getState().customLayouts);
                const allIds = [...builtinIds, ...customIds];
                // Deduplicate while preserving order
                const seen = new Set<string>();
                const unique = allIds.filter(id => {
                  if (seen.has(id)) return false;
                  seen.add(id);
                  return true;
                });
                return unique.map(id => {
                  const layout = layoutRegistry.get(id);
                  return {
                    value: id,
                    label: layout?.name ?? id,
                  };
                });
              }, [])}
              value={layoutName}
              onChange={setLayoutName}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} variant="default">
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
