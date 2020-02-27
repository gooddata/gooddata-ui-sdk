// (C) 2007-2020 GoodData Corporation

/**
 * @internal
 */
export const VisualizationTypes = {
    BAR: "bar" as "bar",
    COLUMN: "column" as "column",
    LINE: "line" as "line",
    PIE: "pie" as "pie",
    DONUT: "donut" as "donut",
    TABLE: "table" as "table",
    HEADLINE: "headline" as "headline",
    AREA: "area" as "area",
    SCATTER: "scatter" as "scatter",
    BUBBLE: "bubble" as "bubble",
    HEATMAP: "heatmap" as "heatmap",
    GEO: "geo" as "geo",
    COMBO: "combo" as "combo",
    COMBO2: "combo2" as "combo2",
    HISTOGRAM: "histogram" as "histogram",
    BULLET: "bullet" as "bullet",
    TREEMAP: "treemap" as "treemap",
    WATERFALL: "waterfall" as "waterfall",
    FUNNEL: "funnel" as "funnel",
    PARETO: "pareto" as "pareto",
    ALLUVIAL: "alluvial" as "alluvial",
    XIRR: "xirr" as "xirr",
};

/**
 * @internal
 */
export type ChartType =
    | "bar"
    | "column"
    | "pie"
    | "line"
    | "area"
    | "donut"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "geo"
    | "combo"
    | "combo2"
    | "histogram"
    | "bullet"
    | "treemap"
    | "waterfall"
    | "funnel"
    | "pareto"
    | "alluvial";

export type HeadlineType = "headline";
export type XirrType = "xirr";
export type TableType = "table";

/**
 * @public
 */
export type VisType = ChartType | HeadlineType | TableType | XirrType;

/**
 * @internal
 */
export type ChartElementType = "slice" | "bar" | "point" | "label" | "cell"; // 'cell' for heatmap

/**
 * @internal
 */
export type HeadlineElementType = "primaryValue" | "secondaryValue";

/**
 * @internal
 */
export type TableElementType = "cell";

/**
 * @public
 */
export type VisElementType = ChartElementType | HeadlineElementType | TableElementType;

/**
 * @internal
 */
export type VisualizationEnvironment = "none" | "dashboards";

/**
 * @internal
 */
export function getVisualizationType(type: ChartType): ChartType {
    if (type === VisualizationTypes.COMBO2) {
        return VisualizationTypes.COMBO;
    }

    return type;
}
