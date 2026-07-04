import { SvgKeyboard, FingerLegend } from '@/components/keyboard/SvgKeyboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLayoutStore } from '@/stores/layoutStore';

export function LayoutPage() {
  const layout = useLayoutStore((s) => s.getLayout());
  const layoutId = useLayoutStore((s) => s.layoutId);
  const setLayout = useLayoutStore((s) => s.setLayout);

  const layoutOptions = [
    { id: 'qwerty-es', name: 'QWERTY (ES)' },
    { id: 'colemak', name: 'Colemak' },
    { id: 'colemak-dh', name: 'Colemak DH' },
    { id: 'dvorak', name: 'Dvorak' },
  ];

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
                onClick={() => setLayout(opt.id)}
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
