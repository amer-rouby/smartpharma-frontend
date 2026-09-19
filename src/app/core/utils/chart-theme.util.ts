import { Chart } from 'chart.js';

// Sets Chart.js's global text/grid colors from our design tokens, once,
// so every chart re-themes automatically instead of repeating its own colors.
export function applyChartJsTheme(): void {
  const styles = getComputedStyle(document.body);
  const textColor = styles.getPropertyValue('--color-text-secondary').trim() || '#64748b';
  const gridColor = styles.getPropertyValue('--color-border').trim() || '#e2e8f0';

  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;

  const scaleDefaults = Chart.defaults.scale as unknown as { grid?: { color?: string }; ticks?: { color?: string } };
  scaleDefaults.grid = { ...scaleDefaults.grid, color: gridColor };
  scaleDefaults.ticks = { ...scaleDefaults.ticks, color: textColor };
}
