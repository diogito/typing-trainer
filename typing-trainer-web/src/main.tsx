import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { LayoutShell } from '@/components/LayoutShell';

// Import route definitions
import { Route as RootRoute } from './routes/__root';
import { Route as IndexRoute } from './routes/index';
import { Route as TrainingRoute } from './routes/training';
import { Route as ProgressRoute } from './routes/progress';
import { Route as SettingsRoute } from './routes/settings';
import { Route as LayoutsRoute } from './routes/layouts';

// Create route tree
const routeTree = RootRoute.addChildren([
  IndexRoute,
  TrainingRoute,
  ProgressRoute,
  SettingsRoute,
  LayoutsRoute,
]);

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg">Loading...</p>
    </div>
  ),
  context: {
    layout: LayoutShell,
  },
});

// Register the route tree
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
