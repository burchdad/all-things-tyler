import {availableTerms,hasNegation,normalizeText,queryAlternatives,results,searchAliases,searchNotice,searchTerms,terms} from './core.ts';
import type {Business,Dataset,State} from './core.ts';

export type SearchSuggestion={kind:'spelling'|'scope'|'requirements';label:string;query:string;clearCategory:boolean};
export type SearchReport={businesses:Business[];notice:string;suggestions:SearchSuggestion[]};

// Optimal-string-alignment distance also recognizes one adjacent transposition.
export function editDistance(a:string,b:string):number{
 const rows=Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i===0?j:j===0?i:0));
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
  rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])rows[i][j]=Math.min(rows[i][j],rows[i-2][j-2]+1);
 }
 return rows[a.length][b.length];
}

function spellingSuggestion(d:Dataset,state:State):SearchSuggestion|undefined{
 if(queryAlternatives(state.query).length!==1||hasNegation(state.query))return;
 const known=new Set(d.businesses.flatMap(b=>[...availableTerms(d,b)]));
 // Build candidates from this dataset, not a general dictionary or outside results.
 const source=[...d.categories.map(c=>c.name),...d.businesses.flatMap(b=>[b.name,...b.keywords]),...searchAliases].join(' ');
 const candidates=[...new Set(normalizeText(source).split(/\s+/))].filter(word=>word.length>=4&&terms(word).length===1&&known.has(terms(word)[0]));
 const query=searchTerms(state.query);let changes=0;
 const corrected=query.map(word=>{
  if(known.has(word)||word.length<4||!/^[a-z]+$/.test(word))return word;
  const threshold=word.length>=7?2:1;
  const ranked=candidates.map(candidate=>({word:candidate,distance:editDistance(word,candidate),concept:terms(candidate)[0]})).filter(x=>x.distance<=threshold).sort((a,b)=>a.distance-b.distance||a.word.localeCompare(b.word));
  if(!ranked.length)return word;
  const nearest=ranked.filter(x=>x.distance===ranked[0].distance);
  if(new Set(nearest.map(x=>x.concept)).size!==1)return word;
  changes++;return nearest[0].word;
 });
 if(!changes||changes>2)return;
 const queryText=corrected.join(' ').replaceAll('_',' ');
 const inCategory=results(d,{...state,query:queryText});
 const acrossDirectory=inCategory.length?inCategory:results(d,{...state,query:queryText,category:''});
 if(!acrossDirectory.length)return;
 const clearCategory=Boolean(state.category&&!inCategory.length);
 return {kind:'spelling',label:`Did you mean “${queryText}”${clearCategory?' in all categories':''}?`,query:queryText,clearCategory};
}

const unsupportedRequirements=/\b(?:top rated|highest rated|five stars?|four stars?|[45] stars?|best|cheapest|cheap|affordable|ratings?|reviews?)\b/g;
export function searchDirectory(d:Dataset,state:State):SearchReport{
 const businesses=results(d,state);
 const suggestions:SearchSuggestion[]=[];
 if(!state.query.trim())return {businesses,notice:'',suggestions};
 const normalized=normalizeText(state.query);
 if(hasNegation(state.query))return {businesses,notice:'This search cannot safely interpret exclusions yet. Please name the service or business you do want. No businesses have been recommended.',suggestions};
 const meaningful=searchTerms(state.query).filter(t=>t!=='or');
 if(!meaningful.length)return {businesses,notice:'Please name a service, category or business, such as coffee or plumbing. A general request alone is not enough to choose a listing.',suggestions};
 let notice=searchNotice(state.query);
 if(/\b(?:near me|nearest|closest|nearby)\b/.test(normalized))notice+=' Distance and service areas are not verified.';
 const relaxed=normalized.replace(unsupportedRequirements,' ').replace(/\s+/g,' ').trim();
 const hasRequirements=relaxed!==normalized;
 if(hasRequirements)notice+=' This demo has no verified ratings, reviews or prices; it cannot rank businesses by those requirements.';
 if(queryAlternatives(state.query).length>1)notice+=' “Or” searches return listings matching any of the named alternatives.';
 if(!businesses.length){
  if(state.category){
   const outside=results(d,{...state,category:''});
   if(outside.length)suggestions.push({kind:'scope',label:`Search all categories (${outside.length} fictional ${outside.length===1?'match':'matches'})`,query:state.query,clearCategory:true});
  }
  const spelling=spellingSuggestion(d,state);if(spelling)suggestions.push(spelling);
  if(hasRequirements&&searchTerms(relaxed).length&&results(d,{...state,query:relaxed}).length){
   suggestions.push({kind:'requirements',label:`Search “${relaxed}” without rating or price requirements`,query:relaxed,clearCategory:false});
  }
  if(!suggestions.length)notice+=' No listing meets all the remaining search terms. Try a simpler service name; missing details are not assumed.';
 }
 return {businesses,notice,suggestions};
}
