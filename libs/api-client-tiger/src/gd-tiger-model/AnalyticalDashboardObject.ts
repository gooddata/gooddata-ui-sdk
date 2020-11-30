// (C) 2020 GoodData Corporation
import { IDashboardDateFilterConfig, IFilterContext, IDashboardLayout } from "@gooddata/sdk-backend-spi";

export namespace AnalyticalDashboardObject {
    export interface IAnalyticalDashboard {
        analyticalDashboard: {
            isLocked?: boolean;
            layout?: IDashboardLayout;
            filterContext?: IFilterContext;
            dateFilterConfig?: IDashboardDateFilterConfig;
        };
    }
}
