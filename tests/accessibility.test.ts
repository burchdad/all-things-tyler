import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.ts',import.meta.url),'utf8');
test('category navigation focus target is programmatically focusable and wired after rerender',()=>{
 assert.match(html,/id="breadcrumbs" tabindex="-1" aria-label="Category path"/);
 assert.match(app,/render\(\);if\(\['category','back','clear'\]\.includes\(action\)\)el\('breadcrumbs'\)\.focus\(\)/);
});
test('repeated listing links have business-specific accessible names',()=>{
 assert.ok(app.includes('aria-label="View demo listing: ${escape(b.name)}"'));
});
