// (C) 2021-2022 GoodData Corporation

import { IInsightDefinition, ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base.js";

/**
 * Given a reference to a widget, this query will obtain the filters that should be used when executing it.
 * These will respect the ignored filters on widget level as well as the filters specified in the insight itself.
 * Filters returned by this query should be used with {@link @gooddata/sdk-model#insightSetFilters} to obtain
 * insight that is ready for execution or used to execute a KPI.
 *
 * @alpha
 */
export interface QueryWidgetFilters extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.WIDGET.FILTERS";
    readonly payload: {
        readonly widgetRef: ObjRef;
        readonly insight?: IInsightDefinition | null;
    };
}

/**
 * Creates action thought which you can query dashboard component for filters that should be used by a given widget.
 *
 * @param widgetRef - reference to insight widget
 * @param insight - specify insight to evaluate the filters for in context of the widget.
 *  If null, InsightWidgets will ignore the insight the are referencing.
 *  If not specified, InsightWidgets will default to the insights they reference, Custom- and KpiWidgets will ignore it.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function queryWidgetFilters(
    widgetRef: ObjRef,
    insight?: IInsightDefinition | null,
    correlationId?: string,
): QueryWidgetFilters {
    return {
        type: "GDC.DASH/QUERY.WIDGET.FILTERS",
        correlationId,
        payload: {
            widgetRef,
            insight,
        },
    };
}

/**
 * This query base on given kpi widgetRef calculate BrokenAlertFilterBasicInfo {@link IBrokenAlertFilterBasicInfo}
 * In case any broken alert filters query return empty array.
 * @alpha
 */
export interface QueryWidgetBrokenAlerts extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.WIDGET.BROKEN_ALERTS";
    readonly payload: {
        readonly widgetRef: ObjRef;
    };
}

/**
 *  Creates action thought which you can query dashboard component for broken alert filters.
 *
 * @param widgetRef - reference to insight kpi widget
 * @param correlationId - specify correlation id to use for this command.
 * @returns
 *
 * @alpha
 */
export function queryWidgetBrokenAlerts(widgetRef: ObjRef, correlationId?: string): QueryWidgetBrokenAlerts {
    return {
        type: "GDC.DASH/QUERY.WIDGET.BROKEN_ALERTS",
        correlationId,
        payload: {
            widgetRef,
        },
    };
}

/**
 * Given a reference to a KPI widget, this query will obtain the total number of alerts all the users have set on it.
 *
 * @alpha
 */
export interface QueryWidgetAlertCount extends IDashboardQuery {
    readonly type: "GDC.DASH/QUERY.WIDGET.ALERT_COUNT";
    readonly payload: {
        readonly widgetRef: ObjRef;
    };
}

/**
 * Creates action through which you can query dashboard component for information about the total number of alerts
 * all the users have set on a given KPI widget.
 *
 * @param widgetRef - reference to the KPI widget
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function queryWidgetAlertCount(widgetRef: ObjRef, correlationId?: string): QueryWidgetAlertCount {
    return {
        type: "GDC.DASH/QUERY.WIDGET.ALERT_COUNT",
        correlationId,
        payload: {
            widgetRef,
        },
    };
}
