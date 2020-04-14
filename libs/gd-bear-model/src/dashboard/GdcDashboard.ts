// (C) 2020 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";
import { GdcDashboardLayout } from "./GdcDashboardLayout";
import { GdcExtendedDateFilters } from "../extendedDateFilters/GdcExtendedDateFilters";

/**
 * @public
 */
export namespace GdcDashboard {
    export interface IWrappedAnalyticalDashboard {
        analyticalDashboard: IAnalyticalDashboard;
    }
    export interface IAnalyticalDashboard {
        content: IAnalyticalDashboardContent;
        meta: GdcMetadata.IObjectMeta;
    }

    export interface IAnalyticalDashboardContent {
        widgets: string[];
        filterContext?: string;
        layout?: GdcDashboardLayout.Layout;
        dateFilterConfig?: GdcExtendedDateFilters.IDashboardDateFilterConfig;
    }
}
