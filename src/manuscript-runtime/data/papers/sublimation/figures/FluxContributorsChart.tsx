import { useMemo } from 'react';
import { ResearchChart } from '../../../../components/charts/ResearchChart';
import { Callout } from '../../../../components/prose/Callout';
import { InlineMath } from '../ScientificMath';
import { getChartTokens } from '../../../../theme/chartTokens';
import { RECONSTRUCTED_GANGULY_DATA as DATA } from './gangulyContributionModel';

interface FluxContributorsChartProps {
  isDark?: boolean;
}

/**
 * All bars are a reconstructed model interpolation from archived research
 * anchors, NOT digitized experimental percentages.
 */

export function FluxContributorsChart({ isDark = false }: FluxContributorsChartProps) {
  const option = useMemo(() => {
    const theme = getChartTokens(isDark);

    return {
      animation: false,
      backgroundColor: 'transparent',
      aria: {
        enabled: true,
        description: 'Modeled heat-transfer pathway percentages between 10 and 100 millitorr from explicitly stated archived anchors and assumptions, not digitized experimental measurements.',
      },
      grid: { top: 22, right: 26, bottom: 52, left: 62 },
      legend: {
        bottom: 4,
        textStyle: { color: theme.text, fontSize: 11 },
        data: ['Radiation', 'Contact', 'Gas conduction', 'Flow-associated'],
      },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const idx = params[0].dataIndex;
          const d = DATA[idx];
          const total = d.radiation + d.contact + d.gas + d.flow;
          return [
            `<strong>P_total = ${d.pressure} mTorr</strong>`,
            `Radiation: <strong>${d.radiation.toFixed(1)}%</strong>`,
            `Contact: <strong>${d.contact.toFixed(1)}%</strong>`,
            `Gas conduction: <strong>${d.gas.toFixed(1)}%</strong>`,
            `Flow-associated: <strong>${d.flow.toFixed(1)}%</strong>`,
            `<span style="font-size:11px;color:${theme.text}">Modeled contribution total: ${total.toFixed(1)}%</span>`,
          ].join('<br/>');
        },
      },
      xAxis: {
        type: 'category' as const,
        data: DATA.map((d) => `${d.pressure}`),
        name: 'Chamber Pressure P_total (mTorr)',
        nameLocation: 'middle' as const,
        nameGap: 30,
        axisLine: { lineStyle: { color: theme.border } },
        axisLabel: { fontSize: 11, color: theme.text },
        nameTextStyle: { fontSize: 11, color: theme.text },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Reconstructed heat-transfer share (%)',
        nameLocation: 'middle' as const,
        nameGap: 45,
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: theme.border } },
        splitLine: { lineStyle: { color: theme.grid, type: 'dashed' as const } },
        axisLabel: { fontSize: 11, color: theme.text },
        nameTextStyle: { fontSize: 11, color: theme.text },
      },
      series: [
        {
          name: 'Radiation',
          type: 'bar' as const,
          stack: 'share',
          itemStyle: { color: theme.radiation },
          data: DATA.map((d) => d.radiation),
        },
        {
          name: 'Contact',
          type: 'bar' as const,
          stack: 'share',
          itemStyle: { color: theme.contact },
          data: DATA.map((d) => d.contact),
        },
        {
          name: 'Gas conduction',
          type: 'bar' as const,
          stack: 'share',
          itemStyle: { color: theme.gas },
          data: DATA.map((d) => d.gas),
        },
        {
          name: 'Flow-associated',
          type: 'bar' as const,
          stack: 'share',
          itemStyle: { color: theme.flow },
          data: DATA.map((d) => d.flow),
        },
      ],
    };
  }, [isDark]);

  return (
    <div className="space-y-3">
      <figure className="my-5">
        <div className="bg-[var(--figure-bg)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">
            <span className="font-mono text-[var(--accent)] mr-1">Fig. 2</span>
            Illustrative four-path decomposition reconstructed from archived Ganguly research anchors.
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Modeled interpolation from 10 to 100 mTorr. The bars are not independently digitized experimental results.
          </p>
          <ResearchChart option={option} style={{ height: '320px', width: '100%' }} opts={{ renderer: 'canvas' }} />
        </div>
        <figcaption className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed px-2 space-y-1">
          <p>
            The reconstruction keeps absolute radiation and contact contributions fixed while
            interpolating pressure-responsive gas and flow terms. Their combined modeled share
            increases from 14% at 10 mTorr to 44% at the 100 mTorr anchor.
          </p>
          <p>
            The approximate endpoints come from the September research notes, not independently
            digitized measurements. Intermediate percentages are calculated rather than measured.
            Ganguly described the fourth contribution as convection in vial geometry; here it is
            treated as the flow-associated coefficient <InlineMath math="K_f" /> without assuming
            that the same transport mechanism applies to the Harvest Right chamber.
          </p>
        </figcaption>
      </figure>

      <Callout
        type="info"
        title="Limits of this reconstruction"
        body="The source research records approximate contribution anchors at 10 and 100 mTorr. This figure interpolates between them and does not present those percentages as direct measurements. Ganguly also tested higher pressures, but a quantitative pathway-share curve above 100 mTorr is not supported by the verified anchor data available here. Independent digitization or machine measurements would be needed before extending the figure."
      />
    </div>
  );
}
