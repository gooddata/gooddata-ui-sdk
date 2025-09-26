// (C) 2007-2025 GoodData Corporation

import { ISeparators, ISettings } from "@gooddata/sdk-model";

import { IChartConfig } from "../../../interfaces/index.js";

/**
 * @internal
 */
export function updateConfigWithSettings(config: IChartConfig, settings: ISettings): IChartConfig {
    if (!settings) {
        return {
            enableCompactSize: true,
            ...(config || {}),
        };
    }

    return {
        ...(config || {}),
        enableCompactSize: true,
        disableDrillUnderline: true,
        ...(config?.enableJoinedAttributeAxisName === undefined
            ? {
                  enableJoinedAttributeAxisName: settings.enableAxisNameViewByTwoAttributes,
              }
            : {}),
        ...(settings.enableChartsSorting ? { enableChartSorting: true } : {}),
        enableReversedStacking: true,
        enableSeparateTotalLabels: true,
        ...(settings.enableKDCrossFiltering ? { useGenericInteractionTooltip: true } : {}),
        ...(settings.enableCrossFilteringAliasTitles ? { enableAliasAttributeLabel: true } : {}),
        ...(settings["separators"] ? { separators: settings["separators"] as ISeparators } : {}),
        ...(settings.enableVisualizationFineTuning ? { enableVisualizationFineTuning: true } : {}),
        ...(settings.enableExecutionCancelling ? { enableExecutionCancelling: true } : {}),
        ...(settings.enableHighchartsAccessibility ? { enableHighchartsAccessibility: true } : {}),
        ...(settings.enableLineChartTrendThreshold ? { enableLineChartTrendThreshold: true } : {}),
        ...(settings.enableKDRespectLegendPosition ? { respectLegendPosition: true } : {}),
        ...(settings.enableAccessibleChartTooltip ? { enableAccessibleTooltip: true } : {}),
    };
}
