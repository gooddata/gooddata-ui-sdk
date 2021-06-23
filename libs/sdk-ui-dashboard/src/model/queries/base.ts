// (C) 2021 GoodData Corporation

/**
 * @internal
 */
export type DashboardQueryType = "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS";

/**
 * @internal
 */
export interface IDashboardQuery<_TResult = any> {
    readonly type: DashboardQueryType;
}
