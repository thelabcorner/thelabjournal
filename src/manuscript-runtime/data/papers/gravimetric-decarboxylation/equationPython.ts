/** Manually reviewed Python translations for each displayed equation in the
 * gravimetric manuscript. They are calculation equivalents, not LaTeX source.
 * Every snippet is standalone: copy into Python with SymPy installed.
 */
export interface EquationPythonExample {
  readonly title: string;
  readonly code: string;
}

export const GRAVIMETRIC_EQUATION_PYTHON: Readonly<Record<string, EquationPythonExample>> = {
  "1": {
    title: "Stoichiometric release capacity",
    code: "from sympy import symbols, simplify, pprint\nm_A0, nu_CO2, M_CO2, M_A = symbols(\n    \"m_A0 nu_CO2 M_CO2 M_A\", positive=True\n)\nm_CO2_max = simplify(m_A0 * nu_CO2 * M_CO2 / M_A)\npprint(m_CO2_max)  # grams of theoretical CO2",
  },
  "2": {
    title: "Starting mass and release fraction",
    code: "from sympy import symbols, simplify, pprint\nm_0, tare, f_A, nu_CO2, M_CO2, M_A = symbols(\n    \"m_0 tare f_A nu_CO2 M_CO2 M_A\", positive=True\n)\nm_sample_0 = m_0 - tare\nA = f_A * m_sample_0\nI = m_sample_0 - A\nq = nu_CO2 * M_CO2 / M_A\npprint((m_sample_0, A, I, simplify(q)))",
  },
  "3": {
    title: "Gross-mass difference",
    code: "from sympy import symbols, pprint\nA, q, m_0, m_t = symbols(\"A q m_0 m_t\", real=True)\nm_CO2_max = A * q\ndelta_m = m_0 - m_t  # vessel tare cancels\npprint((m_CO2_max, delta_m))",
  },
  "4": {
    title: "Apparent reaction progress",
    code: "from sympy import symbols, simplify, pprint\nm_0, m_t, A, q = symbols(\"m_0 m_t A q\", positive=True)\ndelta_m = m_0 - m_t\nm_CO2_max = A * q\nX_app = simplify(100 * delta_m / m_CO2_max)\npprint(X_app)  # percent of theoretical CO2 release",
  },
  "worked-single": {
    title: "Single-acid worked example",
    code: "from sympy import Rational as Q\ntare, initial, later = Q(\"25.0000\"), Q(\"35.0000\"), Q(\"34.5089\")\nacid_fraction = Q(\"0.80\")\nA = acid_fraction * (initial - tare)\nm_CO2_max = A * Q(\"44.01\") / Q(\"358.47\")\ndelta_m = initial - later\nX_app = 100 * delta_m / m_CO2_max\nprint(\"Reactive mass (g):\", A)\nprint(\"Theoretical CO2 (g):\", m_CO2_max.evalf(6))\nprint(\"Observed loss (g):\", delta_m)\nprint(\"Apparent progress (%):\", X_app.evalf(5))",
  },
  "5": {
    title: "Mixture capacity and progress",
    code: "from sympy import symbols, simplify, pprint\nm1, m2, nu1, nu2, M1, M2, M_CO2 = symbols(\n    \"m1 m2 nu1 nu2 M1 M2 M_CO2\", positive=True\n)\ndelta_m = symbols(\"delta_m\", nonnegative=True)\nq1, q2 = nu1 * M_CO2 / M1, nu2 * M_CO2 / M2\nm_CO2_max = m1 * q1 + m2 * q2  # sum over reactants i\nX_app = simplify(100 * delta_m / m_CO2_max)\npprint((m_CO2_max, X_app))",
  },
  "worked-mixture": {
    title: "Two-acid numerical example",
    code: "from sympy import Rational as Q\nTHCa, CBGa = Q(\"6.0\"), Q(\"2.0\")  # grams of acids\nm_CO2_max = THCa * Q(\"44.01\") / Q(\"358.47\")\nm_CO2_max += CBGa * Q(\"44.01\") / Q(\"360.49\")\nX_app = 100 * Q(\"0.4904\") / m_CO2_max\nprint(\"Mixture capacity (g):\", m_CO2_max.evalf(6))\nprint(\"Aggregate apparent progress (%):\", X_app.evalf(5))",
  },
  "6": {
    title: "Aliquot reference coefficient",
    code: "from sympy import symbols, simplify, pprint\ngross_c0, tare_c, delta_m_c = symbols(\n    \"gross_c0 tare_c delta_m_c\", positive=True\n)\nm_c = gross_c0 - tare_c\nq_cal = simplify(delta_m_c / m_c)  # g lost per g feed\npprint((m_c, q_cal))",
  },
  "7": {
    title: "Reference-relative batch progress",
    code: "from sympy import symbols, simplify, pprint\nm_b, q_cal, delta_m_b = symbols(\n    \"m_b q_cal delta_m_b\", positive=True\n)\nm_loss_ref_b = m_b * q_cal\nX_ref = simplify(100 * delta_m_b / m_loss_ref_b)\npprint((m_loss_ref_b, X_ref))",
  },
  "8": {
    title: "Acid-equivalent feed fraction",
    code: "from sympy import symbols, simplify, pprint\nq_cal, nu_CO2, M_CO2, M_A = symbols(\n    \"q_cal nu_CO2 M_CO2 M_A\", positive=True\n)\nf_acid_eq = simplify(q_cal / (nu_CO2 * M_CO2 / M_A))\npprint(f_acid_eq)  # requires CO2-specific reference loss",
  },
  "9": {
    title: "Expected mass-loss signal",
    code: "from sympy import symbols, simplify, pprint\nm_s, f, x, M_CO2, M_THCa = symbols(\n    \"m_s f x M_CO2 M_THCa\", positive=True\n)\nk = M_CO2 / M_THCa\nm_CO2_max = m_s * f * k\ndelta_m_signal = m_s * f * k * x\npprint((simplify(k), m_CO2_max, delta_m_signal))",
  },
  "10": {
    title: "Minimum sample mass by readability",
    code: "from sympy import symbols, simplify, pprint\nr, f, k, x = symbols(\"r f k x\", positive=True)\nm_s_2 = simplify(2 * r / (f * k * x))\nm_s_5 = simplify(5 * r / (f * k * x))\npprint((m_s_2, m_s_5))  # 2-step and 5-step criteria",
  },
  "11": {
    title: "Progress resolution of one display step",
    code: "from sympy import symbols, simplify, pprint\nr, m_s, q_ref, epsilon = symbols(\n    \"r m_s q_ref epsilon\", positive=True\n)\ndelta_X_display = simplify(100 * r / (m_s * q_ref))\nr_max = simplify(epsilon * m_s * q_ref / 100)\npprint((delta_X_display, r_max))",
  },
  "12": {
    title: "Bulk feed and reference loss",
    code: "from sympy import symbols, pprint\ngross_b0, tare_b, q_cal = symbols(\n    \"gross_b0 tare_b q_cal\", positive=True\n)\nm_b = gross_b0 - tare_b\nm_loss_ref_b = m_b * q_cal\npprint((m_b, m_loss_ref_b))",
  },
  "13": {
    title: "Mass-based stop target",
    code: "from sympy import symbols, simplify, pprint\nX_selected, m_b, q_cal, gross_b0 = symbols(\n    \"X_selected m_b q_cal gross_b0\", positive=True\n)\ndelta_m_target = X_selected * m_b * q_cal / 100\ngross_target = gross_b0 - delta_m_target\npprint((delta_m_target, simplify(gross_target)))",
  },
  "14": {
    title: "Ideal-gas inventories",
    code: "from sympy import symbols, simplify, pprint\nP, P_CO2, V_g, R, T, m_CO2_max, M_CO2 = symbols(\n    \"P P_CO2 V_g R T m_CO2_max M_CO2\", positive=True\n)\nn_g = P * V_g / (R * T)\nn_CO2_g = P_CO2 * V_g / (R * T)\nn_CO2_max = m_CO2_max / M_CO2\npprint((simplify(n_g), simplify(n_CO2_g), n_CO2_max))\n# Pressure: Pa absolute; volume: m³; temperature: K.",
  },
  "15": {
    title: "Temperature-corrected sealed accumulation",
    code: "from sympy import symbols, simplify, pprint\nV_g, R, P_t, T_t, P_0, T_0 = symbols(\n    \"V_g R P_t T_t P_0 T_0\", positive=True\n)\ndelta_n_g = simplify(V_g / R * (P_t / T_t - P_0 / T_0))\npprint(delta_n_g)  # moles, not pressure difference",
  },
  "16": {
    title: "Sealed apparent progress",
    code: "from sympy import symbols, simplify, pprint\ndelta_n_g, n_CO2_max = symbols(\n    \"delta_n_g n_CO2_max\", positive=True\n)\nX_app_seal = simplify(100 * delta_n_g / n_CO2_max)\npprint(X_app_seal)  # CO2-equivalent percent",
  },
  "17": {
    title: "Sealed target pressure",
    code: "from sympy import symbols, simplify, pprint\nR, T_t, V_g, n_g0, X_star, n_CO2_max, P_ambient = symbols(\n    \"R T_t V_g n_g0 X_star n_CO2_max P_ambient\",\n    positive=True\n)\nP_target_seal = R * T_t / V_g * (\n    n_g0 + X_star * n_CO2_max / 100\n)\nP_gauge_target = simplify(P_target_seal - P_ambient)\npprint((P_target_seal, P_gauge_target))",
  },
  "18": {
    title: "Moles discharged by a vent",
    code: "from sympy import symbols, simplify, pprint\nV_g, R, P_b, T_b, P_a, T_a = symbols(\n    \"V_g R P_b T_b P_a T_a\", positive=True\n)\ndelta_n_vent = simplify(\n    V_g / R * (P_b / T_b - P_a / T_a)\n)\npprint(delta_n_vent)  # before minus after; absolute Pa, K",
  },
  "19": {
    title: "Vented inventory and apparent progress",
    code: "from sympy import symbols, simplify, pprint\ndelta_n_g, c1, c2, vent1, vent2, n_CO2_max = symbols(\n    \"delta_n_g c1 c2 vent1 vent2 n_CO2_max\",\n    nonnegative=True\n)\n# Two vent classes; extend the sum for additional events.\nn_gen_eq = delta_n_g + c1 * vent1 + c2 * vent2\nX_app_vent = simplify(100 * n_gen_eq / n_CO2_max)\npprint((n_gen_eq, X_app_vent))",
  },
  "20": {
    title: "Vented target pressure",
    code: "from sympy import symbols, simplify, pprint\nR, T_t, V_g, n_g0, X_star, n_CO2_max = symbols(\n    \"R T_t V_g n_g0 X_star n_CO2_max\", positive=True\n)\nc1, c2, vent1, vent2 = symbols(\n    \"c1 c2 vent1 vent2\", nonnegative=True\n)\nvented = c1 * vent1 + c2 * vent2  # Σ c_j Δn_vent,j\nP_target_vent = simplify(R * T_t / V_g * (\n    n_g0 + X_star * n_CO2_max / 100 - vented\n))\npprint(P_target_vent)  # absolute Pa",
  },
  "21": {
    title: "Initial-gas pressure subtraction",
    code: "from sympy import symbols, simplify, pprint\nP_0, T_0, T_t, P_t = symbols(\n    \"P_0 T_0 T_t P_t\", positive=True\n)\nP_inert_t = P_0 * T_t / T_0\nP_CO2_est = simplify(P_t - P_inert_t)\npprint((P_inert_t, P_CO2_est))  # sealed, no air ingress",
  },
  "22": {
    title: "Inert-gas fraction after vents",
    code: "from sympy import symbols, simplify, pprint\nP_b, T_b, P_a, T_a = symbols(\n    \"P_b T_b P_a T_a\", positive=True\n)\nn_inert_0, c1, c2, f2 = symbols(\n    \"n_inert_0 c1 c2 f2\", nonnegative=True\n)\nP_t, R, T_t, V_g = symbols(\"P_t R T_t V_g\", positive=True)\nf1 = (P_a / T_a) / (P_b / T_b)  # after / before\n# f2: another event's independently measured remaining fraction.\nn_inert_t = n_inert_0 * f1**c1 * f2**c2\nP_CO2_est = simplify(P_t - n_inert_t * R * T_t / V_g)\npprint((f1, n_inert_t, P_CO2_est))",
  },
  "23": {
    title: "Corrected CO2 mass balance",
    code: "from sympy import symbols, simplify, pprint\ndelta_m_gross, m_other_loss, m_uptake = symbols(\n    \"delta_m_gross m_other_loss m_uptake\", real=True\n)\nm_CO2_est = simplify(\n    delta_m_gross - m_other_loss + m_uptake\n)\npprint(m_CO2_est)  # other terms require independent data",
  },
  "24": {
    title: "Henry-equilibrium dissolved CO2",
    code: "from sympy import symbols, simplify, pprint\nk_H_cp, V_liquid, P_CO2 = symbols(\n    \"k_H_cp V_liquid P_CO2\", positive=True\n)\nP_atm = 101325  # Pa; k_H_cp in mol/(L·atm), V in L\nn_CO2_liquid_eq = simplify(k_H_cp * V_liquid * P_CO2 / P_atm)\npprint(n_CO2_liquid_eq)",
  },
  "25": {
    title: "Gas and liquid CO2 storage",
    code: "from sympy import symbols, simplify, pprint\nP_CO2, V_g, R, T, k_H_cp, V_liquid = symbols(\n    \"P_CO2 V_g R T k_H_cp V_liquid\", positive=True\n)\nP_atm = 101325  # Pa\nn_CO2_stored = simplify(P_CO2 * (\n    V_g / (R * T) + k_H_cp * V_liquid / P_atm\n))\npprint(n_CO2_stored)  # assumes equilibrium",
  },
  "26": {
    title: "Total CO2 generation with dissolved inventory",
    code: "from sympy import symbols, simplify, pprint\nng_t, ng_0, nl_t, nl_0, vent1, vent2 = symbols(\n    \"ng_t ng_0 nl_t nl_0 vent1 vent2\", real=True\n)\nn_CO2_gen = simplify(\n    (ng_t - ng_0) + (vent1 + vent2) + (nl_t - nl_0)\n)\npprint(n_CO2_gen)  # vent terms are CO2, not total gas",
  },
  "gauge-screening": {
    title: "Pressure signal and rounding bound",
    code: "from sympy import symbols, simplify, pprint\nm_s, f, x, M_A, R, T_t, V_g = symbols(\n    \"m_s f x M_A R T_t V_g\", positive=True\n)\nr_P, T_0 = symbols(\"r_P T_0\", positive=True)\ndelta_P_CO2 = simplify(m_s * f * x / M_A * R * T_t / V_g)\nr_eff = simplify(r_P / 2 * (1 + T_t / T_0))\npprint((delta_P_CO2, r_eff))\n# Use compatible mole/mass units and absolute Pa, K.",
  },
  "27": {
    title: "Sealed pressure rounding bound",
    code: "from sympy import symbols, simplify, pprint\nV_g, R, n_CO2_max, T_0, T_t = symbols(\n    \"V_g R n_CO2_max T_0 T_t\", positive=True\n)\nr_P, epsilon = symbols(\"r_P epsilon\", positive=True)\nS_P = simplify(100 * V_g / (2 * R * n_CO2_max) * (\n    1 / T_0 + 1 / T_t\n))\ndelta_X_seal_bound = simplify(S_P * r_P)\nr_P_max = simplify(epsilon / S_P)\npprint((S_P, delta_X_seal_bound, r_P_max))\n# |δX_seal| <= delta_X_seal_bound",
  },
  "28": {
    title: "Mass difference propagation",
    code: "from sympy import symbols, sqrt, simplify, pprint\nu_m, m_CO2_max = symbols(\"u_m m_CO2_max\", positive=True)\nu_delta_m = sqrt(2) * u_m  # independent equal-uncertainty readings\nu_X = simplify(100 * u_delta_m / m_CO2_max)\npprint(u_X)  # progress standard uncertainty, percentage points",
  },
};

/** Display numbers are stable. The three unnumbered blocks use caption identities. */
export function gravimetricEquationPython(label?: string, caption?: string): EquationPythonExample | undefined {
  if (label) return GRAVIMETRIC_EQUATION_PYTHON[label.replace(/[()]/g, '')];
  if (caption?.startsWith('Worked single-acid example')) return GRAVIMETRIC_EQUATION_PYTHON['worked-single'];
  if (caption?.startsWith('Illustrative two-acid mixture')) return GRAVIMETRIC_EQUATION_PYTHON['worked-mixture'];
  if (caption?.startsWith('Predicted reaction-only pressure increment')) return GRAVIMETRIC_EQUATION_PYTHON['gauge-screening'];
  return undefined;
}
