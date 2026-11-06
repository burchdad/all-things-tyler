import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {data} from '../src/data.ts';
import {results,restore,serialize} from '../src/core.ts';
import {editDistance,searchDirectory} from '../src/search.ts';
const state={category:'',query:'',seed:'search-guidance',listing:'',path:[]};
const report=(query:string,category='')=>searchDirectory(data,{...state,query,category});
const ids=(query:string)=>report(query).businesses.map(b=>b.id).sort();

test('generic conversational requests do not need a hardcoded full sentence',()=>{
 for(const query of ['Could you recommend a place to get flowers?','I would like suggestions for bouquets','Where can I find flowers around Tyler?'])assert.deepEqual(ids(query),['demo-01','demo-07'],query);
 for(const query of ['Where can I find a coffee shop?','Show me local coffee businesses','Any recommendations for cafés?'])assert.deepEqual(ids(query),['demo-05','demo-06'],query);
 assert.deepEqual(ids('Can you find someone to repair my a/c?'),['demo-02','demo-03']);
});
test('explicit alternatives are a union, ordinary conjunction remains strict',()=>{
 assert.deepEqual(ids('coffee or flowers'),['demo-01','demo-05','demo-06','demo-07']);
 assert.deepEqual(ids('coffee or coffee'),['demo-05','demo-06']);
 assert.deepEqual(ids('coffee and flowers'),[]);
 assert.deepEqual(ids('coffee or astronaut'),['demo-05','demo-06']);
 assert.match(report('coffee or flowers').notice,/any of the named alternatives/);
});
test('a question with no service intent never silently returns every business',()=>{
 for(const q of ['please help','Can you recommend someone?','!!!','or','open now'])assert.equal(report(q).businesses.length,0,q);
 assert.equal(report('').businesses.length,data.businesses.length);
 assert.match(report('please help').notice,/name a service/);
});
test('open-now and timing requests give candidates, never verified availability',()=>{
 for(const q of ['coffee open now','flowers this weekend','coffee tonight','shirts with our logo tomorrow']){
  const r=report(q);assert(r.businesses.length>0,q);assert.match(r.notice,/Opening hours, availability, response times and rush turnaround are not verified/);
 }
 assert.match(report('coffee near me').notice,/Distance and service areas are not verified/);
 assert.deepEqual(ids('coffee in Dallas'),[]);
});
test('typos are optional, dataset-grounded corrections, never silently applied',()=>{
 for(const q of ['cofee','flwoers','plumer','Rosewod Cup']){
  const r=report(q);assert.equal(r.businesses.length,0,q);
  const s=r.suggestions.find(s=>s.kind==='spelling');assert(s,q);
  assert(results(data,{...state,query:s.query}).length>0);
 }
 assert.equal(editDistance('flower','flwoer'),1);
});
test('corrections use new listing vocabulary without adding a phrase dictionary',()=>{
 const d=structuredClone(data);d.businesses=[{...data.businesses[0],id:'test-telescope',name:'Demo Telescope Workshop',description:'Fictional telescope repair example.',keywords:['telescope']}];
 const r=searchDirectory(d,{...state,query:'telescpoe'});
 assert.equal(r.businesses.length,0);assert.equal(r.suggestions[0]?.query,'telescope');
 assert.equal(results(d,{...state,query:r.suggestions[0].query})[0].id,'test-telescope');
});
test('ambiguous spelling is not guessed and missing services are not invented',()=>{
 const d=structuredClone(data);d.businesses=[{...data.businesses[0],id:'test-cat',name:'Demo Cats',description:'Fictional cat listing.',keywords:['cart','cast']}];
 assert.equal(searchDirectory(d,{...state,query:'catt'}).suggestions.length,0);
 const removed={...data,businesses:data.businesses.filter(b=>!['demo-05','demo-06'].includes(b.id))};
 assert.equal(searchDirectory(removed,{...state,query:'cofee'}).suggestions.length,0);
});
test('unknown substantive constraints are never discarded by typo help',()=>{
 for(const q of ['dog sitter who speaks Klingon','logo shirts made of titanium','licensed coffee','coffee under ten dollars','coffee gluten free']){
  const r=report(q);assert.equal(r.businesses.length,0,q);assert.equal(r.suggestions.length,0,q);
 }
});
test('negated requests remain blocked, including mixed alternatives',()=>{
 for(const q of ["I don't need plumbing",'coffee without espresso','not flowers or coffee','coffee except Rosewood','no dog sitter']){
  const r=report(q);assert.equal(r.businesses.length,0,q);assert.equal(r.suggestions.length,0,q);assert.match(r.notice,/exclusions/);
 }
 assert.equal(ids('my a/c is not working').length,2);
});
test('negative description disclaimers do not create service eligibility',()=>{
 const d=structuredClone(data);d.businesses=[{...data.businesses[0],description:'Fictional pet sitting example. No helicopter service or bookings are offered.',keywords:['pet_sitting']}];
 for(const query of ['helicopter','bookings'])assert.equal(results(d,{...state,query}).length,0);
});
test('scope guidance preserves the query and only offers existing outside matches',()=>{
 const r=report('coffee','pets');assert.equal(r.businesses.length,0);
 assert.deepEqual(r.suggestions,[{kind:'scope',label:'Search all categories (2 fictional matches)',query:'coffee',clearCategory:true}]);
 const s=report('cofee','pets').suggestions[0];assert.equal(s.kind,'spelling');assert.equal(s.clearCategory,true);assert.match(s.label,/all categories/);
 assert.equal(report('astronaut','pets').suggestions.length,0);
});
test('ratings and price requirements are not inferred or automatically relaxed',()=>{
 for(const query of ['best coffee','five star coffee','cheap coffee','coffee reviews']){
  const r=report(query);assert.equal(r.businesses.length,0);assert.match(r.notice,/no verified ratings, reviews or prices/);
  const s=r.suggestions.find(s=>s.kind==='requirements');assert(s,query);assert.equal(s.query,'coffee');assert.match(s.label,/without rating or price requirements/);
 }
});
test('both tiers, seeded ordering and URL restoration survive richer searches',()=>{
 const s={...state,query:'coffee or flowers'};const found=results(data,s);
 assert.deepEqual(found.map(b=>b.tier),['BronzePlus','BronzePlus','Bronze','Bronze']);
 assert.deepEqual(results(data,restore(serialize(s),data)),found);
 assert.equal(new Set(found.map(b=>b.id)).size,found.length);
});
test('suggestion UI escapes content, preserves scope by default and moves focus',()=>{
 const app=readFileSync(new URL('../src/app.ts',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(app,/escape\(s\.query\)/);assert.match(app,/escape\(s\.label\)/);
 assert.match(app,/dataset\.clearCategory==='true'/);assert.match(app,/el\('results'\)\.focus\(\)/);
 assert.match(html,/role="group" aria-label="Search suggestions"/);
 assert.match(html,/without a live AI service/);
});
