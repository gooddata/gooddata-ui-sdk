// (C) 2021 GoodData Corporation

import { IDashboardCommand } from "./base";
import { ObjRef } from "@gooddata/sdk-model";
import { ILegacyKpiComparisonDirection, ILegacyKpiComparisonTypeComparison } from "@gooddata/sdk-backend-spi";
import { WidgetFilterSettings, WidgetHeader } from "../types/widgetTypes";

/**
 * @alpha
 */
export interface ChangeKpiWidgetHeader extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER";
    readonly payload: {
        /**
         * KPI Widget reference whose measure to change.
         */
        readonly ref: ObjRef;

        /**
         * Header to use for the KPI widget. Contents of the provided header will be used as-is and will be
         * used to replace the current header values.
         */
        readonly header: WidgetHeader;
    };
}

/**
 * Creates the ChangeKpiWidgetHeader command. Dispatching this command will result in change of the KPI widget's
 * header which (now) includes title.
 *
 * @param ref - reference of the KPI widget to modify
 * @param header - new header to use
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeKpiWidgetHeader(
    ref: ObjRef,
    header: WidgetHeader,
    correlationId?: string,
): ChangeKpiWidgetHeader {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER",
        correlationId,
        payload: {
            ref,
            header,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface ChangeKpiWidgetMeasure extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE";
    readonly payload: {
        /**
         * KPI Widget reference whose measure to change.
         */
        readonly ref: ObjRef;

        /**
         * Reference to the new measure to use instead of the old measure.
         */
        readonly measureRef: ObjRef;

        /**
         * Optionally specify the new header that should be used for the KPI widget with the
         * changed measure.
         */
        readonly header?: WidgetHeader;
    };
}

/**
 * Creates the ChangeKpiWidgetMeasure command. Dispatching this command will result in change of the measure
 * used by the KPI.
 *
 * @param ref - reference of the KPI widget to modify
 * @param measureRef - reference of the measure to use
 * @param header - optionally specify new header to use; if not provided the existing header will be reused
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeKpiWidgetMeasure(
    ref: ObjRef,
    measureRef: ObjRef,
    header?: WidgetHeader,
    correlationId?: string,
): ChangeKpiWidgetMeasure {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE",
        correlationId,
        payload: {
            ref,
            measureRef,
            header,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface ChangeKpiWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: {
        /**
         * KPI Widget reference whose filter settings to change.
         */
        readonly ref: ObjRef;

        /**
         * Filter settings to apply for the widget. The settings are used as-is and
         * replace current widget settings.
         */
        readonly settings: WidgetFilterSettings;
    };
}

/**
 * Creates the ChangeKpiWidgetFilterSettings command. Dispatching this command will result in change of KPI widget's
 * filter settings; this includes change of data set used for date filter, disabling date filtering, ignoring
 * attribute filters that are defined on the dashboard for the widget.
 *
 * @param ref - reference of the KPI widget to modify
 * @param settings - new filter settings to apply
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeKpiWidgetFilterSettings(
    ref: ObjRef,
    settings: WidgetFilterSettings,
    correlationId?: string,
): ChangeKpiWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            settings,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export type KpiWidgetComparison = {
    /**
     * Type of comparison to do. May be period-over-period, previous period or no
     * comparison.
     *
     * TODO: explain PoP & previous period
     *
     * If not specified, defaults to no comparison.
     */
    comparisonType?: ILegacyKpiComparisonTypeComparison;

    /**
     * Customizes whether growth of the measure compared to previous period is considered
     * a good thing or a bad thing. This setting influences the visuals (red vs green indicators)
     */
    comparisonDirection?: ILegacyKpiComparisonDirection;
};

/**
 * @alpha
 */
export interface ChangeKpiWidgetComparison extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON";
    readonly payload: {
        /**
         * Reference to KPI Widget whose filter settings to change.
         */
        readonly ref: ObjRef;

        /**
         * Comparison settings to use for the KPI Widget.
         *
         * To disable comparison you can send empty object here.
         */
        readonly comparison: KpiWidgetComparison;
    };
}

/**
 * Creates the ChangeKpiWidgetComparison command. Dispatching this command will result in change of what comparison
 * method - if any - is used for the KPI's Measure. The KPI may compare measure value from current period (as selected
 * by the date filter) to previous period and then depending on whether the current value grows can visualize that
 * as a good or bad thing.
 *
 * @param ref - reference of the KPI widget to modify
 * @param comparison - new comparison setting
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeKpiWidgetComparison(
    ref: ObjRef,
    comparison: KpiWidgetComparison,
    correlationId?: string,
): ChangeKpiWidgetComparison {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON",
        correlationId,
        payload: {
            ref,
            comparison,
        },
    };
}

//
//
//

/**
 * @alpha
 */
export interface RefreshKpiWidget extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.KPI_WIDGET.REFRESH";
    readonly payload: {
        /**
         * Reference to KPI Widget to refresh.
         */
        readonly ref: ObjRef;
    };
}

/**
 * Creates the RefreshKpiWidget command. Dispatching this command will result in re-calculation of the KPI's value.
 *
 * @param ref - reference of the KPI widget to refresh
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function refreshKpiWidget(ref: ObjRef, correlationId?: string): RefreshKpiWidget {
    return {
        type: "GDC.DASH/CMD.KPI_WIDGET.REFRESH",
        correlationId,
        payload: {
            ref,
        },
    };
}
