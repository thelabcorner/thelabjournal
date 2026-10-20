import { useEffect, useMemo, useState } from 'react';
import EChartsReactCore from 'echarts-for-react/lib/core';
import type { EChartsReactProps } from 'echarts-for-react/lib/types';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  BarChart,
  AriaComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  CanvasRenderer,
]);

type ResearchChartProps = Omit<EChartsReactProps, 'echarts'>;

export function ResearchChart(props: ResearchChartProps) {
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    setReduceMotion(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const option = useMemo(() => {
    if (!reduceMotion || !props.option || typeof props.option !== 'object') return props.option;
    return {
      ...props.option,
      animation: false,
      animationDuration: 0,
      animationDurationUpdate: 0,
    };
  }, [props.option, reduceMotion]);

  return <EChartsReactCore echarts={echarts} {...props} option={option} />;
}
