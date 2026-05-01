import { Router } from 'express';

export function buildAnalyticsRouter(ctx, balanceService) {
  const { db, auth, utils } = ctx;
  const { authRequired, householdScope } = auth;
  const { asyncHandler, toCamel } = utils;

  const router = Router();
  router.use(authRequired, householdScope);

  router.get('/balance', asyncHandler(async (req, res) => {
    res.json({ balance: balanceService.computeBalance(req.householdId) });
  }));

  router.get('/summary', asyncHandler(async (req, res) => {
    const monthYear = req.query.monthYear ?? new Date().toISOString().slice(0, 7);
    const month = db.prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM expenses WHERE household_id = ? AND substr(date, 1, 7) = ? AND is_private = 0`,
    ).get(req.householdId, monthYear);
    const year = db.prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM expenses WHERE household_id = ? AND substr(date, 1, 4) = ? AND is_private = 0`,
    ).get(req.householdId, monthYear.slice(0, 4));
    res.json({ monthYear, month: toCamel(month), year: toCamel(year) });
  }));

  router.get('/by-category', asyncHandler(async (req, res) => {
    const monthYear = req.query.monthYear ?? new Date().toISOString().slice(0, 7);
    const rows = db.prepare(
      `SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(e.amount), 0) AS total
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id
       WHERE e.household_id = ? AND substr(e.date, 1, 7) = ? AND e.is_private = 0
       GROUP BY c.id ORDER BY total DESC`,
    ).all(req.householdId, monthYear);
    res.json({ byCategory: rows.map(toCamel) });
  }));

  router.get('/monthly-trend', asyncHandler(async (req, res) => {
    const months = Number(req.query.months ?? 12);
    const rows = db.prepare(
      `SELECT substr(date, 1, 7) AS month_year, COALESCE(SUM(amount), 0) AS total
       FROM expenses WHERE household_id = ? AND is_private = 0
       GROUP BY month_year ORDER BY month_year DESC LIMIT ?`,
    ).all(req.householdId, months);
    res.json({ trend: rows.map(toCamel).reverse() });
  }));

  router.get('/budget-status', asyncHandler(async (req, res) => {
    const monthYear = req.query.monthYear ?? new Date().toISOString().slice(0, 7);
    // El módulo budgets puede no estar instalado; comprobamos si la tabla existe.
    const tableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='budgets'")
      .get();
    if (!tableExists) return res.json({ status: [] });
    const budgets = db.prepare(
      `SELECT b.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM budgets b LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.household_id = ? AND b.month_year = ?`,
    ).all(req.householdId, monthYear);
    const status = budgets.map((b) => {
      let spent;
      if (b.category_id == null) {
        spent = db.prepare(
          `SELECT COALESCE(SUM(amount), 0) AS s FROM expenses
           WHERE household_id = ? AND substr(date, 1, 7) = ? AND is_private = 0`,
        ).get(req.householdId, monthYear).s;
      } else {
        spent = db.prepare(
          `SELECT COALESCE(SUM(amount), 0) AS s FROM expenses
           WHERE household_id = ? AND category_id = ? AND substr(date, 1, 7) = ? AND is_private = 0`,
        ).get(req.householdId, b.category_id, monthYear).s;
      }
      const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return { ...toCamel(b), spent, percent: pct };
    });
    res.json({ status });
  }));

  router.get('/user-comparison', asyncHandler(async (req, res) => {
    const monthYear = req.query.monthYear ?? new Date().toISOString().slice(0, 7);
    const rows = db.prepare(
      `SELECT u.id, u.display_name, u.avatar_color,
              COALESCE(SUM(e.amount), 0) AS total
       FROM users u
       JOIN household_members hm ON hm.user_id = u.id AND hm.household_id = ?
       LEFT JOIN expenses e
         ON e.paid_by = u.id AND e.household_id = ? AND substr(e.date, 1, 7) = ? AND e.is_private = 0
       GROUP BY u.id`,
    ).all(req.householdId, req.householdId, monthYear);
    res.json({ users: rows.map(toCamel) });
  }));

  return router;
}
