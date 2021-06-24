// (C) 2021 GoodData Corporation

/**
 * @internal
 */
export type DashboardQueryType = "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS";

/**
 * Base type for all dashboard queries. A dashboard query encapsulates how complex, read-only dashboard-specific logic
 * can be can be executed.
 *
 * @internal
 */
export interface IDashboardQuery<_TResult = any> {
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
