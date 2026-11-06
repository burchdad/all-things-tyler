import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {data} from '../src/data.ts';
import {results,searchNotice} from '../src/core.ts';
const state={category:'',query:'',seed:'sarah-review',listing:'',path:[]};
const ids=(query:string,category='')=>results(data,{...state,query,category}).map(b=>b.id);
test('Sarah exact questions return only directory-grounded fictional examples',()=>{
 assert.deepEqual(ids('My toilet is overflowing and I need help!'),['demo-09']);
 assert.deepEqual(ids('We’re going out of town and I need someone to sit our dog while we’re gone'),['demo-13']);
 assert.deepEqual(ids('I need shirts made w our logo asap! Who can help?'),['demo-14']);
});
test('nearby phrasings work without claiming timing or inventing listings',()=>{
 for(const q of ['dog sitter while away','pet sitting','I need someone to watch my dog while I am away','urgent dog sitter']) assert.deepEqual(ids(q),['demo-13'],q);
 for(const q of ['custom shirts','shirts with our logo urgently','logo shirts today','custom apparel']) assert.deepEqual(ids(q),['demo-14'],q);
 assert.match(searchNotice('logo shirts asap'),/not verified/);
});
test('unknown constraints, negation and category mismatch remain honest no-matches',()=>{
 for(const q of ['astronaut','dog sitter who speaks Klingon','I do not need a dog sitter','I do not need logo shirts','logo shirts made of titanium'])assert.deepEqual(ids(q),[],q);
 assert.deepEqual(ids('dog sitter','food'),[]);
 const d={...data,businesses:data.businesses.filter(b=>b.id!=='demo-13')};
 assert.deepEqual(results(d,{...state,query:'dog sitter'}),[]);
});
test('display omits tiers and keyword diagnostics while retaining notices',()=>{
 const app=readFileSync(new URL('../src/app.ts',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(app,/b\.tier|b\.keywords|matched terms|Demo search keywords/);
 assert.doesNotMatch(html,/BronzePlus|Bronze/);
 assert.match(app,/FICTIONAL LISTING/);assert.match(html,/Fictional listings only/);
});
