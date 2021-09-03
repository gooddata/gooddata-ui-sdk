// (C) 2021 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";
import {
    ICatalogDateDataset,
    IDashboardAttributeFilter,
    IKpiWidget,
    IKpiWidgetDefinition,
    ILegacyKpi,
    IMeasureMetadataObject,
} from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { DashboardEventBody, IDashboardEvent } from "./base";
import { WidgetHeader } from "../types/widgetTypes";
import { DashboardContext } from "../types/commonTypes";
import { eventGuard } from "./util";

/**
 * This event is emitted when the dashboard's KPI Widget header is modified.
 *
 * @alpha
 */
export interface DashboardKpiWidgetHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED";
    readonly payload: {
        /**
         * Reference to changed KPI Widget.
         */
        readonly ref: ObjRef;

        /**
         * New value of the widget header.
         */
        readonly header: WidgetHeader;
    };
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
 * @alpha
 */
export const isDashboardKpiWidgetHeaderChanged = eventGuard<DashboardKpiWidgetHeaderChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
);

//
//
//

/**
 * This event is emitted when the dashboard's KPI Widget measure is modified - the KPI now shows value for
 * different measure. The change of measure to use may be accompanied with a change of the KPI header (change of
 * title). In that case new value of header is also included in the event.
 *
 * @alpha
 */
export interface DashboardKpiWidgetMeasureChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED";
    readonly payload: {
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
    };
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
 * @alpha
 */
export const isDashboardKpiWidgetMeasureChanged = eventGuard<DashboardKpiWidgetMeasureChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
);

//
//
//

/**
 * This event is emitted when dashboard's KPI Widget filter settings are modified.
 *
 * @alpha
 */
export interface DashboardKpiWidgetFilterSettingsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED";
    readonly payload: {
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
    };
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
 * @alpha
 */
export const isDashboardKpiWidgetFilterSettingsChanged = eventGuard<DashboardKpiWidgetFilterSettingsChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
);

//
//
//

/**
 * This event is emitted when dashboard's KPI Widget has its comparison type changed. The event includes
 * the new definition of the KPI that has uses same measure as before however has new setup of the over-time
 * comparison.
 *
 * @alpha
 */
export interface DashboardKpiWidgetComparisonChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED";
    readonly payload: {
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
        readonly kpi: ILegacyKpi;
    };
}

export function kpiWidgetComparisonChanged(
    ctx: DashboardContext,
    ref: ObjRef,
    kpi: ILegacyKpi,
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
 * @alpha
 */
export const isDashboardKpiWidgetComparisonChanged = eventGuard<DashboardKpiWidgetComparisonChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
);

//
//
//

/**
 * This event is emitted after any change to KPI Widget configuration. It contains the entire new state of the
 * KPI Widget.
 *
 * @alpha
 */
export interface DashboardKpiWidgetChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED";
    readonly payload: {
        /**
         *
         */
        kpiWidget: IKpiWidget | IKpiWidgetDefinition;
    };
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
 * @alpha
 */
export const isDashboardKpiWidgetChanged = eventGuard<DashboardKpiWidgetChanged>(
    "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED",
);

//
//
//

/**
 * This event is emitted after execution of a KPI widget starts.
 *
 * @alpha
 */
export interface DashboardKpiWidgetExecutionStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_STARTED";
    readonly payload: {
        widgetRef: ObjRef;
    };
}

/**
 * @alpha
 */
export function kpiWidgetExecutionStarted(
    widgetRef: ObjRef,
    correlationId?: string,
): DashboardEventBody<DashboardKpiWidgetExecutionStarted> {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_STARTED",
        correlationId,
        payload: {
            widgetRef,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetExecutionStarted}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardKpiWidgetExecutionStarted = eventGuard<DashboardKpiWidgetExecutionStarted>(
    "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_STARTED",
);

/**
 * This event is emitted after execution of a KPI widget fails.
 *
 * @alpha
 */
export interface DashboardKpiWidgetExecutionFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_FAILED";
    readonly payload: {
        widgetRef: ObjRef;
        error: GoodDataSdkError;
    };
}

/**
 * @alpha
 */
export function kpiWidgetExecutionFailed(
    widgetRef: ObjRef,
    error: GoodDataSdkError,
    correlationId?: string,
): DashboardEventBody<DashboardKpiWidgetExecutionFailed> {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_FAILED",
        correlationId,
        payload: {
            widgetRef,
            error,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetExecutionFailed}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardKpiWidgetExecutionFailed = eventGuard<DashboardKpiWidgetExecutionFailed>(
    "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_FAILED",
);

/**
 * This event is emitted after execution of a KPI widget succeeds.
 *
 * @alpha
 */
export interface DashboardKpiWidgetExecutionSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_SUCCEEDED";
    readonly payload: {
        widgetRef: ObjRef;
    };
}

/**
 * @alpha
 */
export function kpiWidgetExecutionSucceeded(
    widgetRef: ObjRef,
    correlationId?: string,
): DashboardEventBody<DashboardKpiWidgetExecutionSucceeded> {
    return {
        type: "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_SUCCEEDED",
        correlationId,
        payload: {
            widgetRef,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardKpiWidgetExecutionSucceeded}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardKpiWidgetExecutionSucceeded = eventGuard<DashboardKpiWidgetExecutionSucceeded>(
    "GDC.DASH/EVT.KPI_WIDGET.EXECUTION_SUCCEEDED",
);
