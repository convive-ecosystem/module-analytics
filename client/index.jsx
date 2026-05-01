import { BarChart3 } from 'lucide-react';
import { AnalyticsPage } from './pages/Analytics';

export default {
  id: 'analytics',
  name: 'Analíticas',
  register(ctx) {
    ctx.registerRoute({ path: '/analytics', element: <AnalyticsPage /> });
    ctx.registerNavItem({ to: '/analytics', label: 'Analíticas', icon: BarChart3, order: 24 });
  },
};
