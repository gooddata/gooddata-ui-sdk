// (C) 2007-2022 GoodData Corporation

import { ISettings } from "@gooddata/sdk-model";
import { IChartConfig } from "../../../interfaces/index.js";

/**
 * @internal
 */
export function updateConfigWithSettings(config: IChartConfig, settings: ISettings): IChartConfig {
    let updatedConfig = config;
    if (settings) {
        if (settings["disableKpiDashboardHeadlineUnderline"] === true) {
            updatedConfig = { ...updatedConfig, disableDrillUnderline: true };
        }

        if (settings["enableKDWidgetCustomHeight"] === true) {
            updatedConfig = { ...updatedConfig, enableCompactSize: true };
        }

        if (updatedConfig === undefined || updatedConfig.enableJoinedAttributeAxisName === undefined) {
            updatedConfig = {
                ...updatedConfig,
                enableJoinedAttributeAxisName: settings["enableAxisNameViewByTwoAttributes"],
            };
        }

        if (settings.enableChartsSorting) {
            updatedConfig = { ...updatedConfig, enableChartSorting: true };
        }

        if (settings.enableReversedStacking) {
            updatedConfig = { ...updatedConfig, enableReversedStacking: true };
        }

        if (settings.enableSeparateTotalLabels) {
            updatedConfig = { ...updatedConfig, enableSeparateTotalLabels: true };
        }
    }

    return updatedConfig;
}
