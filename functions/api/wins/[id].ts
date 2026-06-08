import { json, rowToPublicWin } from '../../_utils';
import type { Env } from '../../_utils';

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id || '');
  const row = await env.DB.prepare(`
    SELECT public_id, first_name, location, role, category, win_text, outcome_text, quote,
           promote, featured, created_at, approved_at
    FROM wins
    WHERE public_id = ? AND status = 'approved'
    LIMIT 1
  `).bind(id).first();

  if (!row) return json({ error: 'Win not found.' }, { status: 404 });
  return json({ win: rowToPublicWin(row as Record<string, unknown>) });
};
