#!/usr/bin/env python3
"""Synchronize immutable source excerpts and reproducible typesetting data.

Only reads the original verified OpenFork research session; never changes the model.
"""
import argparse, hashlib, json, math, pathlib, shutil, sys

def digest(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

def main():
    root=pathlib.Path(__file__).resolve().parent
    p=argparse.ArgumentParser()
    p.add_argument("--research",type=pathlib.Path,default=pathlib.Path.home()/".local/share/openfork/chats/1792520728520-6di9bg")
    args=p.parse_args()
    source=args.research
    if not source.exists(): raise SystemExit("Source research directory unavailable. Supply --research.")
    dst=root/"data"
    dst.mkdir(exist_ok=True)
    names=[
        "sle_rebuild_20261021/sle_rebuild_results.json",
        "sle_rebuild_20261021/sle_rebuild_verification.json",
        "sle_rebuild_20261021/gamma_grid.csv",
        "sle_rebuild_20261021/sle_results.csv",
        "solubility_cycle_aligned_rerun.json",
        "thca_temperature_solubility_report.md",
        "cosmo_24a_activity_output_recheck.json",
    ]
    log=[]
    for rel in names:
        original=source/rel
        if not original.is_file():raise SystemExit("Missing source: "+str(original))
        target=dst/pathlib.Path(rel).name
        shutil.copyfile(original,target)
        if digest(original)!=digest(target):raise SystemExit("Copy checksum mismatch: "+rel)
        log.append({"source":str(original),"target":str(target.relative_to(root)),"sha256":digest(target),"bytes":target.stat().st_size})
    rows=json.loads((dst/"sle_rebuild_results.json").read_text(encoding="utf-8"))["rows"]
    verification=json.loads((dst/"sle_rebuild_verification.json").read_text(encoding="utf-8"))
    assert verification["status"]=="PASSED"
    assert len(rows)==42
    mapping={
        "patent_146C_16p3kJ_cp0":"patent",
        "patent_146C_16p3kJ_cpPlus50":"cp_plus",
        "patent_146C_16p3kJ_cpMinus50":"cp_minus",
        "hypothetical_100C_16p3kJ":"tm100",
        "historical_70C_16p3kJ":"tm70",
        "hypothetical_146C_30kJ":"hfus30",
    }
    header="T "+" ".join(k+"_mgml" for k in mapping.values())+" patent_x"
    line=[header]
    temps=sorted(set(r["temperature_C"] for r in rows))
    for t in temps:
        at={r["scenario"]:r for r in rows if r["temperature_C"]==t}
        vals=[]
        for scenario in mapping:
            d=at[scenario].get("mg_THCA_per_mL_initial_limonene")
            vals.append("%.10g"%d if d is not None else "nan")
        line.append("%.8g %s %.12g"%(t," ".join(vals),at["patent_146C_16p3kJ_cp0"]["x_saturation"]))
    (root/"figure-series.dat").write_text("\n".join(line)+"\n",encoding="utf-8")
    # Source γ(x,T) traces; native pgfplots table, literal output from archived grid
    import csv
    with (dst/"gamma_grid.csv").open(encoding="utf-8",newline="") as f:
        grid=list(csv.DictReader(f))
    if len(grid)!=462:raise SystemExit("Wrong COSMO grid length")
    lines=["x gamma15 gamma25 gamma55 gamma75"]
    xs=sorted(set(float(r["x_THCA"]) for r in grid))
    for x in xs:
        vals={}
        for t in [15.,25.,55.,75.]:
            item=next(r for r in grid if float(r["x_THCA"])==x and float(r["temperature_C"])==t)
            vals[t]=float(item["ln_gamma_THCA"])
        lines.append("%.9g %.9g %.9g %.9g %.9g"%(x,vals[15.],vals[25.],vals[55.],vals[75.]))
    (root/"figure-activity.dat").write_text("\n".join(lines)+"\n",encoding="utf-8")
    # Structural crosswalk is independently checked to primary CIF/source values.
    cif=(source/"cu3167sup1.cif").read_text(encoding="utf-8",errors="replace")
    import re
    cell={}
    for axis in "abc":
        match=re.search(r"(?m)^_cell_length_"+axis+r"\s+([\d.]+)",cif)
        if not match: raise SystemExit("Missing 2021 CIF cell parameter "+axis)
        cell[axis]=float(match.group(1))
    vm=re.search(r"(?m)^_cell_volume\s+([\d.]+)",cif)
    cell["volume"]=float(vm.group(1))
    patent={"a":11.4635,"b":18.0506,"c":19.2347,"volume":3980.1}
    comparison={"crystal_2021_120K":cell,"patent_2026_100K":patent,
        "percent_delta_patent_over_cif":{k:100*(patent[k]-cell[k])/cell[k] for k in cell},
        "interpretation":"closely similar cell metrics and matching stated P212121/Z8; requires same-condition diffraction/atomic structural comparison for polymorph equivalence",
        "patent_source":"https://patents.google.com/patent/US20260008762A1/en",
        "2021_cif_source":"Skell et al. 2021 supplement cu3167sup1.cif"}
    (dst/"lattice_crosswalk.json").write_text(json.dumps(comparison,indent=2)+"\n",encoding="utf-8")
    manifest={"status":"staged manuscript data, computational outputs not measured physical solubility",
        "original_data":log,
        "derived":{"figure-series.dat":digest(root/"figure-series.dat"),
                   "figure-activity.dat":digest(root/"figure-activity.dat"),
                   "data/lattice_crosswalk.json":digest(dst/"lattice_crosswalk.json")},
        "verification":{"root_cases":verification["fresh_eos_root_checks"],
                        "max_abs_ln_activity_closure":verification["max_abs_ln_activity_closure"],
                        "numerical_status":verification["status"]}}
    (dst/"EVIDENCE_MANIFEST.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"sourced":len(names),"activity_points":len(grid),"roots_verified":verification["fresh_eos_root_checks"],
                      "lattice_percent_deltas":comparison["percent_delta_patent_over_cif"],
                      "typesetting_data_lines":{"series":len(line)-1,"activity":len(xs)}},indent=2))
if __name__=="__main__":main()
