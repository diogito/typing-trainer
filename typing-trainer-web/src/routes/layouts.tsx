import { createRoute } from '@tanstack/react-router';
import { LayoutPage } from '@/pages/LayoutPage';
import { Route as RootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/layouts',
  component: LayoutPage,
});
