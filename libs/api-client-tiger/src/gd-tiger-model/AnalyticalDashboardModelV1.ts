// (C) 2020-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { _isEmpty } from "@gooddata/util";

import {
    type ITigerDashboardDateFilterConfig,
    type ITigerDashboardLayout,
    type ITigerFilterContextItem,
} from "./TigerTypes.js";

/**
 * @deprecated use {@link AnalyticalDashboardModelV2.IAnalyticalDashboard} instead
 * @public
 */
export interface IAnalyticalDashboard {
    analyticalDashboard: {
        layout?: ITigerDashboardLayout;
        filterContextRef?: ObjRef;
        dateFilterConfig?: ITigerDashboardDateFilterConfig;
    };
}

/**
 * @deprecated use {@link AnalyticalDashboardModelV2.IFilterContext} instead
 * @public
 */
export interface IFilterContext {
    filterContext: {
        filters: ITigerFilterContextItem[];
    };
}

/**
 * @public
 */
export function isAnalyticalDashboard(dashboard: unknown): dashboard is IAnalyticalDashboard {
    return !_isEmpty(dashboard) && !!(dashboard as IAnalyticalDashboard).analyticalDashboard;
}

/**
 * @public
 */
export function isFilterContext(filterContext: unknown): filterContext is IFilterContext {
    return !_isEmpty(filterContext) && !!(filterContext as IFilterContext).filterContext;
}
