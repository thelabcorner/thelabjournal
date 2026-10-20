from pathlib import Path
import json, re, contextlib, io, traceback

source=Path("src/manuscript-runtime/data/papers/sublimation/equationPython.ts").read_text(encoding="utf-8")
items=re.findall(r'^  "([^"]+)": \{ title: "(?:[^"\\]|\\.)*", code: ("(?:[^"\\]|\\.)*") \},?$',source,re.M)
assert len(items)>=20,("Missing code blocks",len(items))
errors=[]
for label,raw in items:
    code=json.loads(raw)
    try:
        compiled=compile(code,f"lyophilization-equation-{label}.py","exec")
        namespace={"__name__":"__main__"}
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compiled,namespace)
        print(f"PASS {label}")
    except Exception:
        msg=traceback.format_exc()
        errors.append((label,msg))
        print(f"FAIL {label}: {msg.splitlines()[-1]}")
print(f"Checked {len(items)} executable examples; passed={len(items)-len(errors)} failed={len(errors)}")
for label,msg in errors: print(label,msg)
if errors: raise SystemExit(1)
