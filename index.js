import { buildAnalyticsRouter } from './routes/analytics.js';

export default {
  manifest: { id: 'analytics', name: 'Analíticas', version: '1.0.0' },
  async register(ctx) {
    ctx.mountAsLegacy(['/api/analytics']);
    const balanceService = ctx.useModule('settlements').balanceService;
    ctx.router.use('/', buildAnalyticsRouter(ctx, balanceService));
    ctx.logger.info('ready');
  },
};
