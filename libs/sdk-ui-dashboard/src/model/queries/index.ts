// (C) 2021 GoodData Corporation

import { QueryDateDatasetsForInsight } from "./insights";

export { IDashboardQuery, DashboardQueryType } from "./base";
export { QueryDateDatasetsForInsight, DateDatasetsForInsight, queryDateDatasetsForInsight } from "./insights";

/**
 * @internal
 */
export type DashboardQueries = QueryDateDatasetsForInsight;
