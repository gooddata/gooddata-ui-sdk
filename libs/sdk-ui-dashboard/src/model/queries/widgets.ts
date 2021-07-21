// (C) 2021 GoodData Corporation

import { IFilter, ObjRef } from "@gooddata/sdk-model";
import { IDashboardQuery } from "./base";

/**
 * Given a reference to an insight widget, this query will obtain the filters that should be used when executing the insight.
 * These will respect the ignored filters on widget level as well as the filters specified in the insight itself.
 * Filters returned by this query should be used with {@link @gooddata/sdk-model#insightSetFilters} to obtain
 * insight that is ready for execution.
 *
 * @alpha
 */
export interface QueryInsightWidgetFilters extends IDashboardQuery<IFilter[]> {
    readonly type: "GDC.DASH/QUERY.INSIGHT_WIDGET.FILTERS";
    readonly payload: {
        readonly widgetRef: ObjRef;
    };
}

/**
 * Creates action thought which you can query dashboard component for filters that should be used by a given insight widget.
 *
 * @param widgetRef - reference to insight widget
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function queryInsightWidgetFilters(
    widgetRef: ObjRef,
    correlationId?: string,
): QueryInsightWidgetFilters {
    return {
        type: "GDC.DASH/QUERY.INSIGHT_WIDGET.FILTERS",
        correlationId,
        payload: {
            widgetRef,
        },
    };
}
