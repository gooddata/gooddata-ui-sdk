// (C) 2021-2026 GoodData Corporation

import {
    type ICatalogDateDataset,
    type IDashboardAttributeFilter,
    type IDrillToLegacyDashboard,
    type IKpi,
    type IKpiWidget,
    type IKpiWidgetConfiguration,
    type IKpiWidgetDefinition,
    type IMeasureMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";
import { type IWidgetDescription, type IWidgetHeader } from "../types/widgetTypes.js";

/**
 * Payload of the {@link IDashboardKpiWidgetHeaderChanged} event.
 * @beta
 */
export interface IDashboardKpiWidgetHeaderChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * New value of the widget header.
     */
    readonly header: IWidgetHeader;
}

/**
 * This event is emitted when the dashboard's KPI Widget header is modified.
 *
 * @beta
 */
export interface IDashboardKpiWidgetHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED";
    readonly payload: IDashboardKpiWidgetHeaderChangedPayload;
}

export function kpiWidgetHeaderChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    header: IWidgetHeader,
    correlationId?: string,
): IDashboardKpiWidgetHeaderChanged {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            header,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetHeaderChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetHeaderChanged = eventGuard<IDashboardKpiWidgetHeaderChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetDescriptionChanged} event.
 * @beta
 */
export interface IDashboardKpiWidgetDescriptionChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * New value of the widget description.
     */
    readonly description: IWidgetDescription;
}

/**
 * This event is emitted when the dashboard's KPI Widget description is modified.
 *
 * @beta
 */
export interface IDashboardKpiWidgetDescriptionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.DESCRIPTION_CHANGED";
    readonly payload: IDashboardKpiWidgetDescriptionChangedPayload;
}

export function kpiWidgetDescriptionChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    description: IWidgetDescription,
    correlationId?: string,
): IDashboardKpiWidgetDescriptionChanged {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.DESCRIPTION_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            description,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetDescriptionChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetDescriptionChanged = eventGuard<IDashboardKpiWidgetDescriptionChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.DESCRIPTION_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetConfigurationChanged} event.
 * @beta
 */
export interface IDashboardKpiWidgetConfigurationChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * New value of the widget configuration.
     */
    readonly configuration: IKpiWidgetConfiguration | undefined;
}

/**
 * This event is emitted when the dashboard's KPI Widget configuration is modified.
 *
 * @beta
 */
export interface IDashboardKpiWidgetConfigurationChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.CONFIGURATION_CHANGED";
    readonly payload: IDashboardKpiWidgetConfigurationChangedPayload;
}

export function kpiWidgetConfigurationChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    configuration: IKpiWidgetConfiguration | undefined,
    correlationId?: string,
): IDashboardKpiWidgetConfigurationChanged {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.CONFIGURATION_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            configuration,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetConfigurationChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetConfigurationChanged = eventGuard<IDashboardKpiWidgetConfigurationChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.CONFIGURATION_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetMeasureChanged} event.
 * @beta
 */
export interface IDashboardKpiWidgetMeasureChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * New setup of KPI. Includes the measure used to calculate KPI and the comparison settings that
     * are in effect.
     *
     * Note: the comparison may be 'none' - meaning
     */
    readonly kpiWidget: IKpiWidget;

    /**
     * Metadata object describing the measure that is now used on the KPI.
     */
    readonly measure: IMeasureMetadataObject;

    /**
     * If a new header was also set while changing the measure, then the new header value is included here.
     */
    readonly header?: IWidgetHeader;
}

/**
 * This event is emitted when the dashboard's KPI Widget measure is modified - the KPI now shows value for
 * different measure. The change of measure to use may be accompanied by a change of the KPI header (change of
 * title). In that case new value of header is also included in the event.
 *
 * @beta
 */
export interface IDashboardKpiWidgetMeasureChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED";
    readonly payload: IDashboardKpiWidgetMeasureChangedPayload;
}

export function kpiWidgetMeasureChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    kpiWidget: IKpiWidget,
    measure: IMeasureMetadataObject,
    header?: IWidgetHeader,
    correlationId?: string,
): IDashboardKpiWidgetMeasureChanged {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            kpiWidget,
            measure,
            header,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetMeasureChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetMeasureChanged = eventGuard<IDashboardKpiWidgetMeasureChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetFilterSettingsChanged} event.
 * @beta
 */
export interface IDashboardKpiWidgetFilterSettingsChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * Attribute filters that are ignored for the widget.
     *
     * If empty, then all attribute filters defined for the dashboard are in effect.
     */
    readonly ignoredAttributeFilters: IDashboardAttributeFilter[];

    /**
     * Date dataset used for date filtering.
     *
     * If undefined, then dashboard's date filter is not in effect for the widget.
     */
    readonly dateDatasetForFiltering?: ICatalogDateDataset;
}

/**
 * This event is emitted when dashboard's KPI Widget filter settings are modified.
 *
 * @beta
 */
export interface IDashboardKpiWidgetFilterSettingsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED";
    readonly payload: IDashboardKpiWidgetFilterSettingsChangedPayload;
}

export function kpiWidgetFilterSettingsChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    ignoredAttributeFilters: IDashboardAttributeFilter[],
    dateDatasetForFiltering: ICatalogDateDataset | undefined,
    correlationId?: string,
): IDashboardKpiWidgetFilterSettingsChanged {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            ignoredAttributeFilters,
            dateDatasetForFiltering,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetFilterSettingsChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetFilterSettingsChanged = eventGuard<IDashboardKpiWidgetFilterSettingsChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetComparisonChanged} event.
 * @beta
 */
export interface IDashboardKpiWidgetComparisonChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * New setup of KPI. Includes the measure used to calculate KPI and the comparison settings that
     * are in effect.
     *
     * Note: the comparison may be 'none' - meaning
     */
    readonly kpi: IKpi;
}

/**
 * This event is emitted when dashboard's KPI Widget has its comparison type changed. The event includes
 * the new definition of the KPI that has uses same measure as before however has new setup of the over-time
 * comparison.
 *
 * @beta
 */
export interface IDashboardKpiWidgetComparisonChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED";
    readonly payload: IDashboardKpiWidgetComparisonChangedPayload;
}

export function kpiWidgetComparisonChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    kpi: IKpi,
    correlationId?: string,
): IDashboardKpiWidgetComparisonChanged {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
        ctx,
        correlationId,
        payload: {
            ref,
            kpi,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetComparisonChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetComparisonChanged = eventGuard<IDashboardKpiWidgetComparisonChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetDrillRemoved} event.
 * @beta
 */
export interface IDashboardKpiWidgetDrillRemovedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;
}

/**
 * This event is emitted when dashboard's KPI Widget has its drills removed.
 *
 * @beta
 */
export interface IDashboardKpiWidgetDrillRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.DRILL_REMOVED";
    readonly payload: IDashboardKpiWidgetDrillRemovedPayload;
}

export function kpiWidgetDrillRemoved(
    ctx: DashboardContext,
    ref: ObjRef,
    correlationId?: string,
): IDashboardKpiWidgetDrillRemoved {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.DRILL_REMOVED",
        ctx,
        correlationId,
        payload: {
            ref,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetDrillRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetDrillRemoved = eventGuard<IDashboardKpiWidgetDrillRemoved>(
    "GDC.DASH/EVT.KPI_WIDGET.DRILL_REMOVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetDrillSet} event.
 * @beta
 */
export interface IDashboardKpiWidgetDrillSetPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * The drill set.
     */
    readonly drill: IDrillToLegacyDashboard;
}

/**
 * This event is emitted when dashboard's KPI Widget has its drill set.
 *
 * @beta
 */
export interface IDashboardKpiWidgetDrillSet extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.DRILL_SET";
    readonly payload: IDashboardKpiWidgetDrillSetPayload;
}

export function kpiWidgetDrillSet(
    ctx: DashboardContext,
    ref: ObjRef,
    drill: IDrillToLegacyDashboard,
    correlationId?: string,
): IDashboardKpiWidgetDrillSet {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.DRILL_SET",
        ctx,
        correlationId,
        payload: {
            ref,
            drill,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetDrillSet}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetDrillSet = eventGuard<IDashboardKpiWidgetDrillSet>(
    "GDC.DASH/EVT.KPI_WIDGET.DRILL_SET",
);

//
//
//

/**
 * Payload of the {@link IDashboardKpiWidgetChanged} event.
 * @beta
 */
export interface IDashboardKpiWidgetChangedPayload {
    /**
     * The new value of the changed widget.
     */
    kpiWidget: IKpiWidget | IKpiWidgetDefinition;
}

/**
 * This event is emitted after any change to KPI Widget configuration. It contains the entire new state of the
 * KPI Widget.
 *
 * @beta
 */
export interface IDashboardKpiWidgetChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED";
    readonly payload: IDashboardKpiWidgetChangedPayload;
}

export function kpiWidgetChanged(
    ctx: DashboardContext,
    kpiWidget: IKpiWidget,
    correlationId?: string,
): IDashboardKpiWidgetChanged {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED",
        ctx,
        correlationId,
        payload: {
            kpiWidget,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKpiWidgetChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetChanged = eventGuard<IDashboardKpiWidgetChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED",
);
