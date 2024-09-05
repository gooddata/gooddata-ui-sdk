// (C) 2024 GoodData Corporation

import {
    IInsight,
    IInsightDefinition,
    insightProperties,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

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
            return true;
        default:
            return false;
    }
};

/**
 * @internal
 */
export const isInsightAlertingConfigurationEnabled = (insight: IInsight | IInsightDefinition): boolean => {
    const visualizationProperties = insightProperties(insight);
    const controls = visualizationProperties?.controls ?? {};

    return !controls.disableAlerts;
};

/**
 * @internal
 */
export const isInsightScheduledExportsConfigurationEnabled = (
    insight: IInsight | IInsightDefinition,
): boolean => {
    const visualizationProperties = insightProperties(insight);
    const controls = visualizationProperties?.controls ?? {};

    return !controls.disableScheduledExports;
};
