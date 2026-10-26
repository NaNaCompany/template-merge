import {merge,asHTML,makeZIP} from './core.js';
import {catalogs} from './locales.js';
const lang=document.documentElement.lang,c=catalogs[lang]||catalogs.ko,$=id=>document.getElementById(id);let result=null;
document.title=c.title;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=c[el.dataset.i18n]);document.querySelector('.languages').setAttribute('aria-label',c.language);document.querySelector(`[data-lang="${lang}"]`).setAttribute('aria-current','page');
function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
function clear(){result=null;$('preview').textContent='';$('document').replaceChildren();document.querySelectorAll('[data-export]').forEach(b=>b.disabled=true);status(c.stale);}
function show(){if(result)$('preview').textContent=result.docs[Number($('document').value)||0].text;}
function run(){clear();try{result=merge($('template').value,$('csv').value);result.docs.forEach((d,i)=>{const o=document.createElement('option');o.value=i;o.textContent=d.name;$('document').append(o);});show();document.querySelectorAll('[data-export]').forEach(b=>b.disabled=false);status(c.ready.replace('{n}',result.docs.length).replace('{f}',result.fields.length));}catch(e){status((c.errors[e.code]||c.errors.unknown)+(e.detail||''),true);}}
function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status(c.downloaded);}
$('example').onclick=()=>{$('template').value=c.sample;$('csv').value='name,date,code\r\nAlex,2026-11-12,00127\r\nSam,2026-11-12,00008';run();};
$('run').onclick=run;$('document').onchange=show;['template','csv'].forEach(id=>$(id).addEventListener('input',clear));
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;clear();try{if(f.size>2000000)throw {code:'size'};$('csv').value=new TextDecoder('utf-8',{fatal:true}).decode(await f.arrayBuffer());status(c.waiting);}catch(e){status(c.errors[e.code]||c.errors.encoding,true);}finally{$('file').value='';}};
$('copy').onclick=async()=>{if(!result)return;try{await navigator.clipboard.writeText($('preview').textContent);status(c.copied);}catch{status(c.copyError,true);}};
document.querySelectorAll('[data-download]').forEach(b=>b.onclick=()=>{if(!result)return;const doc=result.docs[Number($('document').value)||0],html=b.dataset.download==='html';save(new Blob([html?asHTML(doc,lang):doc.text],{type:html?'text/html;charset=utf-8':'text/plain;charset=utf-8'}),doc.name+(html?'.html':'.txt'));});
document.querySelectorAll('[data-zip]').forEach(b=>b.onclick=()=>{if(!result)return;const html=b.dataset.zip==='html';save(makeZIP(result.docs.map(d=>({name:d.name+(html?'.html':'.txt'),text:html?asHTML(d,lang):d.text}))),'documents-'+(html?'html':'txt')+'.zip');});
$('example').click();
