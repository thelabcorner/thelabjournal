import { useMemo, useState } from 'react';
import { ResearchSlider } from '../../../../components/controls/ResearchSlider';
import { InlineMath } from '../ScientificMath';
import { sublimationPressure, FtoK } from '../../../../utils/iapws-sublimation';
import {
  SATURATING_PARAMS,
  boundedPStarSeries,
  drivingForceMTorr,
  kgSaturating,
  kSaturating,
  normalizedSeriesScore,
  screeningScore,
} from '../pressureModel';

interface WindowEstimatorWidgetProps {
  className?: string;
}

// ============================================================================
// Pikal vial coefficients, 50/50 H₂O+N₂ mixture parameters
// C₃_mix(50% H₂O) = 162 mTorr [vs 408 for pure N₂, 90 for pure H₂O]
// C₂_mix ≈ 13.17 W/m²K (back-solved from Ganguly Kv_eff table, Cummings 2026)
// ============================================================================
const { kc: KC, kr: KR, c2: C2, c3: C3 } = SATURATING_PARAMS;

// ============================================================================
// Sublimation pressure via IAPWS Wagner (2011), exact
// ============================================================================
function saturationPressureAtTempF(tempF: number): number {
  try {
    const T_K = FtoK(tempF);
    return sublimationPressure(T_K).p_mmHg * 1000; // Torr → mTorr
  } catch {
    return 0;
  }
}

export function WindowEstimatorWidget({ className }: WindowEstimatorWidgetProps) {
  const [productTempF, setProductTempF] = useState(20);
  const [pressure, setPressure] = useState(500);
  const [vaporFraction, setVaporFraction] = useState(0.5);
  const [eta, setEta] = useState(1.0);

  const metrics = useMemo(() => {
    const pIce = saturationPressureAtTempF(productTempF);
    const pH2O = pressure * vaporFraction; // Partial pressure of water vapor
    const pNCG = pressure * (1 - vaporFraction); // Partial pressure of inert gas
    const driving = drivingForceMTorr(pressure, pIce, vaporFraction);
    const kSat = kSaturating(pressure);
    const screen = screeningScore(pressure, pIce, vaporFraction);
    const series = normalizedSeriesScore(pressure, pIce, vaporFraction, eta);
    const pStar = boundedPStarSeries(pIce, vaporFraction, eta, 50, 1500);
    const hasPositiveDrivingForce = pH2O < pIce; // Equilibrium criterion only, not an equipment safety check.

    // Kg plateau utilization
    const kg = kgSaturating(pressure);
    const kgPlateauPercent = Math.round((kg / C2) * 100);

    return {
      pIce,
      pH2O,
      pNCG,
      driving,
      kSat,
      screen,
      series,
      pStar,
      hasPositiveDrivingForce,
      kgPlateauPercent,
    };
  }, [pressure, productTempF, vaporFraction, eta]);

  return (
    <figure className={className ?? 'my-5'}>
      <div className="bg-[var(--figure-bg)] border border-[var(--border)] rounded-lg p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-[var(--text-secondary)]">
            <span className="font-mono text-[var(--accent)] mr-1">Widget</span>
            Pressure-Window Estimator (Exploratory Scoping)
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Explore the algebraically specified saturating-family screening and linearized series-resistance model. The uncertain fourth
            flow term is intentionally omitted rather than assigned the retired √P law.
            <strong> Not a calibrated process controller.</strong>
          </p>
        </div>

        <div className="no-print space-y-3">
          <ResearchSlider
            label="Product temperature"
            value={productTempF}
            min={-10}
            max={37}
            step={1}
            unit="°F"
            onChange={setProductTempF}
          />
          <ResearchSlider
            label="Chamber pressure P_total"
            value={pressure}
            min={50}
            max={1500}
            step={50}
            unit=" mTorr"
            onChange={setPressure}
          />
          <ResearchSlider
            label="H₂O mole fraction (driving force)"
            value={vaporFraction}
            min={0.1}
            max={0.8}
            step={0.05}
            onChange={setVaporFraction}
            formatValue={(v) => (v * 100).toFixed(0) + '%'}
          />
          <ResearchSlider
            label="Series-resistance ratio η"
            value={eta}
            min={0}
            max={10}
            step={0.25}
            onChange={setEta}
            formatValue={(v) => v.toFixed(2)}
          />
        </div>

        <div className="border-t border-[var(--border)] pt-3">
          <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Computed Metrics</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Metric label="P_sub(T)" subtitle="Ice equilibrium" value={metrics.pIce.toFixed(0)} unit="mTorr" />
            <Metric label="p_H₂O" subtitle="Vapor partial P" value={metrics.pH2O.toFixed(0)} unit="mTorr" />
            <Metric label="p_NCG" subtitle="Inert partial P" value={metrics.pNCG.toFixed(0)} unit="mTorr" />
            <Metric label="Driving force" subtitle="P_sub − p_H₂O" value={metrics.driving.toFixed(0)} unit="mTorr" />
            <Metric label="K_sat" subtitle="Kc + Kr + Kg" value={metrics.kSat.toFixed(2)} unit="W/m²K" />
            <Metric label="Kg plateau" subtitle="Utilization" value={metrics.kgPlateauPercent.toString()} unit="%" />
            <Metric
              label="Screening F"
              subtitle="K_sat × driving"
              value={(metrics.screen / 1000).toFixed(1)}
              unit="scaled"
            />
            <Metric
              label="Series score"
              subtitle="Includes η penalty"
              value={(metrics.series / 1000).toFixed(1)}
              unit="scaled"
            />
            <Metric
              label="P* series"
              subtitle="Closed-form stationary point"
              value={Number.isFinite(metrics.pStar) ? metrics.pStar.toFixed(0) : 'None'}
              unit="mTorr"
            />
            <Metric
              label="Modeled driving force"
              subtitle="p_H₂O < P_sub"
              value={metrics.hasPositiveDrivingForce ? 'Positive' : 'Nonpositive'}
              unit=""
              tone={metrics.hasPositiveDrivingForce ? 'success' : 'danger'}
            />
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-2">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
This estimator holds the Pikal/Smoluchowski coefficients fixed
             (<InlineMath math="K_c" /> = {KC}, <InlineMath math="K_r" /> = {KR},
             <InlineMath math="C_2" /> = {C2}, <InlineMath math="C_3" /> = {C3})
             while varying the assumed vapor driving force. The quantity
             {' '}<InlineMath math="F_{\mathrm{screen}}" /> is a screening metric, not a sublimation
             mass flux. The parameter <InlineMath math="\eta" /> introduces an assumed
             series-resistance penalty. The flow term <InlineMath math="K_f" /> is excluded
             because it has not been calibrated for the Harvest Right geometry.
          </p>
        </div>
      </div>
    </figure>
  );
}

function Metric({
  label,
  subtitle,
  value,
  unit,
  tone = 'default',
}: {
  label: string;
  subtitle: string;
  value: string;
  unit: string;
  tone?: 'default' | 'success' | 'danger';
}) {
  const toneClass = tone === 'danger'
    ? 'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]'
    : tone === 'success'
      ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)]'
      : 'border-[var(--border)] bg-[var(--bg-surface)]';
  const valueClass = tone === 'danger'
    ? 'text-[var(--status-danger-text)]'
    : tone === 'success'
      ? 'text-[var(--status-success-text)]'
      : 'text-[var(--accent)]';

  return (
    <div className={`rounded border ${toneClass} px-2.5 py-2`}>
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
      <p className="text-xs text-[var(--text-muted)] mb-0.5">{subtitle}</p>
      <p className={`text-sm font-mono font-semibold ${valueClass}`}>
        {value} <span className="text-xs font-normal text-[var(--text-muted)]">{unit}</span>
      </p>
    </div>
  );
}
