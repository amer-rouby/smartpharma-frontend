import { Chart } from 'chart.js';

// Chart.js has no idea about this app's --color-* design tokens - left on its
// own defaults, every chart's legend/tick/title text renders in a fixed dark
// gray that's unreadable once dark mode makes the surrounding card dark too.
// Setting Chart.js's *global* defaults here (once, reactively) means every
// report screen's chart re-themes automatically, instead of each chart
// component repeating its own color options.
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
