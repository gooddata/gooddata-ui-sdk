// (C) 2020-2021 GoodData Corporation
import {
    DateFilterGranularity,
    GUID,
    IDateFilterAbsolutePreset,
    IDateFilterRelativePreset,
} from "../extendedDateFilters/GdcExtendedDateFilters.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";
import { Layout } from "./GdcDashboardLayout.js";

/**
 * @public
 */
export interface IWrappedAnalyticalDashboard {
    analyticalDashboard: IAnalyticalDashboard;
}
/**
 * @public
 */
export interface IAnalyticalDashboard {
    content: IAnalyticalDashboardContent;
    meta: IObjectMeta;
}

/**
 * @public
 */
export type DashboardDateFilterConfigMode = "readonly" | "hidden" | "active";

/**
 * @public
 */
export interface IDashboardPluginLink {
    type: string;
    parameters?: string;
}

/**
 * @public
 */
export interface IDashboardDateFilterAddedPresets {
    absolutePresets?: IDateFilterAbsolutePreset[];
    relativePresets?: IDateFilterRelativePreset[];
}

/**
 * @public
 */
export interface IDashboardDateFilterConfig {
    filterName: string;
    mode: DashboardDateFilterConfigMode;
    hideOptions?: GUID[];
    hideGranularities?: DateFilterGranularity[];
    addPresets?: IDashboardDateFilterAddedPresets;
}

/**
 * @public
 */
export interface IAnalyticalDashboardContent {
    widgets: string[];
    filterContext?: string;
    layout?: Layout;
    dateFilterConfig?: IDashboardDateFilterConfig;
    plugins?: IDashboardPluginLink[];
}
