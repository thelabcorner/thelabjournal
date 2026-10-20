from pathlib import Path
import re

base = Path("src/manuscript-runtime/data/papers/sublimation")

def mutate(rel, fn):
    p = base / rel
    before = p.read_text(encoding="utf-8")
    after = fn(before)
    assert before != after, f"no changes: {rel}"
    p.write_text(after, encoding="utf-8", newline="\n")
    print(f"UPDATED {rel}, chars {len(before)} -> {len(after)}")

def one_replace(s, needle, repl):
    count = s.count(needle)
    assert count == 1, f"expected single occurrence of {needle[:90]!r}, got {count}"
    return s.replace(needle,repl)

def remove_final_subsection(s, id):
    opener = re.search(r'(?m)^ *<div id="' + re.escape(id) + r'"', s)
    assert opener and s.count('id="' + id + '"') == 1, id
    start=opener.start()
    closers = ["\n      </div>\n    </section>", "\n    </div>\n  </section>"]
    found = [s.find(close, start) for close in closers]
    end = min((i for i in found if i >= 0), default=-1)
    assert end >= 0, f"end not found for {id}"
    return s[:start]+s[end:]

def intro(s):
    s = one_replace(s,
        "Primary drying removes ice by sublimation under reduced pressure. Its rate depends on the heat supplied to\n        the sublimating interface and on the resistance encountered by water vapor leaving the product. Additional\n        heat can increase sublimation while ice remains, but only if the vapor can escape and the product stays\n        within its permitted temperature range. These constraints are coupled through chamber pressure, product\n        geometry, dried-layer resistance and condenser performance.",
        "Ice sublimation requires latent heat at the product surface and a path for water vapor to reach the\n        condenser. Chamber pressure changes the gas-mediated heat flux and the pressure available to drive\n        vapor away from the sublimating interface. At low shelf temperatures, the controller may limit\n        heater input even as water remains frozen. Tray construction and contact quality impose additional\n        thermal resistance. The practical question is how these boundaries govern the heat available to\n        the ice without exceeding the product-temperature limit.")
    s = one_replace(s,
        "This paper examines a seven-shelf consumer freeze dryer using three propositions: a revised heater-control\n          hierarchy, pressure-dependent gas transfer, and gas-composition effects. Tray conductivity, solid contact\n          and deliberate thermal gaps are a fourth, cross-cutting engineering axis rather than another thesis.\n          Published vial-scale experiments, the inspected machine topology, mathematical models and proposed\n          experiments provide distinct levels of evidence. No completed tray-scale performance validation is claimed.",
        "The seven-shelf machine provides a concrete setting in which to examine the control loop, chamber\n          pressure, gas composition, and tray-to-product heat path. Published vial experiments establish\n          parts of the underlying physics; the machine-specific questions are evaluated through explicit\n          calculations and proposed measurements. Their implications are developed in the order that heat\n          enters the product, ice sublimates, and vapor leaves the chamber.")
    s=one_replace(s,
        "The distinction between absolute chamber pressure, water-vapor partial pressure and a thermal-gauge\n          reading is essential for the three propositions.",
        "Total chamber pressure, the partial pressure of water vapor, and a thermal-gauge indication are\n          different physical quantities. Treating them as interchangeable would distort the transport model.")
    start=s.index("        <p className={prose}>\n          A compact screening expression combines heat-transfer capability")
    end=s.index('\n      </div>\n      <div id="introduction-structure"',start)
    s=s[:start]+s[end:]
    s=remove_final_subsection(s,"introduction-structure")
    return s

def lit(s):
    old="""          <ul className="text-sm text-[var(--text)] list-disc list-inside space-y-2 mb-3">
            <li><strong>Heater ON</strong> when chamber pressure falls below threshold P1</li>
            <li><strong>Heater OFF</strong> when chamber pressure rises above threshold P2</li>
            <li><strong>Completion criterion:</strong> failure to reach P2 after a designated drying time indicates
              primary drying is complete</li>
            <li><strong>Small-batch adaptation:</strong> low-moisture or small-mass batches are handled with time-dependent
              logic to avoid false-completion signals</li>
          </ul>"""
    new="""          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Under the disclosed threshold scheme, the heater is enabled below <InlineMath math="P_1" /> and
            disabled above <InlineMath math="P_2" />. Pressure cycling also informs the completion decision.
            The patents describe time-dependent accommodations for small or low-moisture loads, where the
            pressure signal may be weak enough to resemble a completed batch.
          </p>"""
    s=one_replace(s,old,new)
    s=one_replace(s,
        "            <strong>Critical architectural observation:</strong> While the patents describe \"pressure-activated heater cycling,\"\n            the actual heater driver (once the pressure gate is open) is <strong>shelf temperature error</strong>. Pressure\n            functions as a <em>gate</em> (enabling or disabling the PID when pressure crosses P1/P2 thresholds), not as a\n            <em>driver</em> (setting the heater's duty magnitude). Temperature setpoint determines how aggressively the heater\n            fires when the gate is open. This is the architectural defect identified in <em>Thesis 1</em>: at low shelf\n            temperatures (e.g., 20°F), the temperature error collapses as the shelf reaches setpoint, reducing heater duty\n            regardless of sublimation demand, while pressure never rises to P2; the system operates in a silent\n            enabled-but-throttled state.",
        "            The inspected control interpretation places a temperature-regulating PID within this pressure gate\n            <InlineCite refs={['cummings2024']} />. On that interpretation, pressure permits heating, whereas\n            temperature error determines the requested heater duty. The distinction matters near a low shelf\n            target: a small temperature error can coexist with a large latent-heat demand.")
    # The patent-vs-firmware callout repeats both preceding paragraphs verbatim.
    a=s.index('          <Callout\n            type="warning"\n            title="Patent-vs-firmware architecture"')
    b=s.index('\n        </div>',a)
    s=s[:a]+s[b:]
    s=remove_final_subsection(s,"literature-gap")
    return s

def methodology(s):
    s=one_replace(s,
        "Low-temperature lyophilization is modeled as a coupled heat-and-mass-transfer process; conclusions are classified\n          every conclusion by its evidentiary tier: experimental, derived, or hypothesis-level. The framework combines\n          the Pikal/Smoluchowski model with Ganguly's regime boundaries, exact coupled heat/mass balances, and the\n          solid/interface heat path through the shelf, tray, and product. The formal three theses therefore sit inside a\n          four-axis engineering framework: control architecture, pressure-dependent transport, vapor composition, and\n          tray/contact thermal engineering. Separately, heat delivery itself is resolved into four physical pathways:\n          solid/contact conduction, radiation, molecular gas conduction, and flow-coupled convective/advective transfer.",
        "The model follows heat from the heater through the shelf, tray and surrounding gas to the frozen\n          product, then follows the generated vapor across the dried layer toward the condenser. Contact\n          conduction, radiation, molecular gas conduction and flow-associated transfer are resolved\n          separately. Their combined heat flux is coupled to the sublimation interface temperature and\n          vapor pressure. The model is evaluated with published vial coefficients while retaining the\n          target machine's geometry and instrument limitations as identifiable parameters.")
    old="""          <ul className="text-sm text-[var(--text)] list-disc list-inside space-y-2 mb-3">
            <li>Product-temperature-dependent through <InlineMath math="P_{sub}(T)" /> (NIST/IAPWS Wagner formula)</li>
            <li>Gas-species-dependent through <InlineMath math="C_3" /> (the transition pressure)</li>
            <li>Geometry-dependent through <InlineMath math="C_2" /> (continuum plateau)</li>
            <li>Explicitly vapor-composition-dependent through <InlineMath math="P_{sub}/f_{H_2O}" /></li>
          </ul>"""
    new="""          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Interface temperature determines <InlineMath math="P_{sub}(T)" />. The transition
            pressure <InlineMath math="C_3" /> depends on gas properties, while the plateau
            coefficient <InlineMath math="C_2" /> reflects geometry. Vapor composition enters
            the pressure term directly through <InlineMath math="P_{sub}/f_{H_2O}" />.
            The stationary point therefore changes with the physical state and the chosen heat-transfer model.
          </p>"""
    s=one_replace(s,old,new)
    # Remove duplicate Smoluchowski display: equation 2.2 establishes it.
    start=s.index('          <MathBlock\n            math="K_g(P) = C_2')
    end=s.index('/>',start)+2
    s=s[:start]+s[end:]
    s=one_replace(s,'The\n            gas-conduction term is represented by the Smoluchowski interpolation:',
        'The gas-conduction term follows the Smoluchowski relation in Eq. 2.2.')
    # Six prose paragraphs in place of seven numbered assumption blocks.
    a=s.index('        <div id="methodology-assumptions"')
    b=s.index('        <div id="methodology-validation"',a)
    assumption="""        <div id="methodology-assumptions" className="prose-heading">
          <SubsectionLabel number="3.4" title="Model boundaries and parameters" />
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Vial-calibrated transfer coefficients provide an experimental point of departure, not measured
            properties of these trays. The Smoluchowski relation transfers as a physical model, while its
            geometric coefficients must be identified for the shelf-to-product gaps in this machine.
            Tray alloy, thickness, flatness, contact area, and surface finish also affect the actual
            thermal path. Conductivity data alone therefore constrain only the material resistance.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The heat and mass balances assume a quasi-steady sublimation interface over the pressure-cycle
            timescale. The controller comparison approximates shelf-to-product thermal response with
            a first-order lag. Gas mixtures are represented using literature-based conductivity mixing
            rules, and free-molecular accommodation factors are treated as species-dependent parameters.
            Neither transient overshoot nor surface-dependent accommodation is resolved by these simplifications.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            All absolute-pressure calculations refer to a composition-independent measurement. The
            installed thermocouple gauge provides a composition-sensitive indication, so its uncorrected
            output cannot serve as the absolute-pressure reference for comparisons between water-rich
            and non-condensable-gas-rich atmospheres. This distinction is retained in every numerical
            pressure comparison that follows.
          </p>
        </div>

"""
    s=s[:a]+assumption+s[b:]
    s=remove_final_subsection(s,"methodology-validation")
    return s

def refs(s):
    s=one_replace(s,'<ol className="space-y-3" role="list">','<div className="space-y-3" role="group" aria-label="Bibliography">')
    s=one_replace(s,'</ol>','</div>')
    s=one_replace(s,'<li key={ref.id}','<div key={ref.id}')
    s=one_replace(s,'</li>','</div>')
    return s

def nav(s):
    lines = s.splitlines(keepends=True)
    drop=['introduction-structure','literature-gap','methodology-validation',
          'discussion-control','discussion-instrumentation','discussion-limits',
          'discussion-implementation','discussion-tray-material']
    result=[]
    for line in lines:
        if any(f"id: '{name}'" in line for name in drop):
            continue
        line=line.replace("1.3 Sublimation Driving Force","1.3 Sublimation Driving Force")
        line=line.replace("3.4 Modeling Assumptions","3.4 Model Boundaries")
        line=line.replace("5.1 Evidence Synthesis","5.1 Pressure and Heat-Transfer Results")
        line=line.replace("5.7 Seven-Shelf Spatial Coupling","5.2 Spatial Variation and Endpoint")
        line=line.replace("5.8 Recommended Experiments","5.3 Model-Discriminating Measurements")
        line=line.replace("4.1 Thesis 1 Control Analysis","4.1 Control Analysis")
        line=line.replace("4.2 Thesis 2 Pressure-Transfer Trends","4.2 Pressure-Transfer Trends")
        line=line.replace("4.3 Thesis 3 Gas Species Effects","4.3 Gas Species Effects")
        line=line.replace("4.4 Coupled Mathematical Findings","4.4 Coupled Calculations")
        line=line.replace("4.5 Tray & Contact Thermal Resistance","4.5 Tray and Contact Resistance")
        result.append(line)
    s2=''.join(result)
    for id in drop:
        assert f"id: '{id}'" not in s2
    return s2

mutate("sections/IntroductionSection.tsx",intro)
mutate("sections/LiteratureReviewSection.tsx",lit)
mutate("sections/MethodologySection.tsx",methodology)
mutate("sections/ReferencesSection.tsx",refs)
mutate("nav.ts",nav)

# Remove em dash punctuation from all paper-owned narrative and UI files.
# Bibliographic source metadata is intentionally excluded from paraphrasing.
for p in base.rglob("*"):
    if p.suffix not in (".tsx",".ts") or p.name in ("references.ts","equationPython.ts"):
        continue
    s=p.read_text(encoding="utf-8")
    if "\u2014" not in s:continue
    s2=s.replace(" \u2014 ", ", ").replace("\u2014", ": ")
    assert "\u2014" not in s2
    p.write_text(s2,encoding="utf-8",newline="\n")
    print("EM DASH REMOVED",p.name)
