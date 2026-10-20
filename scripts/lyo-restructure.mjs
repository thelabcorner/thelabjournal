import { readFileSync, writeFileSync } from 'node:fs';
const base='src/manuscript-runtime/data/papers/sublimation/';
function replaceUnique(filename, needle, replacement) {
  let text=readFileSync(filename,'utf8');
  const occurrences=text.split(needle).length-1;
  if(occurrences!==1)throw Error(filename+' expected exactly one occurrence of: '+needle.slice(0,65)+' got '+occurrences);
  text=text.replace(needle,replacement);
  writeFileSync(filename,text,'utf8');
}
const index=base+'index.tsx';
let body=readFileSync(index,'utf8');
const start=body.indexOf('function LegacyFullAbstract() {');
const end=body.indexOf('export function PaperBody(',start);
if(start<0||end<0||body.slice(start,end).length<5000)throw Error('Legacy abstract not found/small');
body=body.slice(0,start)+body.slice(end);
writeFileSync(index,body,'utf8');
for(const filename of ['LiteratureReviewSection.tsx','MethodologySection.tsx','ResultsSection.tsx','DiscussionSection.tsx','ConclusionSection.tsx']){
  const path=base+'sections/'+filename;
  replaceUnique(path, "from '../../../../components/prose/MathBlock'", "from '../ScientificMath'");
}
replaceUnique(index,'    <ReferenceProvider references={sublimationReferences}>','    <ReferenceProvider references={sublimationReferences}>\n      <div className="lyo-paper">');
replaceUnique(index,'    </ReferenceProvider>','      </div>\n    </ReferenceProvider>');
console.log('Replaced legacy abstract, scoped article skin, connected scientific math for five sections.');
