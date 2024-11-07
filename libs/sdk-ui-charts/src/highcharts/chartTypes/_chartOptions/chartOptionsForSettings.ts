// (C) 2007-2024 GoodData Corporation

import { ISeparators, ISettings } from "@gooddata/sdk-model";
import { IChartConfig } from "../../../interfaces/index.js";

/**
 * @internal
 */
export function updateConfigWithSettings(config: IChartConfig, settings: ISettings): IChartConfig {
    if (!settings) {
        return config;
    }

    return {
        ...(config ? config : {}),
        ...(settings.disableKpiDashboardHeadlineUnderline ? { disableDrillUnderline: true } : {}),
        ...(settings.enableKDWidgetCustomHeight ? { enableCompactSize: true } : {}),
        ...(config?.enableJoinedAttributeAxisName === undefined
            ? {
                  enableJoinedAttributeAxisName: settings.enableAxisNameViewByTwoAttributes,
              }
            : {}),
        ...(settings.enableChartsSorting ? { enableChartSorting: true } : {}),
        ...(settings.enableReversedStacking ? { enableReversedStacking: true } : {}),
        ...(settings.enableSeparateTotalLabels ? { enableSeparateTotalLabels: true } : {}),
        ...(settings.enableKDCrossFiltering ? { useGenericInteractionTooltip: true } : {}),
        ...(settings.enableCrossFilteringAliasTitles ? { enableAliasAttributeLabel: true } : {}),
        ...(settings.separators ? { separators: settings.separators as ISeparators } : {}),
        ...(settings.enableVisualizationFineTuning ? { enableVisualizationFineTuning: true } : {}),
    };
}
