// (C) 2020-2021 GoodData Corporation
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

    export type DashboardDateFilterConfigMode = "readonly" | "hidden" | "active";
    export interface IDashboardPluginLink {
        type: string;
        parameters?: string;
    }

    export interface IDashboardDateFilterAddedPresets {
        absolutePresets?: GdcExtendedDateFilters.IDateFilterAbsolutePreset[];
        relativePresets?: GdcExtendedDateFilters.IDateFilterRelativePreset[];
    }

    export interface IDashboardDateFilterConfig {
        filterName: string;
        mode: DashboardDateFilterConfigMode;
        hideOptions?: GdcExtendedDateFilters.GUID[];
        hideGranularities?: GdcExtendedDateFilters.DateFilterGranularity[];
        addPresets?: IDashboardDateFilterAddedPresets;
    }

    export interface IAnalyticalDashboardContent {
        widgets: string[];
        filterContext?: string;
        layout?: GdcDashboardLayout.Layout;
        dateFilterConfig?: IDashboardDateFilterConfig;
        plugins?: IDashboardPluginLink[];
    }
}
