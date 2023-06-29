// (C) 2021-2023 GoodData Corporation

import {
    ObjRef,
    IDashboardAttributeFilter,
    IKpiWidget,
    IKpiWidgetDefinition,
    ICatalogDateDataset,
    IMeasureMetadataObject,
    IKpi,
    IDrillToLegacyDashboard,
    IKpiWidgetConfiguration,
} from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base.js";
import { WidgetDescription, WidgetHeader } from "../types/widgetTypes.js";
import { DashboardContext } from "../types/commonTypes.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardKpiWidgetHeaderChanged} event.
 * @beta
 */
export interface DashboardKpiWidgetHeaderChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * New value of the widget header.
     */
    readonly header: WidgetHeader;
}

/**
 * This event is emitted when the dashboard's KPI Widget header is modified.
 *
 * @beta
 */
export interface DashboardKpiWidgetHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED";
    readonly payload: DashboardKpiWidgetHeaderChangedPayload;
}

export function kpiWidgetHeaderChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    header: WidgetHeader,
    correlationId?: string,
): DashboardKpiWidgetHeaderChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetHeaderChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetHeaderChanged = eventGuard<DashboardKpiWidgetHeaderChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetDescriptionChanged} event.
 * @beta
 */
export interface DashboardKpiWidgetDescriptionChangedPayload {
    /**
     * Reference to changed KPI Widget.
     */
    readonly ref: ObjRef;

    /**
     * New value of the widget description.
     */
    readonly description: WidgetDescription;
}

/**
 * This event is emitted when the dashboard's KPI Widget description is modified.
 *
 * @beta
 */
export interface DashboardKpiWidgetDescriptionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.DESCRIPTION_CHANGED";
    readonly payload: DashboardKpiWidgetDescriptionChangedPayload;
}

export function kpiWidgetDescriptionChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    description: WidgetDescription,
    correlationId?: string,
): DashboardKpiWidgetDescriptionChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetDescriptionChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetDescriptionChanged = eventGuard<DashboardKpiWidgetDescriptionChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.DESCRIPTION_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetConfigurationChanged} event.
 * @beta
 */
export interface DashboardKpiWidgetConfigurationChangedPayload {
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
export interface DashboardKpiWidgetConfigurationChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.CONFIGURATION_CHANGED";
    readonly payload: DashboardKpiWidgetConfigurationChangedPayload;
}

export function kpiWidgetConfigurationChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    configuration: IKpiWidgetConfiguration | undefined,
    correlationId?: string,
): DashboardKpiWidgetConfigurationChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetConfigurationChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetConfigurationChanged = eventGuard<DashboardKpiWidgetConfigurationChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.CONFIGURATION_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetMeasureChanged} event.
 * @beta
 */
export interface DashboardKpiWidgetMeasureChangedPayload {
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
    readonly header?: WidgetHeader;
}

/**
 * This event is emitted when the dashboard's KPI Widget measure is modified - the KPI now shows value for
 * different measure. The change of measure to use may be accompanied with a change of the KPI header (change of
 * title). In that case new value of header is also included in the event.
 *
 * @beta
 */
export interface DashboardKpiWidgetMeasureChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED";
    readonly payload: DashboardKpiWidgetMeasureChangedPayload;
}

export function kpiWidgetMeasureChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    kpiWidget: IKpiWidget,
    measure: IMeasureMetadataObject,
    header?: WidgetHeader,
    correlationId?: string,
): DashboardKpiWidgetMeasureChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetMeasureChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetMeasureChanged = eventGuard<DashboardKpiWidgetMeasureChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetFilterSettingsChanged} event.
 * @beta
 */
export interface DashboardKpiWidgetFilterSettingsChangedPayload {
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
export interface DashboardKpiWidgetFilterSettingsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED";
    readonly payload: DashboardKpiWidgetFilterSettingsChangedPayload;
}

export function kpiWidgetFilterSettingsChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    ignoredAttributeFilters: IDashboardAttributeFilter[],
    dateDatasetForFiltering: ICatalogDateDataset | undefined,
    correlationId?: string,
): DashboardKpiWidgetFilterSettingsChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetFilterSettingsChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetFilterSettingsChanged = eventGuard<DashboardKpiWidgetFilterSettingsChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetComparisonChanged} event.
 * @beta
 */
export interface DashboardKpiWidgetComparisonChangedPayload {
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
export interface DashboardKpiWidgetComparisonChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED";
    readonly payload: DashboardKpiWidgetComparisonChangedPayload;
}

export function kpiWidgetComparisonChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    kpi: IKpi,
    correlationId?: string,
): DashboardKpiWidgetComparisonChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetComparisonChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetComparisonChanged = eventGuard<DashboardKpiWidgetComparisonChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetDrillRemoved} event.
 * @beta
 */
export interface DashboardKpiWidgetDrillRemovedPayload {
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
export interface DashboardKpiWidgetDrillRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.DRILL_REMOVED";
    readonly payload: DashboardKpiWidgetDrillRemovedPayload;
}

export function kpiWidgetDrillRemoved(
    ctx: DashboardContext,
    ref: ObjRef,
    correlationId?: string,
): DashboardKpiWidgetDrillRemoved {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetDrillRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetDrillRemoved = eventGuard<DashboardKpiWidgetDrillRemoved>(
    "GDC.DASH/EVT.KPI_WIDGET.DRILL_REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetDrillSet} event.
 * @beta
 */
export interface DashboardKpiWidgetDrillSetPayload {
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
export interface DashboardKpiWidgetDrillSet extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.DRILL_SET";
    readonly payload: DashboardKpiWidgetDrillSetPayload;
}

export function kpiWidgetDrillSet(
    ctx: DashboardContext,
    ref: ObjRef,
    drill: IDrillToLegacyDashboard,
    correlationId?: string,
): DashboardKpiWidgetDrillSet {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetDrillSet}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetDrillSet = eventGuard<DashboardKpiWidgetDrillSet>(
    "GDC.DASH/EVT.KPI_WIDGET.DRILL_SET",
);

//
//
//

/**
 * Payload of the {@link DashboardKpiWidgetChanged} event.
 * @beta
 */
export interface DashboardKpiWidgetChangedPayload {
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
export interface DashboardKpiWidgetChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED";
    readonly payload: DashboardKpiWidgetChangedPayload;
}

export function kpiWidgetChanged(
    ctx: DashboardContext,
    kpiWidget: IKpiWidget,
    correlationId?: string,
): DashboardKpiWidgetChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKpiWidgetChanged = eventGuard<DashboardKpiWidgetChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED",
);
