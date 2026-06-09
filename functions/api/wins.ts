import {
  CATEGORIES,
  buildQuote,
  cleanText,
  json,
  makePublicId,
  readJson,
  rowToPublicWin
} from '../_utils';
import type { Env } from '../_utils';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const category = cleanText(url.searchParams.get('category'), 40);
  const q = cleanText(url.searchParams.get('q'), 80).toLowerCase();
  const limit = Math.min(Number(url.searchParams.get('limit') || 60), 100);

  const where = ['status = ?'];
  const params: unknown[] = ['approved'];

  if (category && category !== 'all') {
    where.push('category = ?');
    params.push(category);
  }

  if (q) {
    where.push('search_text LIKE ?');
    params.push(`%${q}%`);
  }

  params.push(limit);
  const query = `
    SELECT public_id, first_name, location, role, category, win_text, outcome_text, quote,
           promote, featured, created_at, approved_at
    FROM wins
    WHERE ${where.join(' AND ')}
    ORDER BY featured DESC, approved_at DESC, created_at DESC
    LIMIT ?
  `;

  const wins = await env.DB.prepare(query).bind(...params).all();
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' AND promote = 1 THEN 1 ELSE 0 END) AS promote
    FROM wins
  `).first();

  return json({
    wins: (wins.results || []).map((row) => rowToPublicWin(row as Record<string, unknown>)),
    stats: stats || { total: 0, approved: 0, pending: 0, promote: 0 }
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await readJson(request);
  if (!body || typeof body !== 'object') {
    return json({ error: 'Invalid submission.' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const firstName = cleanText(input.firstName, 80);
  const location = cleanText(input.location, 120);
  const role = cleanText(input.role, 120);
  const category = cleanText(input.category, 40);
  const winText = cleanText(input.winText, 420);
  const outcomeText = cleanText(input.outcomeText, 280);
  const permissionSocial = Boolean(input.permissionSocial);

  if (!firstName || !winText) {
    return json({ error: 'First name and win are required.' }, { status: 400 });
  }

  const normalizedCategory = CATEGORIES.has(category) ? category : 'first-win';
  const id = crypto.randomUUID();
  const publicId = makePublicId();
  const quote = buildQuote(winText);
  const searchText = [firstName, location, role, normalizedCategory, winText, outcomeText, quote]
    .join(' ')
    .toLowerCase();

  await env.DB.prepare(`
    INSERT INTO wins (
      id, public_id, first_name, location, role, category, win_text, outcome_text, quote,
      permission_public, permission_social, search_text
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    publicId,
    firstName,
    location || null,
    role || null,
    normalizedCategory,
    winText,
    outcomeText || null,
    quote,
    1,
    permissionSocial ? 1 : 0,
    searchText
  ).run();

  return json({
    ok: true,
    status: 'pending',
    win: {
      id: publicId,
      firstName,
      location,
      role,
      category: normalizedCategory,
      win: winText,
      outcome: outcomeText,
      quote
    },
    share: {
      title: 'I reported an AI Win',
      caption: `${firstName} reported an AI Win: "${quote}" Join the movement at ${env.PUBLIC_SITE_URL || 'https://10millionwins.com'}`,
      url: env.PUBLIC_SITE_URL || 'https://10millionwins.com'
    }
  }, { status: 201 });
};
