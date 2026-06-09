export interface Env {
  DB: D1Database;
  ADMIN_TOKEN?: string;
  PUBLIC_SITE_URL?: string;
}

export const CATEGORIES = new Set([
  'work',
  'small-business',
  'family',
  'school',
  'creativity',
  'money',
  'health',
  'community',
  'first-win'
]);

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {})
    }
  });
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function cleanText(value: unknown, max = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function requireAdmin(request: Request, env: Env) {
  const expected = env.ADMIN_TOKEN;
  if (!expected) return false;
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${expected}`;
}

export function makePublicId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function buildQuote(winText: string) {
  const normalized = cleanText(winText, 420);
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return (match ? match[0] : normalized).trim();
}

export function statusFromAction(action: string) {
  if (action === 'approve') return 'approved';
  if (action === 'reject') return 'rejected';
  if (action === 'restore') return 'pending';
  return null;
}

export function rowToPublicWin(row: Record<string, unknown>) {
  return {
    id: row.public_id,
    firstName: row.first_name,
    location: row.location,
    role: row.role,
    category: row.category,
    win: row.win_text,
    outcome: row.outcome_text,
    quote: row.quote,
    featured: Boolean(row.featured),
    promote: Boolean(row.promote),
    createdAt: row.created_at,
    approvedAt: row.approved_at
  };
}
