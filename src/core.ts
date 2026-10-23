export type Category={id:string;name:string;level:1|2|3;parents:string[]};
export type Business={id:string;name:string;tier:'BronzePlus'|'Bronze';categoryIds:string[];description:string;keywords:string[];provenance:{kind:'fictional';source:string}};
export type Dataset={categories:Category[];businesses:Business[]};
export type State={category:string;query:string;seed:string;listing:string;path:string[]};
export function validate(input:unknown):Dataset{
 if(!input||typeof input!=='object')throw Error('Expected dataset object');
 const d=input as Dataset;if(!Array.isArray(d.categories)||!Array.isArray(d.businesses))throw Error('categories and businesses must be arrays');
 const ids=new Set<string>();for(const c of d.categories){if(!c||typeof c.id!=='string'||!/^[-a-z0-9]+$/.test(c.id)||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim()||![1,2,3].includes(c.level)||!Array.isArray(c.parents)||new Set(c.parents).size!==c.parents.length)throw Error('Invalid or duplicate category');ids.add(c.id);}
 const cats=new Map(d.categories.map(c=>[c.id,c]));for(const c of d.categories){if(c.level===1?c.parents.length!==0:c.parents.length===0)throw Error('Invalid parent count');for(const p of c.parents)if(cats.get(p)?.level!==c.level-1)throw Error('Parents must exist at previous level');}
 const bids=new Set<string>();for(const b of d.businesses){if(!b||typeof b.id!=='string'||!/^[-a-z0-9]+$/.test(b.id)||bids.has(b.id)||typeof b.name!=='string'||!b.name.trim()||!['BronzePlus','Bronze'].includes(b.tier)||typeof b.description!=='string'||!Array.isArray(b.keywords)||b.keywords.some(k=>typeof k!=='string')||!Array.isArray(b.categoryIds)||!b.categoryIds.length||new Set(b.categoryIds).size!==b.categoryIds.length||b.categoryIds.some(id=>!ids.has(id))||b.provenance?.kind!=='fictional'||typeof b.provenance.source!=='string'||!b.provenance.source.trim())throw Error('Invalid business or missing fictional provenance');bids.add(b.id);}
 return d;
}
export function descendants(categories:Category[],id:string):Set<string>{const out=new Set<string>([id]);let changed=true;while(changed){changed=false;for(const c of categories)if(!out.has(c.id)&&c.parents.some(p=>out.has(p))){out.add(c.id);changed=true;}}return out;}
// Explicit reviewed dictionary: bounded deterministic matching, not general AI.
const synonyms:Record<string,string>={toilets:'plumbing',toilet:'plumbing',overflowing:'emergency_service',overflow:'emergency_service',overflows:'emergency_service',emergencies:'emergency_service',emergency:'emergency_service',urgent:'emergency_service',urgently:'emergency_service',dont:'not',ac:'hvac',air:'hvac',conditioning:'hvac',cooling:'hvac',conditioner:'hvac',broken:'repair',fix:'repair',fixing:'repair',repairs:'repair',leak:'plumbing',leaking:'plumbing',pipes:'plumbing',plumber:'plumbing',plumbers:'plumbing',flowers:'floral',flower:'floral',bouquet:'floral',espresso:'coffee',yard:'landscaping',lawn:'landscaping',colour:'color',colorist:'color_specialist',colourist:'color_specialist'};
const stop=new Set(['am','a','an','the','i','my','our','we','need','needs','someone','to','for','with','is','are','in','tyler','help','me','find','and','working','please','pls','can','could','you','who','does','do','anyone','looking','near','nearby','some','service','services','now','right','has','have','that','this']);
const descriptive=new Set(['emergency_service','color_specialist','curly_hair_specialist']);
export function terms(s:string):string[]{
 const normalized=s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9_]+/g,' ').replace(/\bnot working\b/g,' repair ')
 .replace(/\b(?:curly|curled|curl)\s+hair(?:\s+(?:specialists?|experts?|styling|stylists?))?\b/g,' curly_hair_specialist ')
 .replace(/\b(?:hair\s+)?colou?r(?:ing)?\s+(?:specialists?|experts?)\b/g,' color_specialist ')
 .replace(/\b(?:specialists?|experts?)\s+(?:in\s+)?(?:hair\s+)?colou?r(?:ing)?\b/g,' color_specialist ');
 return [...new Set(normalized.split(/\s+/).filter(w=>w&&!stop.has(w)).map(w=>synonyms[w]||w))];
}
export function matchingTerms(d:Dataset,b:Business,query:string):string[]{
 const categoryNames=d.categories.filter(c=>b.categoryIds.some(id=>descendants(d.categories,c.id).has(id))).map(c=>c.name);
 const ordinary=terms([b.name,b.description,...categoryNames].join(' ')).filter(t=>!descriptive.has(t));
 const premium=b.tier==='BronzePlus'?terms(b.keywords.join(' ')):[];
 const available=new Set([...ordinary,...premium]);
 return terms(query).filter(t=>available.has(t));
}
function hash(s:string):number{let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function results(d:Dataset,state:State):Business[]{const allowed=state.category?descendants(d.categories,state.category):null;const q=terms(state.query);return d.businesses.filter(b=>(!allowed||b.categoryIds.some(id=>allowed.has(id)))&&matchingTerms(d,b,state.query).length===q.length).sort((a,b)=>(a.tier===b.tier?0:a.tier==='BronzePlus'?-1:1)||(hash(state.seed+':'+a.id)-hash(state.seed+':'+b.id))||a.id.localeCompare(b.id));}
export type ResultAction='visit'|'search'|'category'|'back'|'clear'|'refresh'|'render'|'typing'|'listing'|'return'|'history'|'share';
export function applyShuffle(s:State,action:ResultAction,newSeed:()=>string):State{
 return ['visit','search','category','back','clear','refresh'].includes(action)?{...s,seed:newSeed()}:s;
}
export function restore(search:string,d:Dataset):State{const p=new URLSearchParams(search);const category=p.get('category')||'';const path=(p.get('path')||'').split('/').filter(Boolean);const validPath=path.every((id,i)=>{const c=d.categories.find(c=>c.id===id);return c&&(i===0?c.level===1:c.parents.includes(path[i-1]));})&&path.at(-1)===category;return {category:d.categories.some(c=>c.id===category)?category:'',query:(p.get('q')||'').slice(0,200),seed:(p.get('seed')||'review-1').slice(0,80),listing:d.businesses.some(b=>b.id===p.get('listing'))?p.get('listing')!:'',path:validPath?path:[]};}
export function serialize(s:State):string{const p=new URLSearchParams();p.set('view','directory');if(s.category)p.set('category',s.category);if(s.query)p.set('q',s.query);p.set('seed',s.seed);if(s.listing)p.set('listing',s.listing);if(s.path.length)p.set('path',s.path.join('/'));return '?'+p.toString();}
