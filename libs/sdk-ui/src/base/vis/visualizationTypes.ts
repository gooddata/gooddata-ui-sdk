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
    PUSHPIN: "pushpin" as "pushpin",
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
    | "pushpin"
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
export type VisType = ChartType | HeadlineType | TableType | XirrType;

export type ChartElementType =
    | "slice"
    | "bar"
    | "point"
    | "label"
    | "cell" // 'cell' for heatmap
    | "target"
    | "primary"
    | "comparative";
export type HeadlineElementType = "primaryValue" | "secondaryValue";
export type TableElementType = "cell";
export type VisElementType = ChartElementType | HeadlineElementType | TableElementType | "pushpin";

export type VisualizationEnvironment = "none" | "dashboards";

export function getVisualizationType(type: ChartType): ChartType {
    if (type === VisualizationTypes.COMBO2) {
        return VisualizationTypes.COMBO;
    }

    return type;
}
