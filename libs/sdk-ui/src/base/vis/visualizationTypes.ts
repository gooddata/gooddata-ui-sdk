// (C) 2007-2020 GoodData Corporation

/**
 * @internal
 */
export const VisualizationTypes = {
    BAR: "bar" as const,
    COLUMN: "column" as const,
    LINE: "line" as const,
    PIE: "pie" as const,
    DONUT: "donut" as const,
    TABLE: "table" as const,
    HEADLINE: "headline" as const,
    AREA: "area" as const,
    SCATTER: "scatter" as const,
    BUBBLE: "bubble" as const,
    HEATMAP: "heatmap" as const,
    GEO: "geo" as const,
    PUSHPIN: "pushpin" as const,
    COMBO: "combo" as const,
    COMBO2: "combo2" as const,
    HISTOGRAM: "histogram" as const,
    BULLET: "bullet" as const,
    TREEMAP: "treemap" as const,
    WATERFALL: "waterfall" as const,
    FUNNEL: "funnel" as const,
    PARETO: "pareto" as const,
    ALLUVIAL: "alluvial" as const,
    XIRR: "xirr" as const,
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
