// (C) 2026 GoodData Corporation

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { getDataLabelsGdcVisible } from "../../../chartTypes/_chartCreators/dataLabelsHelpers.js";
import { getChartType } from "../../../chartTypes/_chartCreators/helpers.js";

/**
 * The narrowest slot (in pixels) that could still hold a data label.
 *
 * A label box is never narrower than a single character plus its padding, which measures ~9.8px at
 * our default label font. Measured on a 600px wide column chart with single character labels: all
 * labels are still shown at 11.6px per point and all of them are hidden at 8.7px per point. The
 * bound is set below that range so short labels keep the behaviour they have today, and so a theme
 * with a smaller label font still errs on the side of drawing.
 */
const MIN_DATA_LABEL_SLOT = 8;

/**
 * Chart types whose 'auto' label hiding is all-or-nothing per series: as soon as one pair of
 * neighbouring labels (or a label and its column) overlaps, autohideColumnLabels/autohideBarLabels
 * hide every label of the chart.
 */
const ALL_OR_NOTHING_LABEL_TYPES: (string | undefined)[] = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.WATERFALL,
];

const isAllOrNothingType = (type: string | undefined): boolean => ALL_OR_NOTHING_LABEL_TYPES.includes(type);

/**
 * Decides whether the series has any chance of showing a data label.
 *
 * Only 'auto' visibility is considered: with labels explicitly turned on the user asked for them
 * to be drawn regardless of overlaps.
 */
function hasSpaceForDataLabels(series: any): boolean {
    const chart = series?.chart;

    if (!chart || getDataLabelsGdcVisible(chart) !== "auto") {
        return true;
    }

    const chartType = getChartType(chart);
    // The chart type picks the auto-hide rule, but the rule measures every series of the chart, and
    // in a combo chart the two differ: a column + line combo reports 'column' (getDefaultChartType),
    // while its line labels can stay visible because they are not bound to a column's width. Leave
    // such mixed charts to the existing path — in both directions, since dropping the column labels
    // early would also stop autohideColumnLabels from finding the overlap that hides the line ones.
    const seriesTypes = (chart.series ?? []).map((chartSeries: any) => chartSeries?.type ?? chartType);
    if (![chartType, ...seriesTypes].every(isAllOrNothingType)) {
        return true;
    }

    // null points get no label, so they widen the gap between the labels that are drawn
    const labelledPoints = (series.points ?? []).filter((point: any) => point && !point.isNull).length;
    // bar charts are inverted: their labels are laid out along the vertical axis
    const axisLength = chart.inverted ? chart.plotHeight : chart.plotWidth;

    if (!labelledPoints || !axisLength) {
        return true;
    }

    return axisLength / labelledPoints >= MIN_DATA_LABEL_SLOT;
}

function destroyDataLabels(series: any): void {
    (series.points ?? []).forEach((point: any) => {
        (point.dataLabels ?? []).forEach((dataLabel: any) => dataLabel?.destroy?.());
        if (point.dataLabels) {
            point.dataLabels.length = 0;
        }
        point.dataLabel = undefined;
    });
}

/**
 * Skips drawing data labels that cannot be displayed anyway.
 *
 * Highcharts draws every data label before anything gets a chance to hide it, and each label costs
 * a forced style recalculation in the highcharts text builder (it reads the computed font size to
 * measure the text). On charts with many data points that adds up to seconds of blocked main
 * thread, all of it spent on labels that the 'auto' hiding rules then hide.
 */
export function skipDataLabelsWithoutSpace(Highcharts: any): void {
    Highcharts.wrap(
        Highcharts.Series.prototype,
        "drawDataLabels",
        function (this: any, proceed: any, ...args: any[]) {
            if (!hasSpaceForDataLabels(this)) {
                // labels drawn by a previous, roomier render would otherwise stay behind
                destroyDataLabels(this);
                return;
            }

            proceed.apply(this, args);
        },
    );
}
