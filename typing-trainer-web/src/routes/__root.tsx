import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { LayoutShell } from '@/components/LayoutShell';

interface RouterContext {
  layout: React.ComponentType<{ children: React.ReactNode }>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    </div>
  ),
});

function RootComponent() {
  return (
    <LayoutShell>
      <Outlet />
    </LayoutShell>
  );
}
