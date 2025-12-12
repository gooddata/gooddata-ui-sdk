// (C) 2024 GoodData Corporation

import {
    type IInsight,
    type IInsightDefinition,
    insightProperties,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { type VisType } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const isInsightSupportedForAlerts = (
    insight: IInsight | IInsightDefinition | null | undefined,
): boolean => {
    const type = insight ? (insightVisualizationType(insight) as VisType) : null;

    switch (type) {
        case "headline":
        case "bar":
        case "column":
        case "line":
        case "area":
        case "combo2":
        case "scatter":
        case "bubble":
        case "repeater":
        case "bullet":
        case "pie":
        case "donut":
        case "treemap":
        case "funnel":
        case "pyramid":
        case "heatmap":
        case "waterfall":
        case "dependencywheel":
        case "sankey":
        case "pushpin":
        case "table":
            return true;
        default:
            return false;
    }
};

/**
 * @internal
 */
export const isInsightSupportedForScheduledExports = (
    insight: IInsight | IInsightDefinition | null | undefined,
): boolean => {
    const type = insight ? (insightVisualizationType(insight) as VisType) : null;

    return type !== "repeater";
};

/**
 * @internal
 */
export const isInsightAlertingConfigurationEnabled = (
    insight: IInsight | IInsightDefinition | undefined,
): boolean => {
    const visualizationProperties = insight ? insightProperties(insight) : {};
    const controls = visualizationProperties?.["controls"] ?? {};

    return insight && !controls.disableAlerts;
};

/**
 * @internal
 */
export const isInsightScheduledExportsConfigurationEnabled = (
    insight: IInsight | IInsightDefinition | undefined,
): boolean => {
    const visualizationProperties = insight ? insightProperties(insight) : {};
    const controls = visualizationProperties?.["controls"] ?? {};

    return insight && !controls.disableScheduledExports;
};
