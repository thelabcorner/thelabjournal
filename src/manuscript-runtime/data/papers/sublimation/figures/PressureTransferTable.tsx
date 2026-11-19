import { useMemo } from 'react';
import { ManuscriptLabel } from '../../../../components/typography/ManuscriptLabel';
import { cn } from '../../../../utils/cn';
import { InlineMath } from '../ScientificMath';
import { sublimationPressure, FtoK } from '../../../../utils/iapws-sublimation';
import {
  SATURATING_PARAMS,
  boundedPStarSeries,
  drivingForceMTorr,
  kgSaturating,
  kSaturating,
  normalizedSeriesScore,
} from '../pressureModel';

// ============================================================================
// Sublimation pressure via IAPWS Wagner (2011), exact, not interpolated
// p_mmHg is in Torr (1 Torr = 1000 mTorr); convert accordingly
// ============================================================================
function getPsubMTorr(tempF: number): number {
  try {
    const T_K = FtoK(tempF);
    return sublimationPressure(T_K).p_mmHg * 1000; // Torr → mTorr
  } catch {
    return 0;
  }
}

// ============================================================================
// Pikal vial coefficients, 50/50 H₂O+N₂ mixture parameters
// C₃_mix(50% H₂O) = 162 mTorr  [vs 408 for pure N₂, 90 for pure H₂O]
// C₂_mix ≈ 13.17 W/m²K  (back-solved from Ganguly Kv_eff table)
// Source: Cummings (2026), §Thesis 2; Ganguly (2014) Fig 2.1 Kc-reconstruction
// ============================================================================
const { c2: C2 } = SATURATING_PARAMS;

// ============================================================================
// Smoluchowski gas conduction (Kg)
// ============================================================================
function computeKg(pressureMTorr: number): number {
  return kgSaturating(pressureMTorr);
}

type Row = {
  pressure: number;
  kSat: number;
  kgPercent: number;
  pH2O: number;
  drivingForce: number;
  seriesScore: number;
  relativeSeries: string;
  note: string;
};

export function PressureTransferTable({
  tempF, fH2O, eta,
}: {
  tempF: number; fH2O: number; eta: number;
}) {

  const pSub = useMemo(() => getPsubMTorr(tempF), [tempF]);

  // Generate rows
  const rows = useMemo(() => {
    const PRESSURES = [10, 50, 100, 200, 300, 500, 750, 1000, 1250, 1500];
    const resultRows: Row[] = [];
    const pStar = boundedPStarSeries(pSub, fH2O, eta, 10, 1500);
    let nearestPStarIdx = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    PRESSURES.forEach((p, idx) => {
      const kSat = kSaturating(p);
      const kg = computeKg(p);
      const kgPercent = (kg / C2) * 100;
      const pH2O = fH2O * p;
      const df = drivingForceMTorr(p, pSub, fH2O);
      const seriesScore = normalizedSeriesScore(p, pSub, fH2O, eta);

      const distance = Math.abs(p - pStar);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPStarIdx = idx;
      }

      resultRows.push({
        pressure: p,
        kSat,
        kgPercent,
        pH2O,
        drivingForce: df,
        seriesScore,
        relativeSeries: '',
        note: '',
      });
    });

    // Normalize F relative to baseline (50 mTorr)
    const baselineSeries = resultRows[1]?.seriesScore ?? 1;
    resultRows.forEach((row) => {
      row.relativeSeries = (row.seriesScore / baselineSeries).toFixed(2) + 'x';

      // Add interpretive notes
      if (row.pressure === 10) {
        row.note = 'Hard vacuum: minimal Kg plateau utilization';
      } else if (row.pressure === 50) {
        row.note = 'Baseline (Ganguly free-molecular boundary)';
      } else if (row.pressure === 100) {
        row.note = 'Ganguly transition region begins';
      } else if (row.pressure === 200) {
        row.note = 'Upper Ganguly experimental boundary';
      } else if (row.pressure === 300) {
        row.note = 'Approaching Kg plateau';
      } else if (row.pressure === 500) {
        row.note = 'Representative mid-range pressure';
      } else if (row.pressure === 750) {
        row.note = 'Model-family behavior becomes increasingly uncertain';
      } else if (row.pressure === 1000) {
        row.note = 'Above direct Ganguly range; tray data required';
      } else if (row.pressure === 1250) {
        row.note = 'High-pressure extrapolation region';
      } else if (row.pressure === 1500) {
        row.note = 'Upper exploratory boundary';
      }

      if (row.pressure === resultRows[nearestPStarIdx]?.pressure) {
        row.note = `Nearest sampled P* · ${row.note}`;
      }
    });

    return { rows: resultRows, nearestPStarIdx, pStar };
  }, [pSub, fH2O, eta]);

  const tempC = ((tempF - 32) * 5) / 9;

  return (
    <figure className="my-4" aria-label="Pressure-transfer detailed data table">
      <div className="bg-[var(--figure-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            <ManuscriptLabel className="mr-2">Table 1</ManuscriptLabel>
             Companion values for the model panels above
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
At <InlineMath math="T_{\mathrm{product}}" /> = {tempF.toFixed(1)}°F
             ({tempC.toFixed(1)}°C), <InlineMath math="P_{\mathrm{sub}}" /> = {pSub.toFixed(0)} mTorr,
             <InlineMath math="f_{\mathrm{H_2O}}" /> = {(fH2O * 100).toFixed(0)}%, and
              {' '}<InlineMath math="\eta" /> = {eta.toFixed(2)}. The gas-conduction percentage measures
              the assumed approach to its plateau. The table lists the
              positive part of the vapor-transfer potential
              {' '}<InlineMath math="P_{\mathrm{sub}}-p_{\mathrm{H_2O}}" />;
              the companion curve above retains the signed difference.
              The relative series score uses 50 mTorr as baseline, the
              transfer coefficients remain fixed, and
              {' '}<InlineMath math="K_f" /> is omitted.
          </p>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface)]">
                <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">
                  P_total (mTorr)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)]">
                  K_sat (W/m²K)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)]">
                  Kg plateau %
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)]">
                  p_H₂O (mTorr)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)]">
                   Positive vapor potential (mTorr)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--accent)]">
                  J_series (relative)
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">
                  Regime / interpretation
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.rows.map((row, idx) => (
                <tr
                  key={row.pressure}
                  className={cn(
                    'border-t border-[var(--border)] hover:bg-[var(--bg-hover)]',
                    idx === 1 && 'bg-[var(--accent)]/5',
                    idx === rows.nearestPStarIdx && 'bg-[var(--success)]/5'
                  )}
                >
                  <td data-label="Pressure (mTorr)" className="px-3 py-2 font-mono tabular-nums text-[var(--text)] font-medium">{row.pressure}</td>
                  <td data-label="Heat transfer K (W/m²K)" className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.kSat.toFixed(1)}
                  </td>
                  <td data-label="Gas plateau (%)" className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.kgPercent.toFixed(0)}%
                  </td>
                  <td data-label="H₂O partial (mTorr)" className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.pH2O.toFixed(0)}
                  </td>
                  <td data-label="Positive vapor potential" className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.drivingForce.toFixed(0)}
                  </td>
                  <td data-label="Series score / 50 mTorr"
                    className={cn(
                      'px-3 py-2 text-right font-mono tabular-nums font-semibold',
                      row.relativeSeries === '1.00x' ? 'text-[var(--text-muted)]' : 'text-[var(--accent)]'
                    )}
                  >
                    {row.relativeSeries}
                  </td>
                  <td data-label="Model interpretation" className="px-3 py-2 text-xs text-[var(--text)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)]/30">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
Within the fixed-coefficient model, <InlineMath math="K_{\mathrm{sat}}" /> rises with
             pressure while the water-vapor driving force declines. The highlighted row is
             nearest the calculated stationary point ({rows.pStar.toFixed(0)} mTorr), not a
             recommended setpoint. Tray-specific transfer, the flow term <InlineMath math="K_f" />,
             cold-wall capture and evolving gas composition remain unmeasured.
          </p>
        </div>
      </div>
    </figure>
  );
}
