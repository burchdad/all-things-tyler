import { neon } from '@neondatabase/serverless';
import { timingSafeEqual } from 'node:crypto';

function authorized(req) {
  const expected = process.env.ADMIN_API_TOKEN || '';
  const supplied = (req.headers.authorization || '').replace(/^Bearer\\s+/i, '');
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database is not configured' });
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, business_name, tagline, description, membership_tier, billing_period, billing_status, publication_status, category_labels, city, state, postal_code, street_address, show_street_address, hide_contact_name, business_email, business_phone, website_url, logo_url, gallery_urls, social_links, google_review_url, created_at FROM business_listings ORDER BY membership_tier DESC, business_name ASC`;
      const summary = await sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE publication_status='staged')::int AS staged, count(*) FILTER (WHERE publication_status='approved')::int AS approved, count(*) FILTER (WHERE publication_status='published')::int AS published, count(*) FILTER (WHERE billing_status='needs_review')::int AS billing_review FROM business_listings`;
      return res.status(200).json({ listings: rows, summary: summary[0] });
    }
    if (req.method === 'PATCH') {
      const { id, publication_status } = req.body || {};
      if (typeof id !== 'string' || !['staged','approved','published','suspended'].includes(publication_status)) {
        return res.status(400).json({ error: 'A listing id and valid publication_status are required.' });
      }
      if (publication_status === 'published') {
        const rows = await sql`UPDATE business_listings SET publication_status='published', updated_at=now() WHERE id=${id}::uuid AND publication_status='approved' AND billing_status='source_method_present' RETURNING id, publication_status`;
        if (!rows.length) return res.status(409).json({ error: 'Publish requires prior approval and a billing method present in the source export. This does not independently verify payment.' });
        return res.status(200).json({ listing: rows[0] });
      }
      const rows = await sql`UPDATE business_listings SET publication_status=${publication_status}, updated_at=now() WHERE id=${id}::uuid RETURNING id, publication_status`;
      if (!rows.length) return res.status(404).json({ error: 'Listing not found.' });
      return res.status(200).json({ listing: rows[0] });
    }
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin listings error', error);
    return res.status(500).json({ error: 'Directory operation failed.' });
  }
}
