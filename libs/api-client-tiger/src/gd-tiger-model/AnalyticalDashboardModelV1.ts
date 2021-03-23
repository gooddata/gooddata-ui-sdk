// (C) 2020-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import {
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IFilterContext as IFilterContextSPI,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

export namespace AnalyticalDashboardModelV1 {
    /**
     * @deprecated use {@link AnalyticalDashboardModelV2.IAnalyticalDashboard} instead
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
     */
    export interface IFilterContext {
        filterContext: {
            filters: IFilterContextSPI["filters"];
        };
    }

    export function isAnalyticalDashboard(dashboard: unknown): dashboard is IAnalyticalDashboard {
        return !isEmpty(dashboard) && !!(dashboard as IAnalyticalDashboard).analyticalDashboard;
    }

    export function isFilterContext(filterContext: unknown): filterContext is IFilterContext {
        return !isEmpty(filterContext) && !!(filterContext as IFilterContext).filterContext;
    }
}
