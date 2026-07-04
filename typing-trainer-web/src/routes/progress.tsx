import { createRoute } from '@tanstack/react-router';
import { ProgressPage } from '@/pages/ProgressPage';
import { Route as RootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/progress',
  component: ProgressPage,
});
