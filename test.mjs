import assert from 'node:assert/strict';import fs from 'node:fs';import {parseCSV,merge,asHTML,makeZIP} from './dist/core.js';import {catalogs} from './dist/locales.js';
assert.deepEqual(parseCSV('a,b\r\n"x,y","a""b\nnext"\r\n').rows,[['x,y','a"b\nnext']]);
for(const text of ['a,b\nx"y,z','a,b\n"x"z,y','a,b\n"x,y'])assert.throws(()=>parseCSV(text),e=>e.code==='csv');
assert.throws(()=>parseCSV('a,a\nx,y'),e=>e.code==='headers');assert.throws(()=>parseCSV('a,b\nx'),e=>e.code==='columns');
assert.equal(merge('{{id}} / {{value}}','id,value\n00018,9007199254740993').docs[0].text,'00018 / 9007199254740993');
assert.equal(merge('{{value}}','value\n"$& {{id}}"').docs[0].text,'$& {{id}}');
assert.throws(()=>merge('{{missing}}','name\nAlex'),e=>e.code==='missing');assert.throws(()=>merge('{{b}}','a,b\nx,'),e=>e.code==='blank');assert.throws(()=>merge('{{b','a\nx'),e=>e.code==='variables'||e.code==='syntax');
assert.ok(asHTML({name:'x',text:'<script>alert(1)</script> & "'}).includes('&lt;script&gt;'));assert.ok(!asHTML({name:'x',text:'<script>'}).includes('<script>'));
const blob=makeZIP([{name:'a.txt',text:'안녕 <&>\n00001'},{name:'b.txt',text:'line\nnext'}]);fs.writeFileSync('fixture.zip',Buffer.from(await blob.arrayBuffer()));
const keys=Object.keys(catalogs.ko).sort();for(const [lang,c] of Object.entries(catalogs)){assert.deepEqual(Object.keys(c).sort(),keys);assert.deepEqual(Object.keys(c.errors).sort(),Object.keys(catalogs.ko.errors).sort());const path=lang==='ko'?'dist/index.html':`dist/${lang}/index.html`;assert.ok(fs.readFileSync(path,'utf8').includes(`lang="${lang}"`));}
console.log('PASS: CSV quoting/errors, raw values, missing/blank fields, HTML escaping, ZIP fixture, six complete locale catalogs/routes');

for(const [locale,catalog] of Object.entries(catalogs)){const page=fs.readFileSync(locale==='ko'?'dist/index.html':'dist/'+locale+'/index.html','utf8');assert.equal(page.match(/<title>([^<]*)<\/title>/)[1],catalog.title);assert.deepEqual([...page.matchAll(/data-lang="([^"]+)"/g)].map(m=>m[1]),['ko','en','es','zh','ja','de']);assert.ok(page.includes('<html lang="'+locale+'">'));}console.log('PASS: all static localized titles and unique language-menu identities');
