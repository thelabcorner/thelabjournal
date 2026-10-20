import { useState, useMemo } from 'react';
import { ResearchChart } from '../../../../components/charts/ResearchChart';
import { ResearchSlider } from '../../../../components/controls/ResearchSlider';
import { cn } from '../../../../utils/cn';
import { getChartTokens } from '../../../../theme/chartTokens';
import { sublimationPressure, FtoK } from '../../../../utils/iapws-sublimation';
import {
  SATURATING_PARAMS,
  boundedPStarSeries,
  drivingForceMTorr,
  kgSaturating,
  kSaturating,
  normalizedSeriesScore,
} from '../pressureModel';

interface PressureTransferChartProps {
  isDark?: boolean;
}

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

function ControlPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-print bg-[var(--bg-surface)] border border-[var(--border)] rounded-md p-3 space-y-3">
      {children}
    </div>
  );
}

function StatPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border px-3 py-2 min-w-[80px]',
        accent
          ? 'bg-[var(--accent-muted)] border-[var(--accent)] border-opacity-40'
          : 'bg-[var(--figure-bg)] border-[var(--border)]'
      )}
    >
      <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide leading-none mb-1">
        {label}
      </span>
      <span
        className={cn(
          'text-sm font-mono font-semibold tabular-nums',
          accent ? 'text-[var(--accent)]' : 'text-[var(--text)]'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PressureTransferChart({ isDark = false }: PressureTransferChartProps) {
  // State for sliders
  const [tempF, setTempF] = useState(20); // degrees F
  const [fH2O, setFH2O] = useState(0.5); // mole fraction H2O (0–1)
  const [eta, setEta] = useState(1.0); // normalized product/heat resistance ratio

  // Compute saturation pressure for current temperature
  const pSub = useMemo(() => getPsubMTorr(tempF), [tempF]);

  // Generate pressure sweep data (10–1500 mTorr)
  const PRESSURES = [10, 50, 100, 200, 300, 500, 750, 1000, 1250, 1500];

  // Compute Kv_eff and driving force for each pressure point
  const { kData, drivingData, kgPercents, pStar, seriesAtPStar } = useMemo(() => {
    const k: number[] = [];
    const driving: number[] = [];
    const kgPct: number[] = [];

    PRESSURES.forEach((p) => {
      const kSat = kSaturating(p);
      const kgVal = computeKg(p);
      const kgPlateauPct = (kgVal / C2) * 100;
      const df = drivingForceMTorr(p, pSub, fH2O);

      k.push(kSat);
      driving.push(df);
      kgPct.push(kgPlateauPct);
    });

    const pStar = boundedPStarSeries(pSub, fH2O, eta, 10, 1500);
    const seriesAtPStar = normalizedSeriesScore(pStar, pSub, fH2O, eta);
    return { kData: k, drivingData: driving, kgPercents: kgPct, pStar, seriesAtPStar };
  }, [pSub, fH2O, eta]);

  const option = useMemo(() => {
    const theme = getChartTokens(isDark);

    return {
      animation: true,
      backgroundColor: 'transparent',
      aria: {
        enabled: true,
        description: `Pressure-transfer explorer at ${tempF.toFixed(1)} degrees Fahrenheit. K sat rises with total chamber pressure while the water-vapor driving force falls. The current series-model stationary point is ${pStar.toFixed(0)} millitorr.`,
      },
      grid: { top: 18, right: 36, bottom: 44, left: 52 },
      legend: {
        bottom: 2,
        textStyle: { color: theme.text, fontSize: 11 },
      },
      tooltip: {
        trigger: 'axis' as const,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          const pressure = params[0]?.value?.[0];
          const idx = PRESSURES.indexOf(pressure);
          let result = `Total chamber pressure ${pressure} mTorr<br/>`;
          params.forEach((p: any) => {
            if (p.seriesName === 'K_sat (Kc + Kr + Kg)') {
              result += `${p.seriesName}: ${p.value[1].toFixed(1)} W/m²K<br/>`;
              if (idx >= 0) {
                result += `Kg plateau: ${kgPercents[idx].toFixed(0)}%<br/>`;
              }
            } else if (p.seriesName === 'Driving force (P_sub − p_H₂O)') {
              result += `${p.seriesName}: ${p.value[1].toFixed(0)} mTorr<br/>`;
              const pH2OVal = fH2O * pressure;
              result += `Water-vapor partial pressure ${fH2O.toFixed(2)}×${pressure} = ${pH2OVal.toFixed(0)} mTorr`;
            }
          });
          return result;
        },
      },
      xAxis: {
        type: 'value' as const,
        name: 'Total chamber pressure (mTorr)',
        min: 0,
        max: 1600,
        nameLocation: 'middle' as const,
        nameGap: 28,
        axisLine: { lineStyle: { color: theme.border } },
        splitLine: { lineStyle: { color: theme.grid, type: 'dashed' as const } },
        axisLabel: { fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value' as const,
          name: 'K_sat (W/m²K)',
          nameLocation: 'middle' as const,
          nameGap: 40,
          min: 0,
          max: 18,
          axisLine: { lineStyle: { color: theme.border } },
          splitLine: { lineStyle: { color: theme.grid, type: 'dashed' as const } },
          axisLabel: { fontSize: 11 },
        },
        {
          type: 'value' as const,
          name: 'Driving Force (mTorr)',
          nameLocation: 'middle' as const,
          nameGap: 44,
          min: 0,
          max: Math.max(pSub + 200, 3000),
          axisLine: { lineStyle: { color: theme.border } },
          splitLine: { show: false },
          axisLabel: { fontSize: 11 },
        },
      ],
      series: [
        {
          name: 'K_sat (Kc + Kr + Kg)',
          type: 'line' as const,
          smooth: 0.35,
          data: PRESSURES.map((p, i) => [p, kData[i]]),
          lineStyle: { width: 2.5, color: theme.primary },
          itemStyle: { color: theme.primary, borderWidth: 0 },
          symbolSize: 5,
          markLine: {
            data: [{ xAxis: pStar, name: `P* series: ${pStar.toFixed(0)} mTorr` }],
            lineStyle: { color: theme.highlight, type: 'dashed' as const },
            label: { fontSize: 11, position: 'insideTopLeft', offset: [10, 5] },
          },
        },
        {
          name: 'Driving force (P_sub − p_H₂O)',
          type: 'line' as const,
          yAxisIndex: 1,
          smooth: 0.35,
          data: PRESSURES.map((p, i) => [p, drivingData[i]]),
          lineStyle: { width: 2.5, type: 'dashed' as const, color: theme.secondary },
          itemStyle: { color: theme.secondary, borderWidth: 0 },
          symbolSize: 5,
        },
      ],
    };
  }, [isDark, kData, drivingData, pSub, fH2O, kgPercents, pStar, tempF]);

  return (
    <figure className="my-5">
      <div className="bg-[var(--figure-bg)] border border-[var(--border)] rounded-lg p-4">
        <p className="text-xs font-medium text-[var(--text-secondary)] mb-4">
          <span className="font-mono text-[var(--accent)] mr-1">Fig. 3</span>
          Saturating-Family Pressure / Series-Resistance Explorer
        </p>

        {/* Control panel */}
        <ControlPanel>
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
        </ControlPanel>

        {/* Metrics */}
        <div className="flex gap-2 justify-between mt-4 flex-wrap">
          <StatPill label="Product temperature" value={`${(((tempF - 32) * 5) / 9).toFixed(1)}°C`} />
          <StatPill label="Ice saturation pressure" value={`${pSub.toFixed(0)} mTorr`} />
          <StatPill label="Stationary pressure" value={`${pStar.toFixed(0)} mTorr`} accent />
          <StatPill label="Series score" value={`${(seriesAtPStar / 1000).toFixed(1)} scaled`} />
        </div>

        {/* Chart */}
        <div className="mt-4">
          <ResearchChart option={option} style={{ height: '280px', width: '100%' }} opts={{ renderer: 'canvas' }} />
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-[var(--text-muted)] text-center leading-relaxed px-2">
The saturating gas-conduction family combines contact, radiation and molecular gas
         transfer; the flow-associated contribution is omitted because its target-machine
         pressure response is not calibrated. The transfer coefficients remain fixed while
         the assumed water-vapor fraction changes the sublimation driving force. The marked
         stationary pressure follows the normalized series-resistance model at the selected
         resistance ratio. It is a mathematical sensitivity result, not a recommended setpoint.
         Tray heat transfer, wall capture, product resistance and gas composition require
         independent measurements.
      </figcaption>
    </figure>
  );
}
