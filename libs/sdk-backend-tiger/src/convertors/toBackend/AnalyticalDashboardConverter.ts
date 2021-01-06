// (C) 2020-2021 GoodData Corporation
import { AnalyticalDashboardObjectModel } from "@gooddata/api-client-tiger";
import { IDashboardDefinition, IFilterContextDefinition } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { cloneWithSanitizedIds } from "./IdSanitization";

export function convertAnalyticalDashboard(
    dashboard: IDashboardDefinition,
    filterContextRef?: ObjRef,
): AnalyticalDashboardObjectModel.IAnalyticalDashboard {
    return {
        analyticalDashboard: {
            isLocked: dashboard.isLocked,
            tags: dashboard.tags,
            dateFilterConfig: cloneWithSanitizedIds(dashboard.dateFilterConfig),
            filterContextRef: cloneWithSanitizedIds(filterContextRef),
            layout: cloneWithSanitizedIds(dashboard.layout),
        },
    };
}

export function convertFilterContextToBackend(
    filterContext: IFilterContextDefinition,
): AnalyticalDashboardObjectModel.IFilterContext {
    return {
        filterContext: {
            filters: cloneWithSanitizedIds(filterContext.filters),
        },
    };
}
