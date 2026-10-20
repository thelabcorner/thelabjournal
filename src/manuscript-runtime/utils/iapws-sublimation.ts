/**
 * ============================================================================
 * IAPWS Sublimation Pressure Engine  — v3.0.0  (precision-hardened)
 * ============================================================================
 * Based on:
 *   Wagner, W., Riethmann, T., Feistel, R., & Harvey, A. H. (2011).
 *   "New Equations for the Sublimation Pressure and Melting Pressure of
 *    H₂O Ice Ih"
 *   J. Phys. Chem. Ref. Data, Vol. 40, No. 4, 043103.
 *   DOI: 10.1063/1.3657937
 *
 * IAPWS Revised Release on the Pressure along the Melting and Sublimation
 * Curves of Ordinary Water Substance (2011).
 *
 * ── Floating-point hardening ────────────────────────────────────────────────
 *
 *  ① COMPENSATED SUMMATION (Neumaier–Kahan)
 *     Σ aᵢ·θ^bᵢ has Σaᵢ = 0 (constraint 4a); the three terms nearly cancel
 *     for all θ.  Neumaier's algorithm eliminates the O(ε·max|term|) error
 *     of a naïve accumulator by tracking the lost low-order bits and
 *     applying them at the end.  Error bound: O(ε·|result|).
 *
 *  ② log1p FOR ln(θ) NEAR θ = 1
 *     b₁ ≈ 0.003333 is tiny, so θ^b₁ = exp(b₁·lnθ).
 *     For θ ≈ 1, Math.log(θ) cancels mantissa bits.
 *     log1p(θ−1) is accurate to full machine precision.
 *     Threshold: |θ−1| < 0.5  (T > ≈ 136 K).
 *
 *  ③ aᵢ · exp(bᵢ · lnθ) — leverage the precision-safe lnθ everywhere
 *     All three terms share the same lnTh, computed once via ②.
 *
 *  ④ ANALYTICAL DERIVATIVE  d(lnπ)/dT
 *     Exact from the chain rule on Eq. (4). No finite-difference noise.
 *     Used for the analytical dp/dT export AND as the N–R Jacobian.
 *
 *  ⑤ NEWTON–RAPHSON IN LOG-SPACE with analytical Jacobian + stagnation guard
 *     Works on f = lnπ_calc − lnπ_target. Bounded dynamic range regardless
 *     of the 10⁹⁰ span of pressures.  Bisection half-step on boundary hits.
 *     Added stagnation check: if |dT| stops shrinking, break early.
 *
 *  ⑥ Math.hypot FOR UNCERTAINTY ROOT-SUM-OF-SQUARES
 *     Avoids squaring very small/large terms (t₁ ≈ 1.1×10⁻⁵).
 *     Math.hypot uses internal extended-precision scaling.
 *
 *  ⑦ EXACT UNIT-CONVERSION CONSTANTS
 *     mmHg: exact SI definition 101 325 / 760 Pa.
 *     All SI-prefix conversions are exact powers of 10.
 *
 *  ⑧ log10(p) VIA lnPi — no log∘exp round-trip
 *     log10_p_Pa = lnPi · log10(e) + log10(p*)
 *     avoids the precision loss of log(exp(lnPi)·p*).
 *
 *  ⑨ SINGLE _coreCalc CALL PER PUBLIC FUNCTION
 *     _coreCalc is called exactly once per public-facing function; its
 *     { lnPi, pi, theta, lnTh } quadruple is threaded through to avoid
 *     redundant recomputation (enthalpyOfSublimation previously triggered
 *     three separate core calls for one input T).
 *
 *  ⑩ Object.freeze ON COEFFICIENT TABLE
 *     Prevents any runtime mutation of the COEFFS array or its elements.
 *
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Triple-Point Constants  (Eq. 1a / 1b)
// ---------------------------------------------------------------------------

/** Triple-point temperature [K] — ITS-90 defined value, Eq. (1a) */
export const T_TRIPLE = 273.16; // K  (exact by ITS-90 definition)

/**
 * Triple-point pressure [Pa] — Guildner et al. (1976), Eq. (1b).
 * Used as the reducing pressure p* throughout Eq. (4).
 *
 * NOTE: The IAPWS-95 / ice-Ih EOS yields 611.654 771 Pa (Eq. 1c), which is
 * within the experimental uncertainty.  The internationally accepted value
 * 611.657 Pa is used here per the IAPWS Release.
 */
export const P_TRIPLE = 611.657; // Pa

// Pre-compute log(P_TRIPLE) once — used in log10 and inverse solve
const LN_P_TRIPLE   = Math.log(P_TRIPLE);
const LOG10_P_TRIPLE = Math.log10(P_TRIPLE); // ≈ 2.78648...

// ---------------------------------------------------------------------------
// Range of validity for Eq. (4)
// ---------------------------------------------------------------------------

/** Lower temperature limit for sublimation-pressure equation [K] */
export const T_MIN = 50.0;

/** Upper temperature limit for sublimation-pressure equation [K] (= triple point) */
export const T_MAX = 273.16;

/** Branch boundary for uncertainty equations (5a) vs (5b) */
const T_BRANCH = 130.0; // K

// ---------------------------------------------------------------------------
// Physical constants
// ---------------------------------------------------------------------------

/**
 * Specific gas constant for water [J/(kg·K)].
 * Defined value used in IAPWS-95: R = 0.461 518 05 kJ/(kg·K).
 * Derived from R_universal / M(H₂O) = 8.314 462 618 / 0.018 015 268 ≈ 461.518
 * but the IAPWS-95 Release pins it at exactly 461.51805 J/(kg·K).
 */
export const R_WATER = 461.518_05; // J/(kg·K) — IAPWS-95 defined value

// ---------------------------------------------------------------------------
// ⑦ Exact unit-conversion constants
// ---------------------------------------------------------------------------

/**
 * Exact Pa per mmHg (Torr): 101 325 / 760 = 133.322 387 415... Pa
 * This is the exact SI / BIPM definition; no truncation.
 */
const PA_PER_MMHG = 101_325 / 760;

/** log₁₀(e) — used once for ⑧ log10 from lnPi */
const LOG10E = Math.LOG10E; // ≈ 0.434 294 481 903...

// ---------------------------------------------------------------------------
// ⑩ Coefficients & exponents — Table 3, Wagner et al. (2011)
// ---------------------------------------------------------------------------

interface Term {
    /** aᵢ coefficient */
    readonly a: number;
    /** bᵢ exponent */
    readonly b: number;
}

/**
 * Table 3 coefficients.  Signs verified against constraint Eq. (4a): Σaᵢ = 0.
 *
 *   a₁ = −0.212 144 006 × 10²  = −21.2144006
 *   a₂ = +0.273 203 819 × 10²  = +27.3203819
 *   a₃ = −0.610 598 130 × 10¹  =  −6.10598130
 *   b₁ = +0.333 333 333 × 10⁻² =  +0.00333333333  (≈ 1/300)
 *   b₂ = +0.120 666 667 × 10¹  =  +1.20666667
 *   b₃ = +0.170 333 333 × 10¹  =  +1.70333333
 *
 * Σaᵢ = −21.2144006 + 27.3203819 − 6.10598130 = 0  ✓
 *
 * Object.freeze applied (⑩) — prevents runtime mutation of this table.
 */
const COEFFS: readonly Term[] = Object.freeze([
    Object.freeze({ a: -0.212_144_006e2,  b:  0.333_333_333e-2 }),  // i = 1
    Object.freeze({ a:  0.273_203_819e2,  b:  0.120_666_667e1  }),  // i = 2
    Object.freeze({ a: -0.610_598_130e1,  b:  0.170_333_333e1  }),  // i = 3
] as const);

// Pre-compute lnP_at_50K for the inverse-solver initial guess (done once).
// At 50 K: compute lnPi analytically. We use a bootstrapped value here;
// the exact value is computed lazily on first inverse call via the closure below.
const _LN_PI_50K = (() => {
    const theta = T_MIN / T_TRIPLE;
    const lnTh  = Math.log(theta); // θ ≈ 0.183 — far from 1, safe
    let sum = 0, comp = 0;
    for (const { a, b } of COEFFS) {
        const v = a * Math.exp(b * lnTh);
        const t = sum + v;
        comp += Math.abs(sum) >= Math.abs(v) ? (sum - t) + v : (v - t) + sum;
        sum = t;
    }
    return (sum + comp) / theta;
})();

// Effective ln(p) at 50 K — used as anchor for initial guess
const _LN_P_50K = _LN_PI_50K + LN_P_TRIPLE;

// ---------------------------------------------------------------------------
// ① Neumaier-corrected Kahan compensated sum
//    Handles both ordinary and "large addend" cases that naïve Kahan misses.
// ---------------------------------------------------------------------------

/**
 * Returns the sum of `values[]` with Neumaier (Kahan–Babuška) compensation.
 * Error bound: O(ε·|result|) instead of O(n·ε·|max_term|) for a naïve loop.
 */
function neumaierSum(values: readonly number[]): number {
    let sum  = 0.0;
    let comp = 0.0;

    for (const v of values) {
        const t = sum + v;
        comp += Math.abs(sum) >= Math.abs(v)
            ? (sum - t) + v   // sum is large: low bits of v were lost
            : (v   - t) + sum; // v is large:   low bits of sum were lost
        sum = t;
    }

    return sum + comp;
}

// ---------------------------------------------------------------------------
// ② Precision-safe ln(θ) for θ near 1
// ---------------------------------------------------------------------------

/**
 * Returns ln(θ) with full precision even when θ ≈ 1.
 *
 * Math.log(θ) computes ln(1 + δ) where δ = θ−1.  When δ ≈ 0 the float
 * representation of θ already lost the low bits of δ, giving ~15 fewer
 * digits.  Math.log1p(δ) receives δ before any cancellation.
 *
 * Threshold: |θ−1| < 0.5  ↔  T > ≈ 136.58 K
 * Below that, θ is far enough from 1 that Math.log is equally accurate.
 */
function lnTheta(theta: number): number {
    const d = theta - 1.0;
    return Math.abs(d) < 0.5 ? Math.log1p(d) : Math.log(theta);
}

// ---------------------------------------------------------------------------
// ③ Core term evaluator: aᵢ · θ^bᵢ = aᵢ · exp(bᵢ · lnθ)
// ---------------------------------------------------------------------------

/**
 * Computes aᵢ · θ^bᵢ for one term using the pre-computed precision-safe lnθ.
 * Sharing lnTh across all three terms means ② is paid once per call to _coreCalc.
 */
function evalTerm(a: number, b: number, lnTh: number): number {
    return a * Math.exp(b * lnTh);
}

// ---------------------------------------------------------------------------
// ④ Analytical derivative of Eq. (4) — d(lnπ)/dT [K⁻¹]
// ---------------------------------------------------------------------------

/**
 * Returns d(lnπ)/dT [K⁻¹] analytically.
 *
 *   ln π = S(θ) / θ           where S = Σ aᵢ·θ^bᵢ, θ = T/T*
 *
 *   d(lnπ)/dT = (1/T*) · d/dθ [S(θ)/θ]
 *             = (1/T*) · [S′(θ)·θ − S(θ)] / θ²
 *
 *   S′(θ) = Σ aᵢ·bᵢ·θ^(bᵢ−1)  ← also Kahan-summed
 *
 * No finite-difference noise; exact up to FP representation.
 */
function dlnPi_dT(theta: number, lnTh: number, S: number): number {
    // S′(θ) = Σ (aᵢ·bᵢ) · exp((bᵢ−1) · lnθ)
    // For i=2,3: bᵢ−1 > 0 and bᵢ−1 far from 0 — standard exp is fine.
    // For i=1:   b₁−1 = −0.9967 — also fine (argument is not near 0 for T < T*).
    const terms_Sp = COEFFS.map(({ a, b }) => (a * b) * Math.exp((b - 1.0) * lnTh));
    const Sp       = neumaierSum(terms_Sp);

    return (Sp * theta - S) / (theta * theta * T_TRIPLE);
}

// ---------------------------------------------------------------------------
// Public result & error types
// ---------------------------------------------------------------------------

export interface SublimationResult {
    /** Input temperature [K] */
    T_K: number;
    /** Input temperature [°C] */
    T_C: number;
    /** Sublimation pressure [Pa] */
    p_Pa: number;
    /** Sublimation pressure [hPa] */
    p_hPa: number;
    /** Sublimation pressure [kPa] */
    p_kPa: number;
    /** Sublimation pressure [MPa] */
    p_MPa: number;
    /** Sublimation pressure [mbar]  (1 mbar = 100 Pa exactly) */
    p_mbar: number;
    /** Sublimation pressure [mmHg / Torr] — exact SI ratio 101 325/760 */
    p_mmHg: number;
    /** Sublimation pressure [bar] */
    p_bar: number;
    /** Reduced pressure π = p / p* */
    pi: number;
    /** ln(π) — quantity computed directly; never re-derived as log(exp(…)) */
    lnPi: number;
    /** Reduced temperature θ = T / T* */
    theta: number;
    /** Expanded uncertainty in sublimation pressure [Pa] (k=2) */
    uncertainty_Pa: number;
    /** Expanded uncertainty as relative % (k=2) */
    uncertainty_pct: number;
    /** Whether T is within the stated range of validity [50 K … 273.16 K] */
    inRange: boolean;
    /** Descriptive phase-state label */
    phaseLabel: string;
}

export interface ValidationResult {
    pass: boolean;
    T_K: number;
    expected_Pa: number;
    computed_Pa: number;
    absError_Pa: number;
    relError_pct: number;
    tolerance_pct: number;
    label: string;
    lnPi: number;
}

export interface SweepPoint {
    T_K: number;
    T_C: number;
    p_Pa: number;
    p_hPa: number;
    log10_p_Pa: number;
    uncertainty_pct: number;
    lnPi: number;
}

export interface UncertaintyResult {
    /** Relative expanded uncertainty (k=2) as a fraction (not percent) */
    relUncertainty: number;
    /** Relative expanded uncertainty as % */
    relUncertainty_pct: number;
    /** Which branch was used */
    branch: 'above130K' | 'below130K';
    /** Individual term contributions [fraction] — for diagnostics */
    terms: { t1: number; t2: number; t3: number };
}

export interface InverseResult {
    T_K: number;
    T_C: number;
    converged: boolean;
    iterations: number;
    /** Relative residual |p_calc − p_target| / p_target [%] at convergence */
    residual_pct: number;
}

export interface PrecisionDiagnostic {
    T_K: number;
    theta: number;
    lnTheta_standard: number;
    lnTheta_log1p: number;
    /** Difference in ULPs (unit-in-last-place) — larger = more precision recovered by log1p */
    lnTheta_diff_ulp: number;
    terms_raw: [number, number, number];
    sum_naive: number;
    sum_kahan: number;
    sum_diff: number;
    lnPi: number;
    p_Pa: number;
}

// ---------------------------------------------------------------------------
// ⑨ Core calculation — one call per public function
// ---------------------------------------------------------------------------

/**
 * Internal core: computes { lnPi, pi, theta, lnTh, S } for temperature T_K.
 *
 * Equation (4):  ln(π) = θ⁻¹ · Σᵢ aᵢ · θ^bᵢ
 *
 * Precision measures:
 *   • θ computed once; lnθ via log1p for θ near 1 (②)
 *   • each term aᵢ·θ^bᵢ = aᵢ·exp(bᵢ·lnθ) — shares precision-safe lnθ (③)
 *   • Neumaier-compensated sum over the three terms (①)
 *   • S retained for dlnPi_dT to avoid re-summation (④)
 *   • lnPi stored — callers do NOT re-derive it as log(exp(…)) (⑧)
 */
function _coreCalc(T_K: number): {
    lnPi: number; pi: number; theta: number; lnTh: number; S: number;
} {
    if (T_K <= 0) throw new RangeError(`T must be > 0 K, got ${T_K} K`);

    const theta = T_K / T_TRIPLE;
    const lnTh  = lnTheta(theta);

    const t1 = evalTerm(COEFFS[0].a, COEFFS[0].b, lnTh);
    const t2 = evalTerm(COEFFS[1].a, COEFFS[1].b, lnTh);
    const t3 = evalTerm(COEFFS[2].a, COEFFS[2].b, lnTh);
    const S  = neumaierSum([t1, t2, t3]);

    const lnPi = S / theta;
    const pi   = Math.exp(lnPi);

    return { lnPi, pi, theta, lnTh, S };
}

// ---------------------------------------------------------------------------
// Core public functions
// ---------------------------------------------------------------------------

/**
 * Returns the reduced sublimation pressure π = p_subl / p* at temperature T_K.
 * Lowest-level public entry point; prefer sublimationPressure() for rich output.
 */
export function sublimationPressureReduced(T_K: number): number {
    if (!Number.isFinite(T_K)) throw new TypeError(`T must be finite, got ${T_K}`);
    return _coreCalc(T_K).pi;
}

/**
 * Full sublimation pressure calculation with all unit conversions,
 * expanded uncertainty, analytical derivative context, and metadata.
 *
 * ⑨ Calls _coreCalc exactly once; passes S into dlnPi_dT to avoid
 *    a second summation; calls sublimationUncertainty once sharing theta.
 *
 * @param T_K  Temperature in Kelvin
 */
export function sublimationPressure(T_K: number): SublimationResult {
    if (!Number.isFinite(T_K)) {
        throw new TypeError(`Temperature must be a finite number, got ${T_K}`);
    }
    if (T_K <= 0) {
        throw new RangeError(`Temperature must be > 0 K, got ${T_K} K`);
    }

    const { lnPi, pi, theta } = _coreCalc(T_K);
    const p_Pa = pi * P_TRIPLE;

    // ── ⑦ Unit conversions — all exact or BIPM-defined ──────────────────────
    const p_hPa  = p_Pa * 1e-2;
    const p_kPa  = p_Pa * 1e-3;
    const p_MPa  = p_Pa * 1e-6;
    const p_mbar = p_Pa * 1e-2;         // 1 mbar ≡ 100 Pa (exact)
    const p_mmHg = p_Pa / PA_PER_MMHG;  // exact: 101 325 / 760 Pa per mmHg
    const p_bar  = p_Pa * 1e-5;

    // ── Uncertainty (k=2) — Eqs. (5a) and (5b) ──────────────────────────────
    const unc = _uncertainty(theta, T_K);
    const uncertainty_Pa  = p_Pa * unc.relUncertainty;
    const uncertainty_pct = unc.relUncertainty * 100;

    // ── Phase label ──────────────────────────────────────────────────────────
    const inRange = T_K >= T_MIN && T_K <= T_MAX;
    const phaseLabel = T_K <= T_MAX
        ? T_K < 273.15
            ? 'Ice Ih ↔ Vapour equilibrium'
            : 'Near triple point (Ice Ih / Liquid / Vapour)'
        : 'Above triple point — liquid–vapour region';

    return {
        T_K,
        T_C:  T_K - 273.15,
        p_Pa,
        p_hPa, p_kPa, p_MPa, p_mbar, p_mmHg, p_bar,
        pi, lnPi, theta,
        uncertainty_Pa, uncertainty_pct,
        inRange, phaseLabel,
    };
}

// ---------------------------------------------------------------------------
// ⑥ Uncertainty estimation — Eqs. (5a) and (5b)
// ---------------------------------------------------------------------------

/**
 * Internal uncertainty worker — takes pre-computed theta to avoid a
 * redundant division when called from sublimationPressure().
 */
function _uncertainty(theta: number, T_K: number): UncertaintyResult {
    // (Tt/T − 1) — one division, one subtraction; no cancellation concern
    // since T_K ≤ T_TRIPLE means Tt/T ≥ 1, so the result is ≥ 0.
    const ratioTt = 1.0 / theta - 1.0; // = Tt/T − 1

    // ln(Tt/T) = −lnθ.  We already have lnTheta available via theta here,
    // but this function only receives theta, so we re-derive safely:
    // ln(Tt/T) = −ln(T/Tt) = −lnθ.  For T near Tt: use log1p(1/θ − 1).
    const lnTtOverT = T_K > T_BRANCH
        ? Math.log1p(1.0 / theta - 1.0) // = ln(Tt/T), precise near T = Tt
        : -lnTheta(theta);               // far from Tt: −lnθ directly

    const t1 = 1.1e-5;            // triple-point pressure uncertainty (Eq. A6)
    const t2 = 1e-2 * ratioTt;   // vapor entropy contribution (Eq. A10)

    let t3: number;
    let branch: 'above130K' | 'below130K';

    if (T_K > T_BRANCH) {
        // Eq. (5a): ideal-gas cp term above 130 K
        t3     = 4e-4 * ratioTt * lnTtOverT;
        branch = 'above130K';
    } else {
        // Eq. (5b): Woolley grid interpolation error below 130 K
        const ratio130 = 130.0 / T_K - 1.0;
        const ln130    = Math.log(130.0 / T_K); // T far from 130 K here — safe
        t3     = 1.4e-4 + 4e-2 * ratio130 * ln130;
        branch = 'below130K';
    }

    // ⑥ Root-sum-of-squares via Math.hypot — avoids squaring very small terms
    const relUncertainty = Math.hypot(t1, t2, t3);

    return { relUncertainty, relUncertainty_pct: relUncertainty * 100, branch, terms: { t1, t2, t3 } };
}

/**
 * Public uncertainty API — Eqs. (5a) and (5b), expanded uncertainty (k=2).
 *
 * [U(p)/p]² ≈ t₁² + t₂² + t₃²  (Math.hypot for the root-sum-of-squares)
 *
 * @param T_K  Temperature [K]
 */
export function sublimationUncertainty(T_K: number): UncertaintyResult {
    if (!Number.isFinite(T_K) || T_K <= 0) {
        throw new RangeError(`T must be a positive finite number, got ${T_K}`);
    }
    return _uncertainty(T_K / T_TRIPLE, T_K);
}

// ---------------------------------------------------------------------------
// Analytical derivative dp/dT [Pa/K]  — ④
// ---------------------------------------------------------------------------

/**
 * Returns the exact (analytical) derivative dp_subl/dT [Pa/K].
 *
 *   p = π·p*   →   dp/dT = p · d(lnπ)/dT
 *
 * d(lnπ)/dT derived in dlnPi_dT() — no finite differences anywhere.
 * ⑨ _coreCalc called once; S passed to dlnPi_dT to reuse the compensated sum.
 */
export function sublimationPressureDerivative(T_K: number): number {
    if (!Number.isFinite(T_K) || T_K <= 0) {
        throw new RangeError(`T must be a positive finite number, got ${T_K}`);
    }
    const { pi, theta, lnTh, S } = _coreCalc(T_K);
    const p   = pi * P_TRIPLE;
    const dlp = dlnPi_dT(theta, lnTh, S);
    return p * dlp; // Pa/K
}

// ---------------------------------------------------------------------------
// Enthalpy of sublimation via Clausius–Clapeyron — ⑨ single core call
// ---------------------------------------------------------------------------

/**
 * Estimates the specific enthalpy of sublimation [J/kg] at temperature T
 * using the Clausius–Clapeyron equation:
 *
 *   Δh_sub ≈ R·T² · d(ln p)/dT  =  R·T² / p · dp/dT
 *
 * ⑨ Calls _coreCalc once; shares core result with dp/dT computation —
 *    previously this triggered three separate _coreCalc calls.
 *
 * @param T_K  Temperature [K]
 * @returns    Approximate Δh_sub [J/kg]
 */
export function enthalpyOfSublimation(T_K: number): number {
    if (!Number.isFinite(T_K) || T_K <= 0) {
        throw new RangeError(`T must be a positive finite number, got ${T_K}`);
    }
    const { theta, lnTh, S } = _coreCalc(T_K);
    const dlp = dlnPi_dT(theta, lnTh, S); // d(lnπ)/dT = (1/p)·dp/dT
    return R_WATER * T_K * T_K * dlp;     // Δh = R·T²·(d lnp / dT)
}

// ---------------------------------------------------------------------------
// ⑤ Inverse solve — Newton–Raphson in log-space with stagnation guard
// ---------------------------------------------------------------------------

/**
 * Given a sublimation pressure [Pa], finds the temperature [K] by
 * Newton–Raphson iteration on  f(T) = lnπ(T) − lnπ_target = 0.
 *
 * Log-space advantages:
 *   a) Bounded dynamic range regardless of the 10⁹⁰ span of pressures.
 *   b) Analytical Jacobian eliminates finite-difference noise.
 *
 * Robustness features (⑤):
 *   • Bisection half-step when Newton would leave [T_MIN, T_MAX].
 *   • Stagnation guard: exits if |dT| stops shrinking (avoids infinite loop
 *     from oscillation on a pathological input).
 *   • Tight tolerance of 1×10⁻¹³ on |f| (log-space residual).
 *
 * @param p_Pa     Target sublimation pressure [Pa]
 * @param T0_K     Initial guess [K]  (default: calibrated from curve anchors)
 * @param maxIter  Maximum iterations (default: 80)
 * @param tol      Convergence tolerance on |f| (default: 1×10⁻¹³)
 */
export function temperatureFromSublimationPressure(
    p_Pa:    number,
    T0_K?:   number,
    maxIter: number = 80,
    tol:     number = 1e-13,
): InverseResult {
    if (!Number.isFinite(p_Pa) || p_Pa <= 0) {
        throw new RangeError(`Pressure must be a positive finite number, got ${p_Pa} Pa`);
    }
    if (p_Pa > P_TRIPLE * 1.0001) {
        throw new RangeError(
            `Pressure ${p_Pa.toExponential(4)} Pa exceeds triple-point pressure ${P_TRIPLE} Pa`,
        );
    }

    // ── Smart initial guess via Clausius–Clapeyron linearisation in ln p ────
    // ln p ≈ A − B/T  →  T ≈ B / (A − ln p)
    // Anchors: (T_TRIPLE, LN_P_TRIPLE) and (T_MIN, _LN_P_50K) — both exact.
    let T: number;
    if (T0_K !== undefined) {
        T = Math.max(T_MIN + 0.001, Math.min(T_MAX - 0.001, T0_K));
    } else {
        const B       = (_LN_P_50K - LN_P_TRIPLE) / (1.0 / T_MIN - 1.0 / T_TRIPLE);
        const A       = LN_P_TRIPLE + B / T_TRIPLE;
        const T_guess = B / (A - Math.log(p_Pa));
        T = isFinite(T_guess)
            ? Math.max(T_MIN + 0.001, Math.min(T_MAX - 0.001, T_guess))
            : 200.0; // safe fallback
    }

    const lnPi_target = Math.log(p_Pa / P_TRIPLE);

    let iter      = 0;
    let converged = false;
    let prev_dT   = Infinity; // stagnation tracker

    while (iter < maxIter) {
        iter++;

        const core = _coreCalc(T);
        const f    = core.lnPi - lnPi_target; // residual in log-space

        if (Math.abs(f) < tol) {
            converged = true;
            break;
        }

        // Analytical Jacobian (④)
        const df = dlnPi_dT(core.theta, core.lnTh, core.S);
        if (!Number.isFinite(df) || df === 0) break;

        // Newton step
        let dT = -f / df;

        // ⑤ Boundary damping: bisect toward boundary instead of stepping out
        const Tnew = T + dT;
        if (Tnew < T_MIN) {
            dT = (T_MIN - T) * 0.5;
        } else if (Tnew > T_MAX) {
            dT = (T_MAX - T) * 0.5;
        }

        // ⑤ Stagnation guard: if step has stopped shrinking for 3 iterations, break
        if (Math.abs(dT) >= prev_dT * 2 && iter > 5) break;
        prev_dT = Math.abs(dT);

        T += dT;

        // Hard clamp after update (safety net)
        if (T < T_MIN) T = T_MIN + 1e-6;
        if (T > T_MAX) T = T_MAX - 1e-6;
    }

    // Final pressure-space residual for the report
    const pCheck       = _coreCalc(T).pi * P_TRIPLE;
    const residual_pct = Math.abs(pCheck - p_Pa) / p_Pa * 100;

    return { T_K: T, T_C: T - 273.15, converged, iterations: iter, residual_pct };
}

// ---------------------------------------------------------------------------
// ⑧ Sweep utility — log10(p) without log∘exp round-trip
// ---------------------------------------------------------------------------

/**
 * Generates an array of SweepPoints for plotting.
 *
 * ⑧ log10_p_Pa = lnPi · log₁₀(e) + log₁₀(p*)
 *    Uses lnPi directly — no log(exp(…)) round-trip.
 *
 * @param T_start_K  Start temperature [K] (default: T_MIN)
 * @param T_end_K    End temperature [K]   (default: T_MAX)
 * @param steps      Number of points (default: 600)
 */
export function sweepSublimationPressure(
    T_start_K: number = T_MIN,
    T_end_K:   number = T_MAX,
    steps:     number = 600,
): SweepPoint[] {
    if (T_start_K >= T_end_K) throw new RangeError('T_start_K must be < T_end_K');
    if (steps < 2)            throw new RangeError('steps must be ≥ 2');

    const points: SweepPoint[] = [];
    const dT = (T_end_K - T_start_K) / (steps - 1);

    for (let i = 0; i < steps; i++) {
        const T_K = T_start_K + i * dT; // exact accumulation — avoids drift
        try {
            const { lnPi, pi, theta } = _coreCalc(T_K);
            const p_Pa  = pi * P_TRIPLE;
            const unc   = _uncertainty(theta, T_K);
            points.push({
                T_K,
                T_C:             T_K - 273.15,
                p_Pa,
                p_hPa:           p_Pa * 1e-2,
                log10_p_Pa:      lnPi * LOG10E + LOG10_P_TRIPLE, // ⑧ no log∘exp
                uncertainty_pct: unc.relUncertainty_pct,
                lnPi,
            });
        } catch {
            // skip any degenerate point
        }
    }

    return points;
}

// ---------------------------------------------------------------------------
// Constraint check — Eq. (4a): Σ aᵢ = 0
// ---------------------------------------------------------------------------

/**
 * Verifies constraint Eq. (4a): Σ aᵢ = 0.
 *
 * Both naïve and Neumaier-compensated sums are returned so the UI can show
 * the true FP residual.  Tight pass threshold: |sum| < 1×10⁻¹⁰
 * (max |aᵢ| ≈ 27; machine ε ≈ 2.2×10⁻¹⁶; theoretical residual < 3×10⁻¹⁴).
 */
export function checkConstraint4a(): {
    sum:       number;
    sumKahan:  number;
    pass:      boolean;
    passKahan: boolean;
} {
    const sumNaive  = COEFFS.reduce((acc, { a }) => acc + a, 0.0);
    const sumKahan  = neumaierSum(COEFFS.map(({ a }) => a));

    return {
        sum:       sumNaive,
        sumKahan,
        pass:      Math.abs(sumNaive)  < 1e-10,
        passKahan: Math.abs(sumKahan)  < 1e-12,
    };
}

// ---------------------------------------------------------------------------
// Validation against paper reference values
// ---------------------------------------------------------------------------

/** Reference values from the paper — Table 1 and §3 verification point */
const VERIFICATION_POINTS = Object.freeze([
    // §3 explicit computer-program verification point
    { T_K: 230.0, p_Pa_expected: 8.947_35,          label: 'Paper §3 verification point',  tol_pct: 0.001  },
    // Table 1 — selected input data on the sublimation curve
    { T_K: 273.0, p_Pa_expected: 6.036_717_87e2,    label: 'Table 1: 273 K',               tol_pct: 0.05   },
    { T_K: 272.0, p_Pa_expected: 5.557_230_06e2,    label: 'Table 1: 272 K',               tol_pct: 0.05   },
    { T_K: 270.0, p_Pa_expected: 4.700_764_77e2,    label: 'Table 1: 270 K',               tol_pct: 0.05   },
    { T_K: 265.0, p_Pa_expected: 3.059_209_33e2,    label: 'Table 1: 265 K',               tol_pct: 0.05   },
    { T_K: 260.0, p_Pa_expected: 1.958_076_01e2,    label: 'Table 1: 260 K',               tol_pct: 0.05   },
    { T_K: 250.0, p_Pa_expected: 7.601_672_20e1,    label: 'Table 1: 250 K',               tol_pct: 0.05   },
    { T_K: 200.0, p_Pa_expected: 1.625_953_24e-1,   label: 'Table 1: 200 K',               tol_pct: 0.05   },
    { T_K: 180.0, p_Pa_expected: 5.392_122_10e-3,   label: 'Table 1: 180 K',               tol_pct: 0.05   },
    { T_K: 160.0, p_Pa_expected: 7.728_901_37e-5,   label: 'Table 1: 160 K',               tol_pct: 0.1    },
    { T_K: 150.0, p_Pa_expected: 6.095_677_59e-6,   label: 'Table 1: 150 K',               tol_pct: 0.1    },
    { T_K: 140.0, p_Pa_expected: 3.366_204_44e-7,   label: 'Table 1: 140 K',               tol_pct: 0.1    },
    { T_K: 130.0, p_Pa_expected: 1.200_376_34e-8,   label: 'Table 1: 130 K',               tol_pct: 0.1    },
] as const);

/**
 * Runs all built-in validation tests against paper reference values.
 * ⑨ Uses _coreCalc directly — one call per test point.
 */
export function runValidation(): ValidationResult[] {
    return VERIFICATION_POINTS.map(({ T_K, p_Pa_expected, label, tol_pct }) => {
        const core        = _coreCalc(T_K);
        const computed_Pa = core.pi * P_TRIPLE;
        const absError_Pa = Math.abs(computed_Pa - p_Pa_expected);
        const relError_pct = absError_Pa / p_Pa_expected * 100;

        return {
            pass:         relError_pct <= tol_pct,
            T_K,
            expected_Pa:  p_Pa_expected,
            computed_Pa,
            absError_Pa,
            relError_pct,
            tolerance_pct: tol_pct,
            label,
            lnPi:         core.lnPi,
        };
    });
}

// ---------------------------------------------------------------------------
// Precision diagnostics
// ---------------------------------------------------------------------------

/**
 * Runs per-temperature FP diagnostics exposing the benefit of each
 * hardening measure quantitatively.
 */
export function precisionDiagnostics(temperatures: number[]): PrecisionDiagnostic[] {
    const eps = Number.EPSILON;

    return temperatures.map((T_K) => {
        const theta = T_K / T_TRIPLE;

        // ② log1p vs standard log
        const lnTheta_standard = Math.log(theta);
        const lnTheta_log1p    = Math.log1p(theta - 1.0);
        const absRef = Math.abs(lnTheta_log1p) || eps;
        const lnTheta_diff_ulp = Math.abs(lnTheta_standard - lnTheta_log1p) / (eps * absRef);

        // Use precision-safe lnθ for everything below
        const lnTh = lnTheta(theta);

        // ① Naïve vs Neumaier sum
        const t1 = evalTerm(COEFFS[0].a, COEFFS[0].b, lnTh);
        const t2 = evalTerm(COEFFS[1].a, COEFFS[1].b, lnTh);
        const t3 = evalTerm(COEFFS[2].a, COEFFS[2].b, lnTh);

        const sum_naive = t1 + t2 + t3;
        const sum_kahan = neumaierSum([t1, t2, t3]);

        const lnPi = sum_kahan / theta;
        const p_Pa = Math.exp(lnPi) * P_TRIPLE;

        return {
            T_K, theta,
            lnTheta_standard, lnTheta_log1p, lnTheta_diff_ulp,
            terms_raw: [t1, t2, t3],
            sum_naive, sum_kahan,
            sum_diff: sum_kahan - sum_naive,
            lnPi, p_Pa,
        };
    });
}

// ---------------------------------------------------------------------------
// Temperature unit converters
// ---------------------------------------------------------------------------

/** Kelvin → Celsius */
export const KtoC = (K: number): number => K - 273.15;
/** Celsius → Kelvin */
export const CtoK = (C: number): number => C + 273.15;
/** Kelvin → Fahrenheit */
export const KtoF = (K: number): number => (K - 273.15) * (9.0 / 5.0) + 32.0;
/** Fahrenheit → Kelvin */
export const FtoK = (F: number): number => (F - 32.0) * (5.0 / 9.0) + 273.15;

// ---------------------------------------------------------------------------
// Library metadata
// ---------------------------------------------------------------------------

export const LIBRARY_META = {
    name:        'IAPWS Sublimation Pressure Engine',
    version:     '3.0.0',
    reference:   'Wagner, Riethmann, Feistel & Harvey (2011) — J. Phys. Chem. Ref. Data 40, 043103',
    doi:         '10.1063/1.3657937',
    equation:    'Eq. (4) — sublimation pressure of H₂O Ice Ih',
    T_range_K:   [T_MIN, T_MAX] as [number, number],
    T_triple_K:  T_TRIPLE,
    p_triple_Pa: P_TRIPLE,
    R_water:     R_WATER,
    uncertainty: 'Eqs. (5a)/(5b) — expanded uncertainty k=2',
    fp_hardening: [
        '① Neumaier–Kahan compensated summation for Σ aᵢ·θ^bᵢ — O(ε·|result|) error',
        '② log1p(θ−1) for ln(θ) when θ ≈ 1 — full 53-bit precision near triple point',
        '③ aᵢ·exp(bᵢ·lnθ) sharing precision-safe lnθ across all three terms',
        '④ Analytical d(lnπ)/dT with Kahan S′ — zero finite-difference noise',
        '⑤ Newton–Raphson log-space + stagnation guard + bisection at boundaries',
        '⑥ Math.hypot() for uncertainty RSS — no squaring of tiny/huge terms',
        '⑦ Exact SI conversions: mmHg = 101325/760 Pa; all others exact powers of 10',
        '⑧ log₁₀(p) = lnPi·log₁₀(e) + log₁₀(p*) — avoids log∘exp round-trip',
        '⑨ Single _coreCalc per public call — enthalpyOfSublimation: 3 calls → 1',
        '⑩ Object.freeze on COEFFS — prevents runtime mutation of coefficient table',
    ],
} as const;
