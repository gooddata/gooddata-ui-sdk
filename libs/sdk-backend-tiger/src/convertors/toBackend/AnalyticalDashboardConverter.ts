// (C) 2020 GoodData Corporation
import { AnalyticalDashboardObject } from "@gooddata/api-client-tiger";
import { IDashboardDefinition } from "@gooddata/sdk-backend-spi";
import { cloneWithSanitizedIds } from "./IdSanitization";

export function convertAnalyticalDashboard(
    dashboard: IDashboardDefinition,
): AnalyticalDashboardObject.IAnalyticalDashboard {
    return {
        analyticalDashboard: {
            isLocked: dashboard.isLocked,
            dateFilterConfig: cloneWithSanitizedIds(dashboard.filterContext),
            filterContext: cloneWithSanitizedIds(dashboard.filterContext), // TODO jak správně zpracovat a typovat?
            layout: cloneWithSanitizedIds(dashboard.layout),
        },
    };
}
