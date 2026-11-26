import { neon } from '@neondatabase/serverless';
import { timingSafeEqual } from 'node:crypto';

function authorized(req) {
  const expected = process.env.ADMIN_API_TOKEN || '';
  const supplied = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected), b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}
const parents = new Set(['home','realestate','professional','health','family','food','automotive','transport','pets','media','occasions','retail']);
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if (!authorized(req)) return res.status(401).json({error:'Unauthorized'});
  if (!process.env.DATABASE_URL) return res.status(503).json({error:'Database is not configured'});
  const sql=neon(process.env.DATABASE_URL);
  try {
    if(req.method==='GET'){
      const rows=await sql`SELECT id,source_label,listing_count,proposed_parent,review_status,approved_parent FROM directory_category_review ORDER BY listing_count DESC,source_label ASC`;
      const summary=await sql`SELECT count(*)::int AS total,count(*) FILTER(WHERE review_status='pending')::int AS pending,count(*) FILTER(WHERE review_status='approved')::int AS approved,count(*) FILTER(WHERE review_status='needs_custom')::int AS needs_custom,count(*) FILTER(WHERE review_status='rejected')::int AS rejected FROM directory_category_review`;
      return res.status(200).json({categories:rows,summary:summary[0],allowed_parents:[...parents]});
    }
    if(req.method==='PATCH'){
      const {id,review_status,approved_parent}=req.body||{};
      if(typeof id!=='string'||!['pending','approved','needs_custom','rejected'].includes(review_status))return res.status(400).json({error:'Category id and valid review_status required.'});
      if(review_status==='approved'&&!parents.has(approved_parent))return res.status(400).json({error:'Approved categories must map to one of the supported top-level directory sections.'});
      const rows=await sql`UPDATE directory_category_review SET review_status=${review_status},approved_parent=${review_status==='approved'?approved_parent:null},reviewed_by='admin',reviewed_at=now(),updated_at=now() WHERE id=${id}::uuid RETURNING id,source_label,review_status,approved_parent`;
      if(!rows.length)return res.status(404).json({error:'Category not found'});
      return res.status(200).json({category:rows[0]});
    }
    res.setHeader('Allow','GET, PATCH');return res.status(405).json({error:'Method not allowed'});
  } catch(error){console.error('category review error',error);return res.status(500).json({error:'Category review failed.'});}
}
