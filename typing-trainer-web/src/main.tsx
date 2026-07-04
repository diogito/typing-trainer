import './styles/globals.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { LayoutShell } from '@/components/LayoutShell';

// Import auto-generated route tree
import { routeTree } from './routeTree.gen';

const router = createRouter({
  routeTree: routeTree as any,
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

// Load persisted posture settings on app startup
import { usePostureStore } from '@/stores/postureStore';
usePostureStore.getState().load();

function App() {
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
