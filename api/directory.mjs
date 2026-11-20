import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Directory is temporarily unavailable.' });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT id, business_name, tagline, description, membership_tier, billing_period, category_labels, city, state, postal_code, CASE WHEN show_street_address THEN street_address ELSE NULL END AS street_address, business_email, business_phone, website_url, logo_url, gallery_urls, social_links, google_review_url FROM business_listings WHERE publication_status='published' AND billing_status='source_method_present' ORDER BY CASE membership_tier WHEN 'Bronze PLUS' THEN 0 ELSE 1 END, business_name`;
    return res.status(200).json({ listings: rows, count: rows.length });
  } catch (error) {
    console.error('public directory error', error);
    return res.status(500).json({ error: 'Directory is temporarily unavailable.' });
  }
}
