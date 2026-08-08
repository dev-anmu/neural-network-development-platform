import {XYPlotOptions} from '@tensorflow/tfjs-vis/dist/types';

/** Brand-aligned colors for chart series (training, validation, …). */
export const PLOT_SERIES_COLORS = ['#5b5bd6', '#0891b2', '#7c3aed', '#059669'] as const;

export const PLOT_SERIES_LABELS = ['Training', 'Validation'] as const;

const DEFAULT_PLOT_HEIGHT = 260;
const AXIS_LABEL_COLOR = '#64748b';
const GRID_COLOR = '#e2e8f4';

export function plotSeriesColors(seriesCount: number): string[] {
  return PLOT_SERIES_COLORS.slice(0, Math.max(seriesCount, 1));
}

export function getResponsivePlotWidth(container: HTMLElement, padding = 16): number {
  const hostWidth = container.clientWidth;
  if (hostWidth > 0) {
    return Math.max(240, Math.floor(hostWidth - padding));
  }

  let el: HTMLElement | null = container.parentElement;
  let width = 0;

  while (el) {
    if (el.clientWidth > width) {
      width = el.clientWidth;
    }
    el = el.parentElement;
  }

  return Math.max(240, Math.floor(width - padding));
}

export function buildLineChartOptions(
  container: HTMLElement,
  overrides: Partial<XYPlotOptions> = {},
): XYPlotOptions {
  return {
    width: getResponsivePlotWidth(container),
    height: DEFAULT_PLOT_HEIGHT,
    fontSize: 11,
    zoomToFit: true,
    ...overrides,
  };
}

/** Prepare a DOM node before tfjs-vis renders into it. */
export function preparePlotContainer(container: HTMLElement): void {
  container.innerHTML = '';
  container.classList.add('chart-host');
}

/** Tweak Vega SVG output to match app typography and hide duplicate legends. */
export function polishVegaChart(container: HTMLElement): void {
  const hideLegend = !!container.closest('.chart-card');

  container.querySelectorAll('.vega-embed svg').forEach((svg) => {
    svg.querySelectorAll('text').forEach((label) => {
      label.setAttribute('fill', AXIS_LABEL_COLOR);
      label.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    });

    svg.querySelectorAll('line').forEach((line) => {
      const stroke = line.getAttribute('stroke');
      if (stroke === '#ddd' || stroke === '#888' || stroke === '#ccc') {
        line.setAttribute('stroke', GRID_COLOR);
      }
    });

    if (hideLegend) {
      hideVegaLegends(svg);
      const svgEl = svg as SVGElement;
      svgEl.style.width = '100%';
      svgEl.style.maxWidth = '100%';
      svgEl.style.height = 'auto';
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  });

  container.querySelectorAll('.vega-embed').forEach((embed) => {
    (embed as HTMLElement).style.width = '100%';
    (embed as HTMLElement).style.maxWidth = '100%';
    (embed as HTMLElement).style.overflow = 'hidden';
  });
}

function hideVegaLegends(svg: Element): void {
  const legendLabels = new Set(['training', 'validation']);

  svg.querySelectorAll('g').forEach((group) => {
    const ariaLabel = group.getAttribute('aria-label')?.toLowerCase() ?? '';
    const className = group.getAttribute('class') ?? '';
    if (ariaLabel.includes('legend') || className.includes('legend') || className.includes('role-legend')) {
      (group as SVGElement).style.display = 'none';
    }
  });

  // Fallback: hide groups that only contain series label text (Vega legend entries).
  svg.querySelectorAll('g').forEach((group) => {
    const texts = Array.from(group.querySelectorAll('text'))
      .map((node) => node.textContent?.trim().toLowerCase() ?? '')
      .filter(Boolean);
    if (texts.length > 0 && texts.every((text) => legendLabels.has(text))) {
      (group as SVGElement).style.display = 'none';
    }
  });
}

/** Style tables rendered by tfjs-vis model summary. */
export function styleTfvisTable(container: HTMLElement): void {
  const table = container.querySelector('table');
  if (table) {
    table.classList.add('tfvis-data-table');
    table.style.margin = '0';
    table.style.width = '100%';
  }
}
