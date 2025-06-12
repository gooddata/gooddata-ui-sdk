// (C) 2021-2025 GoodData Corporation

/**
 * @beta
 */
export type DashboardQueryType =
    | "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS"
    | "GDC.DASH/QUERY.INSIGHT.ATTRIBUTE.META"
    | "GDC.DASH/QUERY.MEASURE.DATE.DATASETS"
    | "GDC.DASH/QUERY.WIDGET.FILTERS"
    | "GDC.DASH/QUERY.WIDGET.BROKEN_ALERTS"
    | "GDC.DASH/QUERY.WIDGET.ALERT_COUNT"
    | "GDC.DASH/QUERY.CONNECTING.ATTRIBUTES"
    | "GDC.DASH/QUERY.DISPLAY.FORM.ATTRIBUTE"
    | "GDC.DASH/QUERY.DATA.SET.ATTRIBUTE"
    | "GDC.DASH/QUERY.ELEMENTS.ATTRIBUTE"
    | "GDC.DASH/QUERY.CONNECTED.ATTRIBUTES"
    | "GDC.DASH/QUERY.METRICS_AND_FACTS"
    | "GDC.DASH/QUERY.AVAILABLE.DATA.SETS.FOR.ITEMS";

/**
 * Base type for all dashboard queries. A dashboard query encapsulates how complex, read-only dashboard-specific logic
 * can be can be executed.
 *
 * @beta
 */
export interface IDashboardQuery {
    /**
     * Query type. Always starts with "GDC.DASH/QUERY".
     */
    readonly type: DashboardQueryType;

    /**
     * Correlation ID can be provided when creating a query. Events emitted during the query processing
     * will contain the same correlation ID.
     */
    readonly correlationId?: string;
}
