export class InputError extends Error { constructor(code,detail=''){super(code);this.code=code;this.detail=detail;} }
export function parseCSV(input){
 if(input.length>2000000)throw new InputError('size');
 const text=input.replace(/^\uFEFF/,'');if(!text.trim())throw new InputError('empty');
 const rows=[];let row=[],cell='',state='start';
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(state==='quoted'){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else state='closed';}else cell+=c;continue;}
  if(state==='closed'&&c!==','&&c!=='\r'&&c!=='\n')throw new InputError('csv',String(rows.length+1));
  if(c==='"'){if(state!=='start')throw new InputError('csv',String(rows.length+1));state='quoted';}
  else if(c===','){row.push(cell);cell='';state='start';}
  else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';state='start';}
  else{cell+=c;state='plain';}
 }
 if(state==='quoted')throw new InputError('csv',String(rows.length+1));
 if(row.length||cell!==''||state==='closed'||text.endsWith(',')){row.push(cell);rows.push(row);}
 if(rows.length<2)throw new InputError('records');
 const headers=rows.shift();if(headers.some(h=>!h.trim())||new Set(headers).size!==headers.length)throw new InputError('headers');
 if(rows.length>500||headers.length>100)throw new InputError('limit');
 rows.forEach((r,i)=>{if(r.length!==headers.length)throw new InputError('columns',String(i+2));});
 return {headers,rows};
}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function merge(template,csv){
 if(!template.trim())throw new InputError('template');if(template.length>30000)throw new InputError('size');
 const {headers,rows}=parseCSV(csv);const keys=[...template.matchAll(/\{\{([^{}]+)\}\}/g)].map(m=>m[1].trim());
 if(!keys.length)throw new InputError('variables');
 if(template.replace(/\{\{([^{}]+)\}\}/g,'').includes('{{')||template.replace(/\{\{([^{}]+)\}\}/g,'').includes('}}'))throw new InputError('syntax');
 const unique=[...new Set(keys)];const absent=unique.filter(k=>!headers.includes(k));if(absent.length)throw new InputError('missing',absent.join(', '));
 const empty=[];rows.forEach((r,i)=>{unique.forEach(k=>{if(r[headers.indexOf(k)]==='')empty.push(`${i+2}: ${k}`);});});if(empty.length)throw new InputError('blank',empty.slice(0,10).join('; '));
 let total=0;const docs=rows.map((r,i)=>{const text=template.replace(/\{\{([^{}]+)\}\}/g,(_,k)=>r[headers.indexOf(k.trim())]);total+=text.length;if(total>5000000)throw new InputError('outputLimit');return {name:`document-${String(i+1).padStart(3,'0')}`,text};});
 return {docs,fields:unique};
}
export function asHTML(doc,lang='ko'){return `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(doc.name)}</title><style>body{max-width:760px;margin:48px auto;padding:24px;font:17px/1.8 system-ui}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}</style><body><pre>${escapeHTML(doc.text)}</pre></body></html>`;}
const enc=new TextEncoder();
function crc32(data){let c=0xffffffff;for(const b of data){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
export function makeZIP(files){
 const chunks=[],central=[];let offset=0;const u16=(a,p,v)=>new DataView(a.buffer).setUint16(p,v,true),u32=(a,p,v)=>new DataView(a.buffer).setUint32(p,v,true);
 for(const f of files){const name=enc.encode(f.name),data=enc.encode(f.text),crc=crc32(data),h=new Uint8Array(30+name.length);u32(h,0,0x04034b50);u16(h,4,20);u16(h,6,0x800);u16(h,12,33);u32(h,14,crc);u32(h,18,data.length);u32(h,22,data.length);u16(h,26,name.length);h.set(name,30);chunks.push(h,data);
  const c=new Uint8Array(46+name.length);u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);u16(c,8,0x800);u16(c,14,33);u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);u16(c,28,name.length);u32(c,42,offset);c.set(name,46);central.push(c);offset+=h.length+data.length;
 }
 const size=central.reduce((s,c)=>s+c.length,0),end=new Uint8Array(22);u32(end,0,0x06054b50);u16(end,8,files.length);u16(end,10,files.length);u32(end,12,size);u32(end,16,offset);return new Blob([...chunks,...central,end],{type:'application/zip'});
}
