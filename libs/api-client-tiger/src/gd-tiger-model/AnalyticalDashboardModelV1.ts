// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type ObjRef } from "@gooddata/sdk-model";

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
    return !isEmpty(dashboard) && !!(dashboard as IAnalyticalDashboard).analyticalDashboard;
}

/**
 * @public
 */
export function isFilterContext(filterContext: unknown): filterContext is IFilterContext {
    return !isEmpty(filterContext) && !!(filterContext as IFilterContext).filterContext;
}
