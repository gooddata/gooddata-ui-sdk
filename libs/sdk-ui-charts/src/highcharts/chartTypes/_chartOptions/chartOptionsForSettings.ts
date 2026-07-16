// (C) 2007-2026 GoodData Corporation

import { type ISeparators, type ISettings } from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";

function getSettingsBasedConfig(settings: ISettings): Partial<IChartConfig> {
    return {
        ...(settings.disableKpiDashboardHeadlineUnderline ? { disableDrillUnderline: true } : {}),
        useGenericInteractionTooltip: true,
        enableAliasAttributeLabel: true,
        ...(settings["separators"] ? { separators: settings["separators"] as ISeparators } : {}),
        ...(settings.enableVisualizationFineTuning ? { enableVisualizationFineTuning: true } : {}),
        ...(settings.enableExecutionCancelling ? { enableExecutionCancelling: true } : {}),
        ...(settings.enableHighchartsAccessibility ? { enableHighchartsAccessibility: true } : {}),
        respectLegendPosition: true,
        ...(settings.enableAccessibleChartTooltip || settings.enableAccessibilityMode
            ? { enableAccessibleTooltip: true }
            : {}),
        ...(settings.enableAccessibilityMode
            ? { enableSingleBubbleSeries: true, enableContrastSafeDerivedColors: true }
            : {}),
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

    const updatedConfig: IChartConfig = {
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

    // enableCustomTooltip defaults on; when explicitly disabled, strip any persisted custom
    // tooltip so the insight renders plain.
    if (settings.enableCustomTooltip === false) {
        return { ...updatedConfig, customTooltip: undefined };
    }

    return updatedConfig;
}
