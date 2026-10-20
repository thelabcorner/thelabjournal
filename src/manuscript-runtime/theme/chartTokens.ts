export interface ChartTokens {
  text: string;
  border: string;
  grid: string;
  primary: string;
  secondary: string;
  highlight: string;
  radiation: string;
  contact: string;
  gas: string;
  flow: string;
}

const LIGHT_CHART_TOKENS: ChartTokens = {
  text: '#52525b',
  border: '#e4e4e7',
  grid: '#f4f4f5',
  primary: '#4b7596',
  secondary: '#648f80',
  highlight: '#b88b50',
  radiation: '#ba7670',
  contact: '#b88b50',
  gas: '#4b7596',
  flow: '#648f80',
};

const DARK_CHART_TOKENS: ChartTokens = {
  text: '#a1a1aa',
  border: '#3f3f46',
  grid: '#27272a',
  primary: '#91b8d8',
  secondary: '#8bbba5',
  highlight: '#d8b27e',
  radiation: '#dda09a',
  contact: '#d8b27e',
  gas: '#91b8d8',
  flow: '#8bbba5',
};

export function getChartTokens(isDark: boolean): ChartTokens {
  return isDark ? DARK_CHART_TOKENS : LIGHT_CHART_TOKENS;
}
