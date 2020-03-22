// (C) 2007-2020 GoodData Corporation

import { ISettings, SettingCatalog } from "@gooddata/sdk-backend-spi";
import { IChartConfig } from "../../../interfaces";

/**
 * @internal
 */
export function updateConfigWithSettings(config: IChartConfig, settings: ISettings): IChartConfig {
    return settings && settings[SettingCatalog.disableKpiDashboardHeadlineUnderline] === true
        ? { ...config, disableDrillUnderline: true }
        : config;
}
