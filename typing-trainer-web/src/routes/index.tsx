import { createRoute } from '@tanstack/react-router';
import { TrainingPage } from '@/pages/TrainingPage';
import { Route as RootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: TrainingPage,
});
