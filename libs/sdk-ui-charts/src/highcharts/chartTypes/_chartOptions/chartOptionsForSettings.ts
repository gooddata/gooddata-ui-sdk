// (C) 2007-2021 GoodData Corporation

import { ISettings } from "@gooddata/sdk-backend-spi";
import { IChartConfig } from "../../../interfaces";

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
    }

    return updatedConfig;
}
