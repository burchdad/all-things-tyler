import {test} from 'node:test';import assert from 'node:assert/strict';import {data} from '../src/data.ts';import {descendants,results,restore,serialize,validate,terms,applyShuffle} from '../src/core.ts';
const state={category:'',query:'',seed:'review-1',listing:'',path:[]};
test('multi-parent descendants visible on both root paths',()=>{assert(descendants(data.categories,'home').has('floral'));assert(descendants(data.categories,'occasions').has('floral'));for(const category of ['home','outdoors','gifts','occasions','floral'])assert(results(data,{...state,category}).some(b=>b.id==='demo-01'));});
test('business assigned directly to L2 visible at L1 and L2, not unrelated L3',()=>{for(const category of ['home','repairs'])assert(results(data,{...state,category}).some(b=>b.id==='demo-08'));assert(!results(data,{...state,category:'hvac'}).some(b=>b.id==='demo-08'));});
test('tier precedence applies for all seeds',()=>{for(const seed of ['a','b','c','review-1']){const tiers=results(data,{...state,seed}).map(b=>b.tier);assert(!tiers.slice(tiers.indexOf('Bronze')).includes('BronzePlus'));}});
test('seed order reproducible and can differ without duplicates',()=>{const ids=(seed:string)=>results(data,{...state,seed}).map(b=>b.id);assert.deepEqual(ids('a'),ids('a'));assert.notDeepEqual(ids('a'),ids('b'));assert.equal(new Set(ids('a')).size,data.businesses.length);});
test('URL restores query, category path, seed, and listing',()=>{const s={...state,category:'floral',path:['occasions','gifts','floral'],query:'flowers & gifts',listing:'demo-01'};assert.deepEqual(restore(serialize(s),data),s);});
test('invalid URL categories, listings and path safely discarded',()=>{const s=restore('?category=missing&listing=bad&path=food/hvac',data);assert.equal(s.category,'');assert.equal(s.listing,'');assert.deepEqual(s.path,[]);assert.deepEqual(restore('?category=floral&path=home/floral',data).path,[]);});
test('intent-aware phrases deterministically match descriptive keywords',()=>{assert.deepEqual(results(data,{...state,query:'my air conditioner needs fixing'}).map(b=>b.id).sort(),['demo-02','demo-03']);assert.deepEqual(results(data,{...state,query:'leaking pipes'}).map(b=>b.id),['demo-09','demo-03']);assert.equal(results(data,{...state,query:'flowers'}).length,2);assert.equal(results(data,{...state,query:'coffee'}).length,2);});
test('unknown search has empty result and category search intersects',()=>{assert.equal(results(data,{...state,query:'astronaut'}).length,0);assert.equal(results(data,{...state,category:'food',query:'plumbing'}).length,0);});
test('schema rejects missing references, cycles, invalid tiers, duplicates and live data',()=>{for(const mutate of [(d:any)=>d.categories[0].parents=['floral'],(d:any)=>d.categories[3].parents=['missing'],(d:any)=>d.businesses[0].tier='Gold',(d:any)=>d.businesses[0].categoryIds=['missing'],(d:any)=>d.businesses[0].provenance.kind='live',(d:any)=>d.businesses.push(d.businesses[0])]){const d=structuredClone(data);mutate(d);assert.throws(()=>validate(d));}assert.equal(validate(data),data);});

test('handoff overflowing toilet intent resolves only fictional emergency plumbing record',()=>{assert.deepEqual(results(data,{...state,query:'my toilet is overflowing! help!'}).map(b=>b.id),['demo-09']);});

test('twelve source-observed broad labels retain fictional listing provenance',()=>{assert.equal(data.categories.filter(c=>c.level===1).length,12);assert(data.businesses.every(b=>b.provenance.kind==='fictional'));});
test('shared URLs explicitly restore the directory view',()=>{assert.equal(new URLSearchParams(serialize(state)).get('view'),'directory');});

test('original descriptive phrases and natural variants match only eligible fictional Plus examples',()=>{
 const cases:Record<string,string[]>={
 'emergency services':['demo-09'],'I need emergency services please':['demo-09'],'my toilet is overflowing please help':['demo-09'],'MY TOILET IS OVERFLOWING!!! HELP!':['demo-09'],'please find an emergency plumber near me':['demo-09'],
 'color specialist':['demo-10'],'colour specialist':['demo-10'],'I am looking for a hair color specialist':['demo-10'],'colorist':['demo-10'],
 'curly hair specialist':['demo-11'],'Please find someone for curly hair':['demo-11'],'curly-hair specialists':['demo-11']};
 for(const [query,expected] of Object.entries(cases))assert.deepEqual(results(data,{...state,query}).map(b=>b.id),expected,query);
});
test('Bronze descriptive keywords cannot unlock specialist searches even if present in data or description',()=>{
 const d=structuredClone(data);const b=d.businesses.find(b=>b.id==='demo-12')!;b.keywords=['color specialist','curly hair specialist','emergency services'];b.description='color specialist and curly hair specialist emergency services';
 for(const query of b.keywords)assert(!results(d,{...state,query}).some(x=>x.id===b.id));
 assert(results(d,{...state,query:'Everyday Salon'}).some(x=>x.id===b.id));assert(results(d,{...state,query:'Hair salons'}).some(x=>x.id===b.id));
});
test('Plus descriptive search requires explicit keyword, not incidental wording',()=>{const d=structuredClone(data);d.businesses.find(b=>b.id==='demo-09')!.keywords=[];assert.equal(results(d,{...state,query:'emergency services'}).length,0);});
test('new logical visits/search/category/back/clear refresh seed; incidental events do not',()=>{
 let calls=0;const next=()=>`event-${++calls}`;
 for(const action of ['visit','search','category','back','clear','refresh'] as const){const n=applyShuffle(state,action,next);assert.notEqual(n.seed,state.seed);assert.equal(n.query,state.query);}
 assert.equal(calls,6);for(const action of ['render','typing','listing','return','history','share'] as const)assert.equal(applyShuffle(state,action,next),state);assert.equal(calls,6);
});
test('new search seeds preserve filters and tier boundaries, copied URL restores exact result order',()=>{
 const s={...state,category:'home',path:['home'],query:'plumbing'};
 const n=applyShuffle(s,'search',()=> 'new-search');assert.deepEqual({...n,seed:s.seed},s);
 assert.deepEqual(results(data,restore(serialize(n),data)).map(b=>b.id),results(data,n).map(b=>b.id));
 assert.deepEqual(results(data,n).map(b=>b.tier),['BronzePlus','Bronze']);
});

test('urgent variant supported while negated emergency requests do not become recommendations',()=>{assert.deepEqual(results(data,{...state,query:'I need a plumber urgently'}).map(b=>b.id),['demo-09']);assert.equal(results(data,{...state,query:'I do not need emergency services'}).length,0);assert.equal(results(data,{...state,query:"I don't need emergency services"}).length,0);});
