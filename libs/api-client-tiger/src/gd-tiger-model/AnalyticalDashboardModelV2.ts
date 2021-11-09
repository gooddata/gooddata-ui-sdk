// (C) 2020-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import {
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IFilterContext as IFilterContextSPI,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

export namespace AnalyticalDashboardModelV2 {
    export interface IAnalyticalDashboard {
        version: "2";
        layout?: IDashboardLayout;
        filterContextRef?: ObjRef;
        dateFilterConfig?: IDashboardDateFilterConfig;
    }

    export interface IFilterContext {
        version: "2";
        filters: IFilterContextSPI["filters"];
    }

    export interface IDashboardPlugin {
        version: "2";
        url: string;
    }

    export function isAnalyticalDashboard(dashboard: unknown): dashboard is IAnalyticalDashboard {
        return !isEmpty(dashboard) && (dashboard as IAnalyticalDashboard).version === "2";
    }

    export function isFilterContext(filterContext: unknown): filterContext is IFilterContext {
        return !isEmpty(filterContext) && (filterContext as IFilterContext).version === "2";
    }

    export function isDashboardPlugin(plugin: unknown): plugin is IDashboardPlugin {
        return !isEmpty(plugin) && (plugin as IDashboardPlugin).version === "2";
    }
}
