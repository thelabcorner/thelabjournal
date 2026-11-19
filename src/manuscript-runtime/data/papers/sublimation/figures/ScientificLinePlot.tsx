export type ScientificSeries = {
  readonly name: string;
  readonly color: string;
  readonly values: ReadonlyArray<{ readonly x: number; readonly y: number }>;
  readonly dashed?: boolean;
  readonly thickness?: number;
};
interface ScientificLinePlotProps {
  series: readonly ScientificSeries[];
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  xTicks: readonly number[];
  yTicks: readonly number[];
  xLabel: string;
  yLabel: string;
  description: string;
  markerX?: number;
  markerLabel?: string;
  zeroLine?: boolean;
  xScale?: 'linear' | 'log';
}
/**
 * Mobile-primary scientific coordinates. Fixed plot-space geometry, fluid external
 * width, complete numeric axis labels, no pointer-dependent tooltips. Presentation
 * never interpolates or invents observations: paths connect explicit source/model values.
 */
export function ScientificLinePlot({
  series, xDomain, yDomain, xTicks, yTicks, xLabel, yLabel,
  description, markerX, markerLabel, zeroLine, xScale = 'linear',
}: ScientificLinePlotProps) {
  const left = 43, right = 283, top = 24, bottom = 175;
  const scaleX = (v: number) => xScale === 'log'
    ? left + Math.log(v / xDomain[0]) / Math.log(xDomain[1] / xDomain[0]) * (right - left)
    : left + (v - xDomain[0]) / (xDomain[1] - xDomain[0]) * (right - left);
  const scaleY = (v: number) => bottom - (v - yDomain[0]) / (yDomain[1] - yDomain[0]) * (bottom - top);
  const paths = series.map(item => ({
    ...item,
    path: item.values
      .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
      .map((p, i) => `${i ? 'L' : 'M'}${scaleX(p.x).toFixed(2)} ${scaleY(p.y).toFixed(2)}`)
      .join(' '),
  }));
  const validMarker = Number.isFinite(markerX) && markerX !== undefined
    && markerX >= xDomain[0] && markerX <= xDomain[1];
  return (
    <div className="lyo-mini-science-plot">
      <svg viewBox="0 0 300 228" width="100%" role="img" aria-label={description} preserveAspectRatio="xMidYMid meet">
        <text x="43" y="13" className="lyo-mini-axis-name">{yLabel}</text>
        {yTicks.map(tick => <g key={tick}>
          <line x1={left} x2={right} y1={scaleY(tick)} y2={scaleY(tick)} className="lyo-mini-grid" />
          <text className="lyo-mini-tick" x={left - 9} y={scaleY(tick) + 4} textAnchor="end">{Number.isInteger(tick) ? tick : Number(tick.toFixed(2))}</text>
        </g>)}
        {xTicks.map(tick => <g key={tick}>
          <line x1={scaleX(tick)} x2={scaleX(tick)} y1={top} y2={bottom} className="lyo-mini-grid lyo-mini-grid--vertical"/>
          <text className="lyo-mini-tick" x={scaleX(tick)} y={bottom + 16} textAnchor="middle">{tick}</text>
        </g>)}
        {zeroLine && yDomain[0] < 0 && yDomain[1] > 0 &&
          <line x1={left} x2={right} y1={scaleY(0)} y2={scaleY(0)} className="lyo-mini-zero" />}
        {paths.map(line => <path key={line.name} d={line.path} fill="none"
          stroke={line.color} strokeWidth={line.thickness ?? 2.8} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={line.dashed ? '7 5' : undefined} vectorEffect="non-scaling-stroke" />)}
        {validMarker && <g>
          <line x1={scaleX(markerX!)} x2={scaleX(markerX!)} y1={top} y2={bottom}
            stroke="var(--foreground)" strokeOpacity=".55" strokeWidth="1.2" strokeDasharray="3 4"/>
          <circle cx={scaleX(markerX!)} cy={bottom} r="3" fill="var(--foreground)"/>
          {markerLabel && <text x={Math.max(83, Math.min(250, scaleX(markerX!)))} y="33" textAnchor="middle" className="lyo-mini-marker-label">{markerLabel}</text>}
        </g>}
        <text x={(left + right) / 2} y="218" textAnchor="middle" className="lyo-mini-axis-name">{xLabel}</text>
      </svg>
      <div className="lyo-mini-line-key" aria-label="Chart series">
        {series.map(item => <span key={item.name}>
          <i aria-hidden="true" style={{backgroundColor:item.color}} />{item.name}
        </span>)}
      </div>
    </div>
  );
}
