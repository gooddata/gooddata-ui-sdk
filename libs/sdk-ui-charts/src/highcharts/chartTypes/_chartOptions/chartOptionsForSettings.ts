// (C) 2007-2026 GoodData Corporation

import { type ISeparators, type ISettings } from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";

function getSettingsBasedConfig(settings: ISettings): Partial<IChartConfig> {
    return {
        ...(settings.disableKpiDashboardHeadlineUnderline ? { disableDrillUnderline: true } : {}),
        ...(settings.enableKDCrossFiltering ? { useGenericInteractionTooltip: true } : {}),
        ...(settings.enableCrossFilteringAliasTitles ? { enableAliasAttributeLabel: true } : {}),
        ...(settings["separators"] ? { separators: settings["separators"] as ISeparators } : {}),
        ...(settings.enableVisualizationFineTuning ? { enableVisualizationFineTuning: true } : {}),
        ...(settings.enableExecutionCancelling ? { enableExecutionCancelling: true } : {}),
        ...(settings.enableDrillMenuPositioningAtCursor ? { enableDrillMenuPositioningAtCursor: true } : {}),
        ...(settings.enableHighchartsAccessibility ? { enableHighchartsAccessibility: true } : {}),
        ...(settings.enableLineChartTrendThreshold ? { enableLineChartTrendThreshold: true } : {}),
        ...(settings.enableKDRespectLegendPosition ? { respectLegendPosition: true } : {}),
        ...(settings.enableAccessibleChartTooltip || settings.enableAccessibilityMode
            ? { enableAccessibleTooltip: true }
            : {}),
        ...(settings.enableAccessibilityMode ? { enableSingleBubbleSeries: true } : {}),
    };
}

/**
 * @internal
 */
export function updateConfigWithSettings(
    config: IChartConfig | undefined,
    settings: ISettings | undefined,
): IChartConfig {
    if (!settings) {
        return {
            enableCompactSize: true,
            ...(config || {}),
        };
    }

    return {
        ...(config || {}),
        enableCompactSize: true,
        ...(config?.enableJoinedAttributeAxisName === undefined
            ? {
                  enableJoinedAttributeAxisName: true,
              }
            : {}),
        enableChartSorting: true,
        enableReversedStacking: true,
        enableSeparateTotalLabels: true,
        ...getSettingsBasedConfig(settings),
    };
}
