import { json } from '../_utils';

export const onRequestGet: PagesFunction = async () => {
  return json({ ok: true, service: '10millionwins', at: new Date().toISOString() });
};
