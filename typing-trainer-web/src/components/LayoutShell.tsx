import { useLayoutStore } from '@/stores/layoutStore';
import { Keyboard } from 'lucide-react';

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
      </nav>
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}

function NavButton({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-0.5 text-muted-foreground">
      <Icon className="h-5 w-5" />
      <span className="text-[10px]">{label}</span>
    </a>
  );
}

// Inline icons
function BarChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function Monitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
