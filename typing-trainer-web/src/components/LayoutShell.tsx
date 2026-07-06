import { Link } from '@tanstack/react-router';
import { useLayoutStore } from '@/stores/layoutStore';
import {
  Keyboard,
  BarChart,
  Settings,
  Monitor,
  PersonStanding as PostureIcon,
} from 'lucide-react';

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const layoutId = useLayoutStore((s) => s.layoutId);
  const setLayout = useLayoutStore((s) => s.setLayout);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Typing Trainer</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="layout-select" className="text-sm text-muted-foreground hidden sm:block">
                Layout:
              </label>
              <select
                id="layout-select"
                value={layoutId}
                onChange={(e) => setLayout(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="qwerty-es">QWERTY (ES)</option>
                <option value="colemak">Colemak</option>
                <option value="colemak-dh">Colemak DH</option>
                <option value="dvorak">Dvorak</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation + Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-56 border-r border-border bg-muted/20 md:block">
          <nav className="flex flex-col gap-1 p-4">
            <SidebarLink href="/" icon={Keyboard} label="Training" />
            <SidebarLink href="/progress" icon={BarChart} label="Progress" />
            <SidebarLink href="/settings" icon={Settings} label="Settings" />
            <SidebarLink href="/layouts" icon={Monitor} label="Layouts" />
            <SidebarLink href="/posture" icon={PostureIcon} label="Posture" />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background flex justify-around py-2">
        <NavButton href="/" icon={Keyboard} label="Train" />
        <NavButton href="/progress" icon={BarChart} label="Progress" />
        <NavButton href="/settings" icon={Settings} label="Settings" />
        <NavButton href="/layouts" icon={Monitor} label="Layouts" />
        <NavButton href="/posture" icon={PostureIcon} label="Posture" />
      </nav>
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function NavButton({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link to={href} className="flex flex-col items-center gap-0.5 text-muted-foreground">
      <Icon className="h-5 w-5" />
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
