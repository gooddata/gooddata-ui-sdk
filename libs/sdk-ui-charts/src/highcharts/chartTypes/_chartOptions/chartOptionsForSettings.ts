// (C) 2007-2020 GoodData Corporation

import { ISettings } from "@gooddata/sdk-backend-spi";
import { IChartConfig } from "../../../interfaces";

/**
 * @internal
 */
export function updateConfigWithSettings(config: IChartConfig, settings: ISettings): IChartConfig {
    return settings && settings["disableKpiDashboardHeadlineUnderline"] === true
        ? { ...config, disableDrillUnderline: true }
        : config;
}
