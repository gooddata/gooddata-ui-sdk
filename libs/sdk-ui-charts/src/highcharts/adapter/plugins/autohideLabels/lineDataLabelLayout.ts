// (C) 2026 GoodData Corporation

/**
 * Text box of a data label in the coordinates Highcharts uses to detect overlaps
 * (Chart.hideOverlappingLabels, getAbsoluteBox).
 */
export interface ILabelBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ILabelBoxInput {
    plotX: number;
    plotY: number;
    /** Text width and height, without padding. */
    textWidth: number;
    textHeight: number;
    padding: number;
    /** Label options x and y offsets. */
    x: number;
    y: number;
    verticalAlign: "top" | "middle" | "bottom";
    plotWidth: number;
    plotHeight: number;
    /** Position of the series axes against the plot area (Highcharts horizontalAxisShift and verticalAxisShift). */
    horizontalAxisShift: number;
    verticalAxisShift: number;
    /** Translation of the data labels group. */
    translateX: number;
    translateY: number;
}

const VERTICAL_ALIGN_FACTOR = { top: 0, middle: 0.5, bottom: 1 };

/**
 * Predicts the box of a center aligned, unrotated data label without a background box, as
 * Highcharts places it in Series.alignDataLabel and justifyDataLabel.
 */
export function predictLabelBox(input: ILabelBoxInput): ILabelBox {
    const { plotX, padding, plotWidth, plotHeight, horizontalAxisShift, verticalAxisShift } = input;
    const plotY = Math.round(input.plotY);
    const width = input.textWidth + 2 * padding;
    const height = input.textHeight + 2 * padding;

    const alignX = (x: number) => Math.round(plotX + x - width / 2);
    const alignY = (y: number, verticalAlign: ILabelBoxInput["verticalAlign"]) =>
        Math.round(plotY + y - height * VERTICAL_ALIGN_FACTOR[verticalAlign]);

    // justifyDataLabel: every check reads the first alignment and the original vertical align
    const alignedX = alignX(input.x);
    const alignedY = alignY(input.y, input.verticalAlign);
    let { x, y, verticalAlign } = input;

    const offLeft = alignedX + padding + horizontalAxisShift;
    if (offLeft < 0) {
        x -= offLeft;
    }
    const offRight = alignedX + width - padding + horizontalAxisShift;
    if (offRight > plotWidth) {
        x += plotWidth - offRight;
    }
    const offTop = alignedY + padding + verticalAxisShift;
    if (offTop < 0) {
        if (input.verticalAlign === "bottom" && input.y >= 0) {
            verticalAlign = "top";
        } else {
            y -= offTop;
        }
    }
    const offBottom = alignedY + height - padding + verticalAxisShift;
    if (offBottom > plotHeight) {
        if (input.verticalAlign === "top" && input.y <= 0) {
            verticalAlign = "bottom";
        } else {
            y += plotHeight - offBottom;
        }
    }

    return {
        x: alignX(x) + input.translateX + padding,
        y: alignY(y, verticalAlign) + input.translateY + padding,
        width: input.textWidth,
        height: input.textHeight,
    };
}

/** Same test as Highcharts' isIntersectRect in hideOverlappingLabels. */
export function areBoxesIntersecting(a: ILabelBox, b: ILabelBox): boolean {
    return !(b.x >= a.x + a.width || b.x + b.width <= a.x || b.y >= a.y + a.height || b.y + b.height <= a.y);
}

export interface IChartTextMetrics {
    canvas: CanvasRenderingContext2D;
    rootFontSize: number;
    fontFamily: string;
    textHeights: Map<string, number>;
}

const textMetrics = new WeakMap<any, IChartTextMetrics | null>();

const FONT_SIZE = /^(\d+(?:\.\d+)?)(px|em)$/;

export function getTextMetrics(chart: any): IChartTextMetrics | null {
    if (!textMetrics.has(chart)) {
        const root = chart.renderer?.box;
        const canvas =
            typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
        if (!root?.isConnected || !canvas) {
            textMetrics.set(chart, null);
        } else {
            // one style read per chart; the data labels inherit the font of the svg root
            const style = window.getComputedStyle(root);
            textMetrics.set(chart, {
                canvas,
                rootFontSize: parseFloat(style.getPropertyValue("font-size")),
                fontFamily: style.getPropertyValue("font-family"),
                textHeights: new Map(),
            });
        }
    }
    return textMetrics.get(chart) ?? null;
}

export function resolveFontSize(fontSize: unknown, rootFontSize: number): number | undefined {
    const match = FONT_SIZE.exec(String(fontSize ?? ""));
    if (!match || Number.isNaN(rootFontSize)) {
        return undefined;
    }
    const value = parseFloat(match[1]);
    return match[2] === "px" ? value : value * rootFontSize;
}

/** Height of a single line text box; it does not depend on the text, so one probe per font is enough. */
export function getTextHeight(
    chart: any,
    metrics: IChartTextMetrics,
    fontSize: number,
    fontWeight: string,
): number {
    const key = `${fontSize}|${fontWeight}`;
    let height = metrics.textHeights.get(key);
    if (height === undefined) {
        const probe = chart.renderer
            .text("0", 0, 0)
            .css({ fontSize: `${fontSize}px`, fontWeight })
            .add();
        height = probe.getBBox().height as number;
        probe.destroy();
        metrics.textHeights.set(key, height);
    }
    return height;
}

/** Forgets the measured fonts of the chart, for example after a web font loaded. */
export function resetTextMetrics(chart: any): void {
    textMetrics.delete(chart);
}

/**
 * Label options the box model reproduces: a center aligned, unrotated SVG label without a box,
 * justified into the plot area. Visibility options (enabled, allowOverlap) are not checked here.
 */
export function isSupportedLabelPlacement(options: any): boolean {
    return (
        options &&
        !Array.isArray(options) &&
        (options.align ?? "center") === "center" &&
        ["top", "middle", "bottom", undefined].includes(options.verticalAlign) &&
        !options.rotation &&
        !options.useHTML &&
        !options.inside &&
        !options.shape &&
        !options.backgroundColor &&
        !options.borderWidth &&
        (options.overflow ?? "justify") === "justify" &&
        options.format === undefined &&
        options.filter === undefined &&
        options.labelrank === undefined &&
        options.alignTo === undefined &&
        options.style?.width === undefined &&
        options.style?.textOverflow === undefined
    );
}

/**
 * hideOverlappingLabels compares the labels of the label collectors (plot lines and bands) and
 * the stack labels before the data labels, so they could hide data labels.
 */
export function hasOtherOverlappingLabels(chart: any): boolean {
    const hasCollectedLabels = (chart.labelCollectors ?? []).some(
        (collect: () => unknown[]) => collect().length > 0,
    );
    const hasStackLabels = (chart.yAxis ?? []).some((axis: any) =>
        Object.values(axis.stacking?.stacks ?? {}).some((stack: any) =>
            Object.values(stack ?? {}).some((item: any) => item?.label),
        ),
    );
    return hasCollectedLabels || hasStackLabels;
}

/** Whether hideOverlappingLabels collects the data labels of the series. */
export function isLabelledSeries(series: any): boolean {
    return Boolean(series?.visible && series.hasDataLabels?.());
}

/** Series with data labels, in the order hideOverlappingLabels collects their labels. */
export function getLabelledSeries(chart: any): any[] {
    return (chart.series ?? []).filter(isLabelledSeries);
}

/**
 * Width of the SVG text box (getBBox) for text measured on a canvas. SVG text is laid out in
 * 1/64 px units, and the box also contains glyph ink that is outside of the advance width,
 * for example the right edge of the last glyph in some bold fonts.
 */
export function getSvgTextWidth(metrics: TextMetrics): number {
    const advance = Math.ceil(metrics.width * 64) / 64;
    return (
        Math.max(advance, metrics.actualBoundingBoxRight ?? 0) +
        Math.max(0, metrics.actualBoundingBoxLeft ?? 0)
    );
}

/**
 * Predicts the text box of the point's data label. The text width is the SVG text box width
 * (see getSvgTextWidth).
 */
export function predictPointLabelBox(
    series: any,
    point: any,
    labelOptions: any,
    textWidth: number,
    textHeight: number,
): ILabelBox {
    const { chart } = series;
    return predictLabelBox({
        plotX: point.plotX,
        plotY: point.plotY,
        textWidth,
        textHeight,
        padding: labelOptions.padding ?? 0,
        x: labelOptions.x ?? 0,
        y: labelOptions.y ?? 0,
        verticalAlign: labelOptions.verticalAlign ?? "bottom",
        plotWidth: chart.plotWidth,
        plotHeight: chart.plotHeight,
        horizontalAxisShift: (series.xAxis?.left ?? chart.plotLeft) - chart.plotLeft,
        verticalAxisShift: (series.yAxis?.top ?? chart.plotTop) - chart.plotTop,
        translateX: series.xAxis?.left ?? chart.plotLeft,
        translateY: series.yAxis?.top ?? chart.plotTop,
    });
}

/** Highcharts hides the labels of points outside of the plot area (Series.alignDataLabel). */
export function isPointInsidePlot(series: any, point: any): boolean {
    const { plotX, plotY } = point;
    return (
        plotX !== undefined &&
        plotY !== undefined &&
        series.chart.isInsidePlot(plotX, Math.round(plotY), { paneCoordinates: true, series })
    );
}
