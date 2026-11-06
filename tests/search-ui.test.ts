import {test} from 'node:test';
import assert from 'node:assert/strict';

// A small DOM fixture verifies event/state wiring, not browser layout or accessibility.
test('search suggestion actions preserve scope, restore history and reset correctly',async()=>{
 const elements=new Map<string,any>();let focused='';
 const element=(id:string)=>{
  if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',hidden:false,disabled:false,attrs:new Map(),listeners:new Map(),focus(){focused=id;},getAttribute(name:string){return this.attrs.get(name);},setAttribute(name:string,value:string){this.attrs.set(name,value);},addEventListener(name:string,fn:any){this.listeners.set(name,fn);},classList:{toggle(){}}});
  return elements.get(id);
 };
 const listeners=new Map<string,any>();const popstate=new Map<string,any>();
 const location={search:'?view=directory&category=food&path=food&q=cofee&seed=original',href:'http://localhost/'};
 const historyEntries=[location.search];
 const history={pushState(_a:any,_b:any,url:string){location.search=url;historyEntries.push(url);},replaceState(_a:any,_b:any,url:string){location.search=url;historyEntries[historyEntries.length-1]=url;}};
 const saved=new Map(['document','window','history','location'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 Object.assign(globalThis,{document:{getElementById:element,addEventListener:(event:string,fn:any)=>listeners.set(event,fn)},window:{addEventListener:(event:string,fn:any)=>popstate.set(event,fn)},history,location});
 try{
  await import('../src/app.ts');
  assert.match(element('search-options').innerHTML,/Did you mean/);
  const click=(dataset:Record<string,string>)=>listeners.get('click')({target:{closest:()=>({dataset})},preventDefault(){}});
  click({refineQuery:'coffee',clearCategory:'false'});
  let p=new URLSearchParams(location.search);assert.equal(p.get('q'),'coffee');assert.equal(p.get('category'),'food');assert.equal(p.get('path'),'food');assert.equal(focused,'results');assert.match(element('count').textContent,/2 fictional listings/);
  location.search=historyEntries[0];popstate.get('popstate')();
  assert.equal(element('query').value,'cofee');assert.match(element('search-options').innerHTML,/Did you mean/);
  location.search='?view=directory&category=pets&path=pets&q=coffee&seed=scope';popstate.get('popstate')();
  assert.match(element('search-options').innerHTML,/Search all categories/);
  click({refineQuery:'coffee',clearCategory:'true'});
  p=new URLSearchParams(location.search);assert.equal(p.get('q'),'coffee');assert.equal(p.get('category'),null);assert.equal(p.get('path'),null);assert.equal(element('search-options').innerHTML,'');
  const oldSeed=p.get('seed');element('search').listeners.get('submit')({preventDefault(){}});
  assert.notEqual(new URLSearchParams(location.search).get('seed'),oldSeed);assert.match(element('count').textContent,/2 fictional listings/);
  element('clear').onclick();assert.equal(element('query').value,'');assert.equal(element('search-options').innerHTML,'');assert.match(element('count').textContent,/14 fictional listings/);
 }finally{for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}}
});
