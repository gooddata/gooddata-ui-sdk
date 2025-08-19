// (C) 2020-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

import {
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IFilterContext as IFilterContextModel,
    ObjRef,
} from "@gooddata/sdk-model";

/**
 * @deprecated use {@link AnalyticalDashboardModelV2.IAnalyticalDashboard} instead
 * @public
 */
export interface IAnalyticalDashboard {
    analyticalDashboard: {
        layout?: IDashboardLayout;
        filterContextRef?: ObjRef;
        dateFilterConfig?: IDashboardDateFilterConfig;
    };
}

/**
 * @deprecated use {@link AnalyticalDashboardModelV2.IFilterContext} instead
 * @public
 */
export interface IFilterContext {
    filterContext: {
        filters: IFilterContextModel["filters"];
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
