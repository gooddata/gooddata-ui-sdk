// (C) 2020 GoodData Corporation
import {
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IFilterContext as IFilterContextSPI,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

export namespace AnalyticalDashboardObjectModel {
    export interface IAnalyticalDashboard {
        analyticalDashboard: {
            isLocked?: boolean;
            tags?: string[];
            layout?: IDashboardLayout;
            filterContextRef?: ObjRef;
            dateFilterConfig?: IDashboardDateFilterConfig;
        };
    }

    export interface IFilterContext {
        filterContext: {
            filters: IFilterContextSPI["filters"];
        };
    }
}
