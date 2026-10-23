import {stripTypeScriptTypes} from 'node:module';
import {readdir,readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of await readdir('src')) if(name.endsWith('.ts')) await writeFile(`dist/${name.replace('.ts','.js')}`,stripTypeScriptTypes((await readFile(`src/${name}`,'utf8')).replaceAll(".ts'",".js'")));
for(const name of ['index.html','style.css']) await copyFile(name,`dist/${name}`);
console.log('Built local-only static demonstration. No network or credentials required.');
