import { createRoute } from '@tanstack/react-router';
import { PosturePage } from '@/pages/PosturePage';
import { Route as RootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/posture',
  component: PosturePage,
});
