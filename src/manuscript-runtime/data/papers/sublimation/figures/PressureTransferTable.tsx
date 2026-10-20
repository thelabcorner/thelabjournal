import { useState, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
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

export function PressureTransferTable() {
  // State
  const [tempF, setTempF] = useState(20);
  const [fH2O, setFH2O] = useState(0.5);
  const [eta, setEta] = useState(1.0);

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
            <span className="font-mono text-[var(--accent)] mr-2">Table 1</span>
            Saturating-Family Pressure / Series-Resistance Table
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
At <InlineMath math="T_{\mathrm{product}}" /> = {tempF.toFixed(1)}°F
             ({tempC.toFixed(1)}°C), <InlineMath math="P_{\mathrm{sub}}" /> = {pSub.toFixed(0)} mTorr,
             <InlineMath math="f_{\mathrm{H_2O}}" /> = {(fH2O * 100).toFixed(0)}%, and
             {' '}<InlineMath math="\eta" /> = {eta.toFixed(2)}. The gas-conduction percentage represents
             saturation toward the fixed plateau. The driving force is
             {' '}<InlineMath math="P_{\mathrm{sub}}-p_{\mathrm{H_2O}}" />, and the series-model score is
             normalized to 50 mTorr. The coefficients remain fixed as composition changes;
             <InlineMath math="K_f" /> is omitted.
          </p>

          {/* Control sliders */}
          <div className="no-print mt-3 space-y-2 bg-[var(--bg-surface)] rounded p-2">
            <ResearchSlider
              label="Product Temperature"
              value={tempF}
              min={-10}
              max={37}
              step={0.5}
              unit="°F"
              onChange={setTempF}
              formatValue={(v) => `${v.toFixed(1)}°F`}
            />
            <ResearchSlider
              label="H₂O Mole Fraction (Driving Force)"
              value={fH2O}
              min={0.1}
              max={0.8}
              step={0.05}
              onChange={setFH2O}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <ResearchSlider
              label="Series-Resistance Ratio η"
              value={eta}
              min={0}
              max={10}
              step={0.25}
              onChange={setEta}
              formatValue={(v) => v.toFixed(2)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface)]">
                <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  P_total (mTorr)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  K_sat (W/m²K)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  Kg plateau %
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  p_H₂O (mTorr)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  Driving Force (mTorr)
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--accent)] uppercase">
                  J_series (relative)
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  Regime / Interpretation
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
                  <td className="px-3 py-2 font-mono tabular-nums text-[var(--text)] font-medium">{row.pressure}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.kSat.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.kgPercent.toFixed(0)}%
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.pH2O.toFixed(0)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                    {row.drivingForce.toFixed(0)}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right font-mono tabular-nums font-semibold',
                      row.relativeSeries === '1.00x' ? 'text-[var(--text-muted)]' : 'text-[var(--accent)]'
                    )}
                  >
                    {row.relativeSeries}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--text)]">{row.note}</td>
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
