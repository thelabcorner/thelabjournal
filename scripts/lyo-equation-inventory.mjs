import fs from 'node:fs';
const base='src/manuscript-runtime/data/papers/sublimation/sections/';
const files=fs.readdirSync(base).filter(x=>x.endsWith('tsx'));
let count=0;
for(const file of files){
 const s=fs.readFileSync(base+file,'utf8');
 const chunks=[...s.matchAll(/<MathBlock\b([\s\S]*?)\/>/g)];
 for(const chunk of chunks){
  const attrs=chunk[1];
  const label=attrs.match(/label="([^"]+)"/)?.[1]??'(unnumbered)';
  const math=attrs.match(/math="([^"]+)"/)?.[1]?.slice(0,500)??'(expression)';
  const caption=attrs.match(/caption="([^"]+)"/)?.[1]??'';
  console.log(file+' '+label+' '+math.replaceAll('\\n',' ')+' ## '+caption.slice(0,70));
  count++;
 }
}
console.log('TOTAL',count);
