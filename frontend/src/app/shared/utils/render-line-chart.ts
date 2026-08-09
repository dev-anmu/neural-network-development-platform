import embed from 'vega-embed';
import {XY} from '../../core/interfaces/interfaces';
import {
  buildLineChartOptions,
  getResponsivePlotWidth,
  plotSeriesColors,
} from './tfvis-theme';

export interface LineChartRenderOptions {
  xLabel: string;
  yLabel: string;
  width?: number;
  seriesColors?: string[];
}

/** Line chart without in-plot legend (custom legend is shown in the card header). */
export async function renderLineChart(
  container: HTMLElement,
  values: XY[][],
  series: string[],
  options: LineChartRenderOptions,
): Promise<void> {
  if (values.length === 0 || series.length === 0 || values[0].length === 0) {
    return;
  }

  const chartOptions = buildLineChartOptions(container, {
    width: options.width,
    xLabel: options.xLabel,
    yLabel: options.yLabel,
    seriesColors: options.seriesColors ?? plotSeriesColors(values.length),
  });
  const seriesColors = chartOptions.seriesColors ?? plotSeriesColors(values.length);
  const numValues = values[0].length;

  const vlChartValues: Record<string, number | string>[] = [];
  for (let valueIdx = 0; valueIdx < numValues; valueIdx++) {
    const row: Record<string, number | string> = {
      x: values[0][valueIdx]?.x ?? valueIdx,
    };
    series.forEach((seriesName, seriesIdx) => {
      row[seriesName] = values[seriesIdx][valueIdx].y;
      row[`${seriesName}-name`] = seriesName;
    });
    vlChartValues.push(row);
  }

  const yScale = chartOptions.zoomToFit ? {zero: false} : undefined;

  const lineLayers = series.map((seriesName) => ({
    mark: {type: 'line' as const, clip: true},
    encoding: {
      y: {
        field: seriesName,
        type: 'quantitative' as const,
        title: chartOptions.yLabel,
        scale: yScale,
      },
      color: {
        field: `${seriesName}-name`,
        type: 'nominal' as const,
        legend: null,
        scale: {
          range: seriesColors,
        },
      },
    },
  }));

  const spec = {
    width: chartOptions.width ?? getResponsivePlotWidth(container),
    height: chartOptions.height,
    padding: 0,
    autosize: {
      type: 'fit' as const,
      contains: 'padding' as const,
      resize: true,
    },
    config: {
      axis: {
        labelFontSize: chartOptions.fontSize,
        titleFontSize: chartOptions.fontSize,
      },
      text: {fontSize: chartOptions.fontSize},
      legend: {disable: true},
    },
    data: {values: vlChartValues},
    encoding: {
      x: {
        field: 'x',
        type: 'quantitative' as const,
        title: chartOptions.xLabel,
      },
      tooltip: [
        {field: 'x', type: 'quantitative' as const},
        ...series.map((seriesName) => ({
          field: seriesName,
          type: 'quantitative' as const,
        })),
      ],
    },
    layer: [
      ...lineLayers,
      {
        mark: 'rule' as const,
        selection: {
          hover: {
            type: 'single' as const,
            on: 'mouseover',
            nearest: true,
            clear: 'mouseout',
          },
        },
        encoding: {
          color: {
            value: 'grey',
            condition: {
              selection: {not: 'hover'},
              value: 'transparent',
            },
          },
        },
      },
    ],
  };

  await embed(container, spec, {
    actions: false,
    mode: 'vega-lite',
    defaultStyle: false,
  });
}
