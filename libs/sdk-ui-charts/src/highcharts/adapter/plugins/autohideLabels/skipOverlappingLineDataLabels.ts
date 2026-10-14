// (C) 2026 GoodData Corporation

import {
    type ILabelBox,
    areBoxesIntersecting,
    getLabelledSeries,
    getSvgTextWidth,
    getTextHeight,
    getTextMetrics,
    hasOtherOverlappingLabels,
    isLabelledSeries,
    isPointInsidePlot,
    isSupportedLabelPlacement,
    predictPointLabelBox,
    resolveFontSize,
} from "./lineDataLabelLayout.js";

/**
 * State of one render pass of a chart: the labels predicted to stay visible, in the order in
 * which hideOverlappingLabels processes them.
 */
interface IRenderPass {
    enabled: boolean;
    /** Series with data labels, in the order hideOverlappingLabels collects their labels. */
    series: any[];
    nextSeries: number;
    boxes: ILabelBox[];
}

const passes = new WeakMap<any, IRenderPass>();
/** Charts that had labels skipped: their next redraw must draw the labels of every series again. */
const chartsWithSkippedLabels = new WeakSet<any>();

// whitespace that SVG collapses but canvas measures, and markup that Highcharts parses
const UNMEASURABLE_TEXT = /^\s|\s$|\s\s|[<&]/;

function isSupportedLabelOptions(options: any): boolean {
    return options?.enabled !== false && !options?.allowOverlap && isSupportedLabelPlacement(options);
}

function isSupportedSeries(series: any): boolean {
    return (
        series.type === "line" &&
        !series.options?.stacking &&
        !series.options?.dataSorting?.enabled &&
        isSupportedLabelOptions(series.options?.dataLabels)
    );
}

function createRenderPass(chart: any): IRenderPass {
    const series = getLabelledSeries(chart);
    const enabled =
        chart.options?.chart?.type === "line" &&
        !chart.inverted &&
        !chart.polar &&
        !chart.styledMode &&
        series.length > 0 &&
        series.every(isSupportedSeries) &&
        !hasOtherOverlappingLabels(chart);
    return { enabled, series, nextSeries: 0, boxes: [] };
}

/**
 * Decides whether the label of the point can be visible, given the labels before it.
 * Returns undefined when the label cannot be predicted; the rest of the pass then draws all labels.
 */
function predictVisibility(
    pass: IRenderPass,
    series: any,
    point: any,
    labelOptions: any,
    text: unknown,
): boolean | undefined {
    const { chart } = series;
    if (
        typeof text !== "string" ||
        UNMEASURABLE_TEXT.test(text) ||
        point.options?.dataLabels ||
        point.dlOptions ||
        point.labelrank !== undefined ||
        !isSupportedLabelOptions(labelOptions)
    ) {
        return undefined;
    }

    const metrics = getTextMetrics(chart);
    if (!metrics) {
        return undefined;
    }
    const fontSize = resolveFontSize(labelOptions.style?.fontSize, metrics.rootFontSize);
    if (fontSize === undefined) {
        return undefined;
    }

    // labels of points outside of the plot area are hidden; they take no part in overlapping
    if (!isPointInsidePlot(series, point)) {
        return true;
    }

    const fontWeight = String(labelOptions.style?.fontWeight ?? "normal");
    metrics.canvas.font = `${fontWeight} ${fontSize}px ${metrics.fontFamily}`;
    const box = predictPointLabelBox(
        series,
        point,
        labelOptions,
        getSvgTextWidth(metrics.canvas.measureText(text)),
        getTextHeight(chart, metrics, fontSize, fontWeight),
    );

    if (pass.boxes.some((kept) => areBoxesIntersecting(kept, box))) {
        return false;
    }
    pass.boxes.push(box);
    return true;
}

/**
 * Skips creating line chart data labels that Highcharts would hide as overlapping.
 *
 * With 'auto' data labels Highcharts creates a label for every point and then hides the ones that
 * overlap a label before them (Chart.hideOverlappingLabels). On dense line charts most labels end
 * up hidden, and creating them is most of the render time.
 *
 * The plugin runs the same overlap test before the labels are created. Label boxes are predicted
 * from the point position and the text width measured on a canvas, which does not touch the
 * layout. A label is skipped only when it overlaps a label that is predicted to stay visible.
 * Highcharts still runs its own overlap test on the created labels.
 *
 * Only plain line charts are handled. When anything in a render pass cannot be predicted, the
 * rest of the pass draws all labels, as before.
 */
export function skipOverlappingLineDataLabels(Highcharts: any): void {
    Highcharts.wrap(
        Highcharts.Series.prototype,
        "drawDataLabels",
        function (this: any, proceed: any, ...args: any[]) {
            // series not collected by hideOverlappingLabels take no part in the pass or its series order
            if (!isLabelledSeries(this)) {
                return proceed.apply(this, args);
            }

            const chart = this.chart;
            let pass = passes.get(chart);
            if (!pass) {
                pass = createRenderPass(chart);
                passes.set(chart, pass);
            }

            const [points] = args;
            const isNextSeries = pass.series[pass.nextSeries] === this;
            if (isNextSeries) {
                pass.nextSeries++;
            }
            // the labels must be predicted series by series, from the first one, for all points
            if (!pass.enabled || !isNextSeries || (points && points !== this.points)) {
                pass.enabled = false;
                return proceed.apply(this, args);
            }

            const dataLabelsOptions = this.options.dataLabels;
            const formatter = dataLabelsOptions.formatter;
            const currentPass = pass;
            // "this" is the point
            dataLabelsOptions.formatter = function (this: any, labelOptions: any) {
                const text = formatter.call(this, labelOptions);
                if (!currentPass.enabled) {
                    return text;
                }
                const visible = predictVisibility(currentPass, this.series, this, labelOptions, text);
                if (visible === undefined) {
                    currentPass.enabled = false;
                    return text;
                }
                if (!visible) {
                    chartsWithSkippedLabels.add(chart);
                    return undefined;
                }
                return text;
            };
            try {
                return proceed.apply(this, args);
            } finally {
                dataLabelsOptions.formatter = formatter;
            }
        },
    );

    Highcharts.wrap(Highcharts.Chart.prototype, "redraw", function (this: any, proceed: any, ...args: any[]) {
        // Labels of a series that is not redrawn are not updated. A skipped label must appear
        // when the labels before it change, so redraw the labels of all series.
        if (chartsWithSkippedLabels.has(this)) {
            chartsWithSkippedLabels.delete(this);
            (this.series ?? []).forEach((series: any) => {
                if (isLabelledSeries(series)) {
                    series.isDirty = true;
                }
            });
        }
        return proceed.apply(this, args);
    });

    // every render and redraw ends with the render event; the next one starts a new pass
    Highcharts.addEvent(Highcharts.Chart, "render", function (this: any) {
        passes.delete(this);
    });
}
