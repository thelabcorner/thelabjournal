"""Audit manuscript prose for label-colon shortcuts and raw equation typography.
Run locally with python scripts/lyo-prose-style-audit-20261019.py
"""
from pathlib import Path
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

root=Path('src/manuscript-runtime/data/papers/sublimation')
files=sorted(root.rglob('*.tsx'))
texts={p:p.read_text(encoding='utf-8') for p in files}
bad=[]
for path,text in texts.items():
    short=path.relative_to(root)
    for m in re.finditer(r'<p(?:\s[^>]*)?>(.*?)</p>',text,re.S):
        body=m.group(1)
        start=text.count('\n',0,m.start())+1
        plain=re.sub(r'<InlineMath[^>]*?\s*/>', '[math]',body)
        plain=re.sub(r'<InlineCite[^>]*?\s*/>', '',plain)
        plain=re.sub(r'<[^>]+>', '',plain)
        plain=' '.join(plain.split())
        for sm in re.finditer(r'<(?:strong|b)>[^<>]{2,100}:<\/(?:strong|b)>',body):
            bad.append((short,start,'bold lead-in',sm.group(0)))
        if re.match(r'^(?:[A-Z][A-Za-z/\- ]{4,72}):\s+',plain):
            bad.append((short,start,'colon-led paragraph',plain[:160]))
        if re.search(r'\b(?:P_(?:apparent|total|sub|app)|K_(?:eff|c|r|g|f)|R_p|q_\w+|T_(?:i|g|s))\b',plain):
            bad.append((short,start,'raw variable',plain[:210]))
        for r in re.finditer(r'\b\w[^<>\n]{5,90}:',body):
            if re.search(r'[A-Z][^<>]{6,30}:',r.group(0)) and '<InlineMath' not in r.group(0):
                bad.append((short,start,'colon context',r.group(0)[-110:]))
    # show colon-esque editorial shortcuts outside paragraphs too
    for m in re.finditer(r'(?:body|title|caption)="([^"]{3,160})"',text):
        val=m.group(1)
        if re.search(r'^[\w][^:]{3,75}:',val):
            bad.append((short,text.count('\n',0,m.start())+1,'component label-colon',val[:145]))
for k in bad:
    print(f'{k[0]}:{k[1]} | {k[2]} | {k[3]}')
print('TOTAL_CANDIDATES',len(bad))
if bad:
    sys.exit(1)
