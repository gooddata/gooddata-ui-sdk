// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAnalyticalDashboardCommonProps } from "./AnalyticalDashboardModelV2.js";
import { type ITigerDashboardTab } from "./TigerTypes.js";

/**
 * V3 analytical dashboard. Tabs are the sole source of layout, filter context and filter
 * configurations — root-level `layout`, `dateFilterConfig`, `dateFilterConfigs`,
 * `attributeFilterConfigs`, `measureValueFilterConfigs` and `parameters` are intentionally
 * absent. Use V2 if backward compatibility with older SDK readers is required.
 *
 * @alpha
 */
export interface IAnalyticalDashboard extends IAnalyticalDashboardCommonProps {
    version: "3";
    tabs: ITigerDashboardTab[];
}

/**
 * @alpha
 */
export function isAnalyticalDashboard(dashboard: unknown): dashboard is IAnalyticalDashboard {
    return !isEmpty(dashboard) && (dashboard as IAnalyticalDashboard).version === "3";
}
