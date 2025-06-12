// (C) 2007-2024 GoodData Corporation

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
    PYRAMID: "pyramid" as const,
    PARETO: "pareto" as const,
    ALLUVIAL: "alluvial" as const,
    SANKEY: "sankey" as const,
    DEPENDENCY_WHEEL: "dependencywheel" as const,
    XIRR: "xirr" as const,
    REPEATER: "repeater" as const,
};

/**
 * @public
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
    | "pyramid"
    | "pareto"
    | "alluvial"
    | "sankey"
    | "dependencywheel"
    | "repeater";

/**
 * @public
 */
export type HeadlineType = "headline";

/**
 * @public
 */
export type XirrType = "xirr";

/**
 * @public
 */
export type TableType = "table";

/**
 * @public
 */
export type VisType = ChartType | HeadlineType | TableType | XirrType;

/**
 * @public
 */
export type ChartElementType =
    | "slice"
    | "bar"
    | "point"
    | "label"
    | "cell" // 'cell' for heatmap
    | "target"
    | "primary"
    | "comparative";

/**
 * @public
 */
export type HeadlineElementType = "primaryValue" | "secondaryValue";

/**
 * @public
 */
export type TableElementType = "cell";

/**
 * @public
 */
export type VisElementType = ChartElementType | HeadlineElementType | TableElementType | "pushpin";

/**
 * @internal
 */
export type VisualizationEnvironment = "none" | "dashboards" | "analyticalDesigner";

/**
 * @internal
 */
export function getVisualizationType(type: ChartType): ChartType {
    if (type === VisualizationTypes.COMBO2) {
        return VisualizationTypes.COMBO;
    }

    return type;
}
