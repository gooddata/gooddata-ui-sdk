// (C) 2007-2019 GoodData Corporation

import { ISettings, SettingCatalog } from "@gooddata/sdk-backend-spi";
import { IChartConfig } from "../../Config";

/**
 * @internal
 */
export function updateConfigWithSettings(config: IChartConfig, settings: ISettings): IChartConfig {
    return settings && settings[SettingCatalog.disableKpiDashboardHeadlineUnderline] === true
        ? { ...config, disableDrillUnderline: true }
        : config;
}
