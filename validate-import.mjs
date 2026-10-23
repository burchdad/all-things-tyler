import {readFile} from 'node:fs/promises';import {validate} from './src/core.ts';
if(!process.argv[2]){console.error('Usage: node validate-import.mjs fictional-dataset.json');process.exit(1);}
try{const d=validate(JSON.parse(await readFile(process.argv[2],'utf8')));console.log(`Valid fictional dataset: ${d.categories.length} categories, ${d.businesses.length} businesses. No data written.`);}catch(e){console.error('Import rejected:',e.message);process.exit(1);}
