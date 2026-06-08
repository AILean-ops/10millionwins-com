import { json, requireAdmin } from '../../_utils';
import type { Env } from '../../_utils';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized.' }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 200);
  const allowed = new Set(['pending', 'approved', 'rejected', 'all', 'promote']);

  if (!allowed.has(status)) return json({ error: 'Invalid status.' }, { status: 400 });

  let where = '1 = 1';
  const params: unknown[] = [];

  if (status === 'promote') {
    where = 'promote = 1 AND status = ?';
    params.push('approved');
  } else if (status !== 'all') {
    where = 'status = ?';
    params.push(status);
  }

  params.push(limit);

  const rows = await env.DB.prepare(`
    SELECT id, public_id, first_name, location, role, category, win_text, outcome_text, quote,
           permission_public, permission_social, photo_url, status, promote, featured,
           created_at, updated_at, approved_at, rejected_at, promoted_at
    FROM wins
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(...params).all();

  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
      SUM(CASE WHEN status = 'approved' AND promote = 1 THEN 1 ELSE 0 END) AS promote
    FROM wins
  `).first();

  return json({ submissions: rows.results || [], stats: stats || {} });
};
