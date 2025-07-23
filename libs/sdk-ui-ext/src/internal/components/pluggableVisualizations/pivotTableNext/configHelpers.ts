// (C) 2025 GoodData Corporation

import { IInsightDefinition, insightProperties, ISettings } from "@gooddata/sdk-model";
import { getMeasureGroupDimensionFromProperties } from "../../../utils/propertiesHelper.js";

/**
 * Sanitizes pivot table configuration by ensuring measureGroupDimension is valid
 * when table transposition is disabled.
 *
 * @param insight - The insight definition
 * @param customVisualizationConfig - Custom visualization configuration
 * @param settings - Feature flags and settings
 * @returns Sanitized configuration
 *
 * @internal
 */
export function sanitizePivotTableConfig(
    insight: IInsightDefinition,
    customVisualizationConfig: any,
    settings: ISettings,
): any {
    const tableTranspositionEnabled = settings.enableTableTransposition;

    if (
        !tableTranspositionEnabled &&
        (customVisualizationConfig?.measureGroupDimension === "rows" ||
            getMeasureGroupDimensionFromProperties(insightProperties(insight)) === "rows")
    ) {
        // override custom position to default when FF disabled in meantime
        return {
            ...(customVisualizationConfig || {}),
            measureGroupDimension: "columns",
        };
    }

    return customVisualizationConfig;
}
