// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { DrillDefinition, IMeasureDescriptor, ISeparators } from "@gooddata/sdk-backend-spi";
import {
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { IDrillEvent, ILocale, OnFiredDrillEvent } from "@gooddata/sdk-ui";

export interface IKpiResult {
    measureFormat: string;
    measureResult: number;
    measureForComparisonResult?: number;
    measureDescriptor: IMeasureDescriptor;
}

export interface IKpiAlertResult {
    measureFormat: string;
    measureResult: number;
}

export type KpiAlertOperationStatus = "idle" | "inProgress" | "error";

/**
 * Supported dashboard filter type.
 * @beta
 */
export type IDashboardFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;

/**
 * Information about the DrillDown interaction - the attribute that is next in the drill down hierarchy.
 * @beta
 */
export interface IDrillDownDefinition {
    type: "drillDown";
    target: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillDownDefinition}.
 * @beta
 */
export function isDrillDownDefinition(obj: unknown): obj is IDrillDownDefinition {
    return !isEmpty(obj) && (obj as IDrillDownDefinition).type === "drillDown";
}

/**
 * A {@link @gooddata/sdk-ui#IDrillEvent} with added field that contains info about all the drilling interactions set in KPI dashboards
 * that are relevant to the given drill event (including drill downs).
 * @beta
 */
export interface IDashboardDrillEvent extends IDrillEvent {
    drillDefinitions?: Array<DrillDefinition | IDrillDownDefinition>;
}

/**
 * Callback called when a drill event occurs.
 * @beta
 */
export type OnFiredDashboardViewDrillEvent = (event: IDashboardDrillEvent) => ReturnType<OnFiredDrillEvent>;

/**
 * @beta
 */
export interface IDashboardViewConfig {
    /**
     * Token for Mapbox API. You need this to use GeoCharts in your dashboards.
     *
     * @remarks To create a Mapbox account and an access token, see [this guide](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/).
     */
    mapboxToken: string;

    /**
     * Regional number formatting to use for measures on the dashboard.
     */
    separators?: ISeparators;

    /**
     * If true, drillable items in KPI's will not be underlined. Defaults to false.
     */
    disableKpiDrillUnderline?: boolean;

    /**
     * Locale to use for localization of texts appearing in the dashboard.
     *
     * Note: text values coming from the data itself are not localized.
     */
    locale?: ILocale;
}
