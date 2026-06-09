import { cleanText, json, requireAdmin, statusFromAction } from '../../../_utils';
import type { Env } from '../../../_utils';

export const onRequestPatch: PagesFunction<Env> = async ({ request, params, env }) => {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized.' }, { status: 401 });

  const id = String(params.id || '');
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return json({ error: 'Invalid request.' }, { status: 400 });

  const input = body as Record<string, unknown>;
  const action = cleanText(input.action, 40);
  const now = new Date().toISOString();
  const status = statusFromAction(action);

  if (status) {
    const approvedAt = status === 'approved' ? now : null;
    const rejectedAt = status === 'rejected' ? now : null;
    await env.DB.prepare(`
      UPDATE wins
      SET status = ?, approved_at = COALESCE(?, approved_at), rejected_at = COALESCE(?, rejected_at),
          updated_at = ?
      WHERE public_id = ?
    `).bind(status, approvedAt, rejectedAt, now, id).run();
    return json({ ok: true });
  }

  if (action === 'promote' || action === 'unpromote') {
    if (action === 'promote') {
      const row = await env.DB.prepare(`
        SELECT permission_social
        FROM wins
        WHERE public_id = ?
        LIMIT 1
      `).bind(id).first();
      if (!row) return json({ error: 'Submission not found.' }, { status: 404 });
      if (Number(row.permission_social || 0) !== 1) {
        return json({ error: 'Promote is unavailable because the submitter did not grant social/media permission.' }, { status: 400 });
      }
    }
    await env.DB.prepare(`
      UPDATE wins
      SET promote = ?, promoted_at = ?, updated_at = ?
      WHERE public_id = ?
    `).bind(action === 'promote' ? 1 : 0, action === 'promote' ? now : null, now, id).run();
    return json({ ok: true });
  }

  if (action === 'feature' || action === 'unfeature') {
    await env.DB.prepare(`
      UPDATE wins
      SET featured = ?, updated_at = ?
      WHERE public_id = ?
    `).bind(action === 'feature' ? 1 : 0, now, id).run();
    return json({ ok: true });
  }

  if (action === 'edit') {
    const firstName = cleanText(input.firstName, 80);
    const location = cleanText(input.location, 120);
    const role = cleanText(input.role, 120);
    const category = cleanText(input.category, 40);
    const winText = cleanText(input.winText, 420);
    const outcomeText = cleanText(input.outcomeText, 280);
    const quote = cleanText(input.quote, 180);
    if (!firstName || !winText || !quote) return json({ error: 'Missing required edit fields.' }, { status: 400 });
    const searchText = [firstName, location, role, category, winText, outcomeText, quote].join(' ').toLowerCase();

    await env.DB.prepare(`
      UPDATE wins
      SET first_name = ?, location = ?, role = ?, category = ?, win_text = ?, outcome_text = ?,
          quote = ?, search_text = ?, updated_at = ?
      WHERE public_id = ?
    `).bind(
      firstName,
      location || null,
      role || null,
      category || 'first-win',
      winText,
      outcomeText || null,
      quote,
      searchText,
      now,
      id
    ).run();
    return json({ ok: true });
  }

  return json({ error: 'Unknown action.' }, { status: 400 });
};
