import { neon } from '@neondatabase/serverless';
import { timingSafeEqual } from 'node:crypto';

function authorized(req) {
  const expected = process.env.ADMIN_API_TOKEN || '';
  const supplied = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
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
      const { id, publication_status, fields } = req.body || {};
      if (typeof id !== 'string') return res.status(400).json({ error: 'A listing id is required.' });
      if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
        const currentRows = await sql`SELECT * FROM business_listings WHERE id=${id}::uuid`;
        if (!currentRows.length) return res.status(404).json({ error: 'Listing not found.' });
        const current = currentRows[0];
        const allowedStrings = ['business_name','tagline','description','city','state','postal_code','street_address','business_email','business_phone','website_url','logo_url','google_review_url'];
        const next = {};
        for (const key of allowedStrings) {
          if (Object.prototype.hasOwnProperty.call(fields,key)) {
            const value = fields[key];
            if (value !== null && (typeof value !== 'string' || value.length > (key==='description'?5000: key==='tagline'?300:500))) return res.status(400).json({ error: 'Invalid value for '+key+'.' });
            next[key] = value;
          } else next[key] = current[key];
        }
        for (const key of ['show_street_address','hide_contact_name']) {
          if (Object.prototype.hasOwnProperty.call(fields,key) && typeof fields[key] !== 'boolean') return res.status(400).json({ error: 'Invalid value for '+key+'.' });
          next[key] = Object.prototype.hasOwnProperty.call(fields,key) ? fields[key] : current[key];
        }
        if (Object.prototype.hasOwnProperty.call(fields,'category_labels')) {
          if (!Array.isArray(fields.category_labels) || fields.category_labels.length > 30 || fields.category_labels.some(x=>typeof x!=='string'||x.length>120)) return res.status(400).json({ error: 'Category labels must be an array of up to 30 short text values.' });
          next.category_labels = fields.category_labels;
        } else next.category_labels = current.category_labels;
        if (Object.prototype.hasOwnProperty.call(fields,'gallery_urls')) {
          if (!Array.isArray(fields.gallery_urls) || fields.gallery_urls.length > 20 || fields.gallery_urls.some(x=>typeof x!=='string'||x.length>2048)) return res.status(400).json({ error: 'Gallery URLs must be an array of up to 20 URLs.' });
          next.gallery_urls = fields.gallery_urls;
        } else next.gallery_urls = current.gallery_urls;
        if (Object.prototype.hasOwnProperty.call(fields,'social_links')) {
          if (!fields.social_links || typeof fields.social_links!=='object' || Array.isArray(fields.social_links)) return res.status(400).json({ error: 'Social links must be an object.' });
          next.social_links = fields.social_links;
        } else next.social_links = current.social_links;
        if (!next.business_name || !next.business_name.trim()) return res.status(400).json({ error: 'Business name cannot be blank.' });
        const rows = await sql`UPDATE business_listings SET business_name=${next.business_name},tagline=${next.tagline},description=${next.description},city=${next.city},state=${next.state},postal_code=${next.postal_code},street_address=${next.street_address},business_email=${next.business_email},business_phone=${next.business_phone},website_url=${next.website_url},logo_url=${next.logo_url},google_review_url=${next.google_review_url},show_street_address=${next.show_street_address},hide_contact_name=${next.hide_contact_name},category_labels=${next.category_labels},gallery_urls=${next.gallery_urls},social_links=${JSON.stringify(next.social_links)}::jsonb,updated_at=now() WHERE id=${id}::uuid RETURNING id,business_name,updated_at`;
        return res.status(200).json({ listing: rows[0] });
      }
      if (!['staged','approved','published','suspended'].includes(publication_status)) {
        return res.status(400).json({ error: 'A valid publication_status is required.' });
      }
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
